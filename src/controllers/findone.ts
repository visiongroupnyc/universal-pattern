import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:controllers:findOne");

type Services = {
	findOne: (apiPath: string, query: { _id: string }) => Promise<any>;
};

type FindOneControllerFactoryOptions = {
	services: Services;
};

type FindOneController = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export function findOneControllerFactory({
	services,
}: FindOneControllerFactoryOptions): FindOneController {
	debug("Factory called");
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> => {
		debug("Called");

		const { _id } = req.query as { _id: string };
		try {
			const result = await services.findOne(req.swagger.apiPath, { _id });
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}
