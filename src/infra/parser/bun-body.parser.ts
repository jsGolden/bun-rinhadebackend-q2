import type { BodyParser } from "../../presentation/protocols/body-parser";

class BunBodyParser implements BodyParser {
	async parse(body: any): Promise<any> {
		if (!body || !(body instanceof ReadableStream)) return {};
		return Bun.readableStreamToJSON(body);
	}
}

export { BunBodyParser };
