import { PostgresHelper } from "../../../infra/db/pg/postgres";
import type { Customer, Transaction } from "../dto/customer.dto";

interface CreateTransaction {
	cliente: Customer;
	tipo: "c" | "d";
	descricao: string;
	valor: number;
}

class CustomerRepository {
	async getCustomerTransactions(customerId: string) {
		const pg = await PostgresHelper.getConnection();

		const [customer] = await pg<
			Customer[]
		>`SELECT saldo, limite FROM clientes WHERE id = ${customerId}`;

		const transactions = await pg<
			Transaction[]
		>`SELECT * FROM transacoes WHERE cliente_id = ${customerId} ORDER BY realizada_em DESC LIMIT 10;`;

		return { customer, transactions };
	}

	async verifyCustomerExists(customerId: string) {
		const pg = await PostgresHelper.getConnection();
		const [customer] = await pg<
			Customer[]
		>`SELECT id FROM clientes WHERE id = ${customerId}`;

		return !!customer;
	}

	async createTransaction({
		cliente,
		descricao,
		tipo,
		valor,
	}: CreateTransaction) {
		const pg = await PostgresHelper.getConnection();
		pg.begin(async (sql) => {
			await sql`
				UPDATE clientes SET saldo = ${cliente.saldo} WHERE id = ${cliente.id}
			`;

			await sql`
				INSERT INTO transacoes
					(tipo, descricao, valor, cliente_id, realizada_em)
				VALUES (${tipo}, ${descricao}, ${valor}, ${cliente.id}, NOW());
			`;
		});
	}

	async getCustomer(customerId: string) {
		const pg = await PostgresHelper.getConnection();

		const [customer] = await pg<
			Customer[]
		>`SELECT * FROM clientes WHERE id = ${customerId}`;

		return customer;
	}
}

export { CustomerRepository };
