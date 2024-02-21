import postgres from "postgres";

export const PostgresHelper = {
	client: null as unknown as postgres.Sql,
	uri: "",

	async connect(uri: string) {
		this.uri = uri;
		this.client = postgres(uri, { max: 600 });
		return this.isConnected();
	},

	async disconnect(): Promise<void> {
		if (!this.client) return;
		await this.client.end();
	},

	async isConnected(): Promise<boolean> {
		if (!this.client) return false;
		try {
			const [result] = await this.client`SELECT 1`;
			return !!result;
		} catch (error) {
			return false;
		}
	},

	async getConnection(): Promise<postgres.Sql> {
		const isConnected = await this.isConnected();
		if (isConnected) return this.client;
		await this.connect(this.uri);
		return this.client;
	},
};
