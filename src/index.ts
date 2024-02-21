import { initializeApp } from "@config/app";
import { PostgresHelper } from "./infra/db/pg/postgres";

PostgresHelper.connect(String(process.env.POSTGRES_URL)).then(() => {
	const app = initializeApp();
	console.log(`Server listening at ${app.hostname}:${app.port}`);
});
