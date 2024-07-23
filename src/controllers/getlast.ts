import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:controllers:getLast");

type Services = {
	getLast: (apiPath: string) => Promise<any>;
};

type GetLastControllerFactoryOptions = {
	services: Services;
};

type GetLastController = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export function getLastControllerFactory({
	services,
}: GetLastControllerFactoryOptions): GetLastController {
	debug("Factory called");
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> => {
		debug("Called");

		try {
			const result = await services.getLast(req.swagger.apiPath);
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}
