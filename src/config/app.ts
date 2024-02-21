import type { Server } from "bun";
import { initializeRouter } from "./routes/routes";

export const initializeApp = (): Server => {
	const router = initializeRouter();

	const app = Bun.serve({
		port: process.env.PORT,
		fetch(req) {
			return router.handle(req) as Promise<Response>;
		},
	});

	return app;
};
