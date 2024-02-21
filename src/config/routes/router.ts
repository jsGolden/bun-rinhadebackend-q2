import url from "url";

type HTTP_METHODS = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HandlerFunction = (
	req: RouterRequest,
	next: NextFunction,
) => unknown;
export type NextFunction = () => unknown;

interface Handler {
	handlers: HandlerFunction[];
	regexPattern?: RegExp;
	method: HTTP_METHODS;
	path: string;
}

interface Middleware {
	handlers: HandlerFunction[];
	regexPattern?: RegExp;
	path: string;
	parentPath?: string;
}

export interface RouterRequest extends Request {
	params: { [key: string]: string | undefined };
}

class Router {
	private readonly routes: Handler[] = [];
	private readonly middlewares: Middleware[] = [];
	private readonly globalMiddlewares: HandlerFunction[] = [];

	get(path: string, ...handlers: HandlerFunction[]) {
		this.addRoute({ method: "GET", path, handlers });
	}

	post(path: string, ...handlers: HandlerFunction[]) {
		this.addRoute({ method: "POST", path, handlers });
	}

	use(...args: (Router | string | HandlerFunction)[]) {
		const [firstArg, secondArg, ...middlewares] = args;

		if (firstArg instanceof Router && !secondArg) {
			const router = firstArg;
			this.routes.push(...router.routes);
			this.middlewares.push(...router.middlewares);
			this.globalMiddlewares.push(...router.globalMiddlewares);
		} else if (typeof firstArg === "string" && secondArg instanceof Router) {
			const path = firstArg;
			const router = secondArg;

			const mappedRoutes = router.routes.map((route) => {
				const newPath = path + route.path;
				const newRegexPattern = this.buildRegexPattern(newPath);
				route.path = newPath;
				route.regexPattern = newRegexPattern;
				return route;
			});
			const mappedMiddlewares = router.middlewares.map((middleware) => {
				const newPath = path + middleware.path;
				const newRegexPattern = this.buildRegexPattern(newPath);
				middleware.path = newPath;
				middleware.regexPattern = newRegexPattern;
				return middleware;
			});

			this.routes.push(...mappedRoutes);
			this.middlewares.push(...mappedMiddlewares);
			if (router.globalMiddlewares.length) {
				this.middlewares.push({
					path,
					parentPath: path,
					regexPattern: this.buildRegexPattern(path),
					handlers: router.globalMiddlewares,
				});
			}
		} else if (typeof firstArg === "function" && !secondArg) {
			this.globalMiddlewares.push(firstArg);
		} else if (
			typeof firstArg === "string" &&
			typeof secondArg === "function"
		) {
			const path = firstArg;
			const handlers = [secondArg, ...middlewares] as HandlerFunction[];
			const regexPattern = this.buildRegexPattern(path);
			this.middlewares.push({ path, regexPattern, handlers });
		} else if (
			typeof firstArg === "function" &&
			typeof secondArg === "function"
		) {
			const handlers = args as HandlerFunction[];
			this.globalMiddlewares.push(...handlers);
		}
	}

	async handle(req: Request) {
		const globalResponse = await this.executeMiddlewares(
			this.globalMiddlewares,
			Object.assign(req, { params: {} }),
		);
		if (globalResponse) return globalResponse;

		const parsedUrl = url.parse(req.url, true);
		const path = String(parsedUrl.pathname);

		const matchedRoute = this.routes.find(
			(route) =>
				route.method === String(req.method).toUpperCase() &&
				(route.path === path || route.regexPattern?.test(path)),
		);

		if (!matchedRoute) {
			return new Response(`Cannot ${req.method} ${path}`, { status: 404 });
		}

		const urlParams = matchedRoute.regexPattern
			? path.match(matchedRoute.regexPattern)?.groups || {}
			: {};

		const httpRequest: RouterRequest = Object.assign(req, {
			params: urlParams,
		});

		const matchedLocalMiddlewares = this.middlewares.find(
			(mw) =>
				mw.path === path ||
				path.includes(mw.path) ||
				mw.regexPattern?.test(path),
		);

		if (matchedLocalMiddlewares) {
			const localMiddlewareResponse = await this.executeMiddlewares(
				matchedLocalMiddlewares.handlers,
				httpRequest,
			);

			if (localMiddlewareResponse) return localMiddlewareResponse;
		}

		return this.executeMiddlewares(matchedRoute.handlers, httpRequest);
	}

	private async executeMiddlewares(
		middlewares: HandlerFunction[],
		req: RouterRequest,
	) {
		async function runMiddleware(index: number) {
			const middleware = middlewares[index];
			if (!middleware) return;
			const response = await middleware(req, () => runMiddleware(index + 1));
			if (response instanceof Response) return response;
		}
		return await runMiddleware(0);
	}

	private addRoute({
		method,
		path,
		handlers,
	}: {
		method: HTTP_METHODS;
		path: string;
		handlers: HandlerFunction[];
	}) {
		const routeAlreadyExists = this.routes.find(
			(route) => route.path === path && route.method === method,
		);

		if (routeAlreadyExists) routeAlreadyExists.handlers.push(...handlers);
		else {
			const regexPattern = this.buildRegexPattern(path);
			this.routes.push({ method, path, handlers, regexPattern });
		}
	}

	private buildRegexPattern(path: string): RegExp | undefined {
		const hasURLParams = /:[^\/]+/g.test(path);
		const pattern = path.replace(/:([^/]+)/g, "(?<$1>[^/]+)");
		return hasURLParams ? new RegExp(`^${pattern}$`) : undefined;
	}
}

export { Router };
