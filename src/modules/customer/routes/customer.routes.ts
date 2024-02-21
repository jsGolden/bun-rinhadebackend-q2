import { adaptRoute } from "@config/adapters/bun-route.adapter";
import { Router } from "@config/routes/router";
import { makeBankStatementController } from "../factories/bank-statement-controller.factory";
import { makeTransactionController } from "../factories/create-transaction-controller.factory";
import { userExistsMiddleware } from "../middlewares/verify-customer-exists.middleware";

export default (router: Router) => {
	const customerRouter = new Router();
	customerRouter.use(userExistsMiddleware);
	customerRouter.get("/:id/extrato", adaptRoute(makeBankStatementController()));
	customerRouter.post(
		"/:id/transacoes",
		adaptRoute(makeTransactionController()),
	);

	router.use("/clientes", customerRouter);
};
