import { UPFire } from "../libs/upfire.js";
import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:controllers:remove");

type Services = {
	remove: (apiPath: string, _id: string) => Promise<any>;
};

type ApplicationHooks = {
	[key: string]: any;
};

type RemoveControllerFactoryOptions = {
	services: Services;
	Application: { hooks: ApplicationHooks; [key: string]: any };
	db: any;
};

type RemoveController = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export function removeControllerFactory({
	services,
	Application,
	db,
}: RemoveControllerFactoryOptions): RemoveController {
	debug("Factory called");
	const upFire = UPFire({
		db,
	});
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> => {
		debug("Called");

		const { _id } = req.query as { _id: string };

		try {
			if (Application.hooks["*"] && Application.hooks["*"].beforeRemove) {
				await Application.hooks["*"].beforeRemove(req, _id, Application);
			}
			if (
				Application.hooks[req.swagger.apiPath] &&
				Application.hooks[req.swagger.apiPath].beforeRemove
			) {
				await Application.hooks[req.swagger.apiPath].beforeRemove(req, _id);
			}

			let removedDocument = await services.remove(req.swagger.apiPath, _id);

			if (Application.hooks["*"] && Application.hooks["*"].afterRemove) {
				removedDocument = await Application.hooks["*"].afterRemove(req, {
					...removedDocument,
				});
			}
			if (
				Application.hooks[req.swagger.apiPath] &&
				Application.hooks[req.swagger.apiPath].afterRemove
			) {
				removedDocument = await Application.hooks[
					req.swagger.apiPath
				].afterRemove(req, { ...removedDocument });
			}

			if (req.swagger.definition["x-swagger-fire"]) {
				await upFire(req, removedDocument);
			}

			// remove cache
			(res as any).__clearCache = true;
			return res.json({ ...removedDocument });
		} catch (err) {
			return next(err);
		}
	};
}
