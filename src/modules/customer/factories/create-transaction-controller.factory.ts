import { BunBodyParser } from "../../../infra/parser/bun-body.parser";
import type { Controller } from "../../../presentation/protocols/controller";
import { CreateTransactionController } from "../controllers/create-transaction.controller";
import { CustomerRepository } from "../repositories/customer.repository";

export const makeTransactionController = (): Controller => {
	const bodyParser = new BunBodyParser();
	const customerRepository = new CustomerRepository();
	return new CreateTransactionController(bodyParser, customerRepository);
};
