import { BunBodyParser } from "../../../infra/parser/bun-body.parser";
import type { Controller } from "../../../presentation/protocols/controller";
import { BankStatementController } from "../controllers/bank-statement.controller";
import { CustomerRepository } from "../repositories/customer.repository";

export const makeBankStatementController = (): Controller => {
	//const bunBodyParser = new BunBodyParser();
	const customerRepository = new CustomerRepository();
	return new BankStatementController(customerRepository);
};
