import {
	ok,
	serverError,
	unprocessableEntity,
} from "../../../presentation/helpers/http.helper";
import type { BodyParser } from "../../../presentation/protocols/body-parser";
import type { Controller } from "../../../presentation/protocols/controller";
import type {
	HttpRequest,
	HttpResponse,
} from "../../../presentation/protocols/http";
import type { CustomerRepository } from "../repositories/customer.repository";
import { CreateTransactionUseCase } from "../usecases/create-transaction.usecase";

class CreateTransactionController implements Controller {
	constructor(
		private readonly bodyParser: BodyParser,
		private readonly customerRepository: CustomerRepository,
	) {}

	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		try {
			const parsedBody = await this.bodyParser.parse(httpRequest.body);
			const { id: customerId } = httpRequest.params;
			const customer = await this.customerRepository.getCustomer(
				String(customerId),
			);

			const { valor, tipo, descricao } = parsedBody;

			if (!["d", "c"].includes(String(tipo).toLowerCase())) {
				return unprocessableEntity({
					message: "O tipo deve ser c (Crédito) ou d (Débito)",
				});
			}

			if (!valor || valor < 0) {
				return unprocessableEntity({
					message: "O valor deve ser inteiro e positivo",
				});
			}

			if (!descricao || String(descricao).length > 10) {
				return unprocessableEntity({
					message: "A descrição deve ter até apenas 10 carácteres",
				});
			}

			if (tipo === "d" && customer.saldo - valor < -customer.limite) {
				return unprocessableEntity({
					message: "Transação de débito excede o limite disponível.",
				});
			}

			const createTransactionUseCase = new CreateTransactionUseCase(
				this.customerRepository,
			);
			const newBalance = await createTransactionUseCase.exec({
				cliente: customer,
				descricao,
				tipo,
				valor,
			});

			return ok({
				limite: customer.limite,
				saldo: newBalance,
			});
		} catch (error) {
			console.error(error);
			return serverError(error as Error);
		}
	}
}

export { CreateTransactionController };
