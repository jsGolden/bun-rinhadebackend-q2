export interface HttpResponse {
	statusCode: number;
	body: any;
}

export interface HttpRequest {
	body?: any;
	params: { [key: string]: string | undefined };
}
