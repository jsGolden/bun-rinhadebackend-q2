import type { Customer } from "../dto/customer.dto";
import type { CustomerRepository } from "../repositories/customer.repository";

interface CreateTransaction {
	cliente: Customer;
	tipo: "c" | "d";
	descricao: string;
	valor: number;
}

class CreateTransactionUseCase {
	constructor(private readonly customerRepository: CustomerRepository) {}

	async exec({
		cliente,
		descricao,
		tipo,
		valor,
	}: CreateTransaction): Promise<number> {
		if (tipo === "c") {
			cliente.saldo += valor;
		} else {
			cliente.saldo -= valor;
		}

		await this.customerRepository.createTransaction({
			cliente,
			descricao,
			tipo,
			valor,
		});

		return cliente.saldo;
	}
}

export { CreateTransactionUseCase };
