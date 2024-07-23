import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:controllers:distinct");

type Services = {
	distinct: (apiPath: string, field: string) => Promise<any>;
};

type DistinctControllerFactoryOptions = {
	services: Services;
};

type DistinctController = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export function distinctControllerFactory({
	services,
}: DistinctControllerFactoryOptions): DistinctController {
	debug("Factory called");
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> => {
		debug("Called");
		try {
			const { field } = req.query as { field: string };
			const result = await services.distinct(req.swagger.apiPath, field);
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}
