import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";
import { UPFire } from "../libs/upfire";

const debug = Debug("up:controllers:update");

type Services = {
	update: (
		apiPath: string,
		_id: string,
		data: object,
		options: { updated: boolean; set: boolean },
	) => Promise<any>;
};

type ApplicationHooks = {
	[key: string]: any;
};

type UpdateControllerFactoryOptions = {
	services: Services;
	Application: { hooks: ApplicationHooks; [key: string]: any };
	db: any;
};

type UpdateController = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export function updateControllerFactory({
	services,
	Application,
	db,
}: UpdateControllerFactoryOptions): UpdateController {
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
		let data = req.swagger.params.modeldata.value;
		const { _id } = { ...data };

		try {
			if (Application.hooks["*"] && Application.hooks["*"].beforeUpdate) {
				data = await Application.hooks["*"].beforeUpdate(req, data);
			}

			if (
				Application.hooks[req.swagger.apiPath] &&
				Application.hooks[req.swagger.apiPath].beforeUpdate
			) {
				data = await Application.hooks[req.swagger.apiPath].beforeUpdate(
					req,
					data,
				);
			}

			delete data._id;
			let updateDocument = await services.update(
				req.swagger.apiPath,
				_id,
				data,
				{ updated: true, set: true },
			);

			if (Application.hooks["*"] && Application.hooks["*"].afterUpdate) {
				updateDocument = await Application.hooks["*"].afterUpdate(req, {
					...updateDocument,
				});
			}

			if (
				Application.hooks[req.swagger.apiPath] &&
				Application.hooks[req.swagger.apiPath].afterUpdate
			) {
				updateDocument = await Application.hooks[
					req.swagger.apiPath
				].afterUpdate(req, {
					...updateDocument,
				});
			}

			if (req.swagger.definition["x-swagger-fire"]) {
				await upFire(req, updateDocument);
			}
			// remove cache
			(res as any).__clearCache = true;
			return res.json({ ...updateDocument });
		} catch (err) {
			return next(err);
		}
	};
}
