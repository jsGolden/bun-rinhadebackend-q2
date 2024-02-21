interface BodyParser {
	parse: (body: any) => Promise<any>;
}

export type { BodyParser };
