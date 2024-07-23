import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:controllers:today");

type Services = {
	today: (apiPath: string) => Promise<any>;
};

type TodayControllerFactoryOptions = {
	services: Services;
};

type TodayController = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export function todayControllerFactory({
	services,
}: TodayControllerFactoryOptions): TodayController {
	debug("Factory called");
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> => {
		debug("Called");

		try {
			const data = await services.today(req.swagger.apiPath);
			return res.json(data);
		} catch (err) {
			return next(err);
		}
	};
}
