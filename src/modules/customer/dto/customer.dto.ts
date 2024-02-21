export interface Customer {
	id: number;
	nome: string;
	limite: number;
	saldo: number;
}

export interface Transaction {
	id: number;
	tipo: "c" | "d";
	descricao: string;
	valor: number;
	cliente_id: number;
	realizada_em: Date;
}
