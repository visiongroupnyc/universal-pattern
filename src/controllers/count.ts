import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:controllers:count");

type Services = {
	count: (apiPath: string, query: object) => Promise<any>;
};

type CountControllerFactoryOptions = {
	services: Services;
};

type CountController = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export function countControllerFactory({
	services,
}: CountControllerFactoryOptions): CountController {
	debug("Factory called");
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> => {
		debug("Called");
		try {
			const result = await services.count(req.swagger.apiPath, {});
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}
