import { ok, serverError } from "../../../presentation/helpers/http.helper";
import type { BodyParser } from "../../../presentation/protocols/body-parser";
import type { Controller } from "../../../presentation/protocols/controller";
import type {
	HttpRequest,
	HttpResponse,
} from "../../../presentation/protocols/http";
import type { CustomerRepository } from "../repositories/customer.repository";

class BankStatementController implements Controller {
	constructor(private readonly customerRepository: CustomerRepository) {}

	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		try {
			const { id: customerId } = httpRequest.params;

			const { customer, transactions } =
				await this.customerRepository.getCustomerTransactions(
					String(customerId),
				);

			return ok({
				saldo: {
					total: customer.saldo,
					data_extrato: new Date(),
					limite: customer.limite,
				},
				ultimas_transacoes: transactions,
			});
		} catch (error) {
			console.error(error);
			return serverError(error as Error);
		}
	}
}

export { BankStatementController };
