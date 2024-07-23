import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";
import { UPFire } from "../libs/upfire.js";

const debug = Debug("up:controllers:insert");

type Services = {
	insert: (apiPath: string, data: object) => Promise<any>;
	insertOrCount: (apiPath: string, data: object) => Promise<any>;
};

type LookupProcess = (params: any, lookup: any) => Promise<any>;

type UniqueProcess = (params: any, unique: any) => Promise<any>;

type InjectDefaultModel = (model: any, req: Request) => any;

type InsertControllerFactoryOptions = {
	services: Services;
	lookupProcess: LookupProcess;
	Application: any;
	uniqueProcess: UniqueProcess;
	injectDefaultModel: InjectDefaultModel;
	db: any;
	action?: "insert" | "insertOrCount";
};

export function insertControllerFactory({
	services,
	lookupProcess,
	Application,
	uniqueProcess,
	injectDefaultModel,
	db,
	action = "insert",
}: InsertControllerFactoryOptions) {
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

		try {
			let params = req.swagger.params.modeldata.value;

			if (
				req.swagger.params.modeldata &&
				req.swagger.params.modeldata["x-swagger-unique"] &&
				req.swagger.params.modeldata["x-swagger-unique"].length > 0
			) {
				await Promise.all(
					req.swagger.params.modeldata["x-swagger-unique"].map((l: any) =>
						uniqueProcess(params, {
							...l,
							apiPath: req.swagger.apiPath,
						}),
					),
				);
			}

			if (
				req.swagger.params.modeldata &&
				req.swagger.params.modeldata["x-swagger-lookup"] &&
				req.swagger.params.modeldata["x-swagger-lookup"].length > 0
			) {
				await Promise.all(
					req.swagger.params.modeldata["x-swagger-lookup"].map((l: any) =>
						lookupProcess(params, { ...l }),
					),
				);
			}

			if (params.startAt) {
				params.startAt = new Date(params.startAt);
			}

			if (params.endAt) {
				params.endAt = new Date(params.endAt);
			}

			if (Application.hooks["*"] && Application.hooks["*"].beforeInsert) {
				params = await Application.hooks["*"].beforeInsert(req, params);
			}
			if (
				Application.hooks[req.swagger.apiPath] &&
				Application.hooks[req.swagger.apiPath].beforeInsert
			) {
				params = await Application.hooks[req.swagger.apiPath].beforeInsert(
					req,
					params,
				);
			}

			let doc = null;
			if (action === "insert") {
				doc = await services.insert(
					req.swagger.apiPath,
					injectDefaultModel(params, req),
				);
			} else {
				doc = await services.insertOrCount(
					req.swagger.apiPath,
					injectDefaultModel(params, req),
				);
			}

			if (Application.hooks["*"] && Application.hooks["*"].afterInsert) {
				doc = await Application.hooks["*"].afterInsert(req, doc);
			}

			if (
				Application.hooks[req.swagger.apiPath] &&
				Application.hooks[req.swagger.apiPath].afterInsert
			) {
				doc = await Application.hooks[req.swagger.apiPath].afterInsert(
					req,
					doc,
				);
			}
			if (req.swagger.definition["x-swagger-fire"]) {
				await upFire(req, doc);
			}
			// remove cache
			(res as any).__clearCache = true;
			return res.json(doc);
		} catch (err) {
			return next(err);
		}
	};
}
