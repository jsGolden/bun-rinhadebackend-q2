import type { RouterRequest } from "@config/routes/router";
import type { Controller } from "../../presentation/protocols/controller";
import type { HttpRequest } from "../../presentation/protocols/http";

export const adaptRoute = (controller: Controller) => {
	return async (req: RouterRequest): Promise<Response> => {
		const httpRequest: HttpRequest = {
			body: req.body,
			params: req.params,
		};

		const httpResponse = await controller.handle(httpRequest);
		if (httpResponse.statusCode < 400) {
			return Response.json(httpResponse.body, {
				status: httpResponse.statusCode,
			});
		}

		return Response.json(
			{ error: httpResponse.body.message },
			{ status: httpResponse.statusCode },
		);
	};
};
