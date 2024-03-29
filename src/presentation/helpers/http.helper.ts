import { ServerError } from "../errros/server.error";
import type { HttpResponse } from "../protocols/http";

export const badRequest = (error: Error): HttpResponse => ({
	statusCode: 400,
	body: error,
});

export const serverError = (error: Error): HttpResponse => ({
	statusCode: 500,
	body: new ServerError(error.stack),
});

export const ok = (data: any): HttpResponse => ({
	statusCode: 200,
	body: data,
});

export const unprocessableEntity = (data: any): HttpResponse => ({
	statusCode: 422,
	body: data,
});
