import type { NextFunction, RouterRequest } from "@config/routes/router";
import { CustomerRepository } from "../repositories/customer.repository";

export const userExistsMiddleware = async (
	req: RouterRequest,
	next: NextFunction,
) => {
	const customerRepository = new CustomerRepository();
	const userExists = await customerRepository.verifyCustomerExists(
		String(req.params.id),
	);

	if (!userExists)
		return new Response("Cliente não encontrado!", { status: 404 });
	next();
};
