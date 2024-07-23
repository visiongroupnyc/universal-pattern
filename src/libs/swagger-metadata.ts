import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:libs:swagger-metadata");

import { getParameters } from "./getparameters.js";
import { validateParameters } from "./validators/index.js";

type Swagger = {
	basePath: string;
	paths: { [key: string]: { [method: string]: any } };
};

type Application = {
	swagger: Swagger;
};

export const swaggerMetadata = (Application: Application) => {
	debug("swaggerMetadata Constructor called");
	const { swagger } = Application;
	const getPath = (url: string) =>
		url.split("?").shift()?.replace(swagger.basePath, "") || "";

	return (req: Request, res: Response, next: NextFunction) => {
		debug("mws called: ", req.method, req.url);
		const url = getPath(req.url);
		const method = req.method.toLowerCase();
		req.swagger = {
			params: {},
			apiPath: url,
		};

		if (swagger.paths[url] && swagger.paths[url][method]) {
			try {
				const data = getParameters(swagger, url, method);
				validateParameters(req, data, req.swagger.params);

				req.swagger.definition = swagger.paths[url][method];

				if (req.swagger.params.body) {
					req.swagger.params.modeldata = {
						value: {
							...req.swagger.params.body.modeldata.value.body,
						},
					};
				}

				if (data?.modeldata?.schema) {
					req.swagger.params.modeldata["x-swagger-unique"] = [];
					req.swagger.params.modeldata["x-swagger-lookup"] = [];

					if (data.modeldata.schema["x-swagger-model-version"]) {
						req.swagger.params["x-swagger-model-version"] =
							data.modeldata.schema["x-swagger-model-version"];
					} else {
						req.swagger.params["x-swagger-model-version"] = 2;
					}

					if (data.modeldata.schema.properties) {
						Object.keys(data.modeldata.schema.properties).forEach((key) => {
							const item = data?.modeldata?.schema?.properties[key];
							if (item["x-swagger-lookup"]) {
								req.swagger.params.modeldata["x-swagger-lookup"].push({
									...item["x-swagger-lookup"],
									field: key,
								});
							}

							if (item["x-swagger-unique"]) {
								req.swagger.params.modeldata["x-swagger-unique"].push({
									...item["x-swagger-unique"],
									field: key,
									item,
								});
							}
						});
					}
				}
				return next();
			} catch (error) {
				debug("Invalid request: ", req.url, req.swagger, error);
				return res.status(500).end(`${error}`);
			}
		}
		return next();
	};
};
