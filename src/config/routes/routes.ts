import fg from "fast-glob";
import { Router } from "./router";

export const initializeRouter = (): Router => {
	const router = new Router();

	fg.sync("**/src/modules/**/routes/**.routes.ts").map(async (file) =>
		(await import(`../../../${file}`)).default(router),
	);

	return router;
};
