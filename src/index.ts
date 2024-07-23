import Debug from "debug";
import { readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import { randomUUID } from "node:crypto";
import vgMongo from "vg-mongo";
import yaml from "js-yaml";
import lodash from "lodash";
import path from "node:path";
import bodyParser from "body-parser";
import express, {
	type Request,
	type Response,
	type NextFunction,
	type Application,
} from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";

import { services } from "./services/index.js";
import { controllers } from "./controllers/index.js";
import { swaggerMetadata } from "./libs/swagger-metadata.js";
import { swaggerRouter } from "./libs/swagger-router.js";
import { GlobalHooks } from "./hooks/index.js";
import { cache } from "./libs/cache.js";

import { type TypeUniversalPattern } from "./types/UniversalPattern.js";
import { type TypeUniversalPatternOptions } from "./types/UniversalPatternOptions.js";

let internalStats: Record<string, any> = {};

const debug = Debug("up:index");

let db: any = null;

const getModule = (url: string): string =>
	url.replace("/", "").split("?").shift()?.split("/")?.shift() || "";

const addHook =
	(UP: TypeUniversalPattern) =>
	(endpoint: string, method: string, cb: Function) => {
		debug("adding hook: ", endpoint, method);
		if (!UP.hooks[endpoint]) {
			UP.hooks[endpoint] = {};
		}
		if (typeof UP.hooks[endpoint][method] === "function") {
			const prev = UP.hooks[endpoint][method];
			UP.hooks[endpoint][method] = async (req: Request, data: any) => {
				await prev(req, data);
				await cb(req, data);
				return data;
			};
		} else {
			UP.hooks[endpoint][method] = cb;
		}
	};

const registerController =
	(UP: TypeUniversalPattern) => (name: string, controller: () => void) => {
		debug("registering controller: ", name);
		if (name in UP.controllers) {
			throw new Error(`Controller ${name} already registered`);
		}
		UP.controllers[name] = controller;
	};

export async function universalPattern(
	options: TypeUniversalPatternOptions = {},
): Promise<TypeUniversalPattern> {
	const app: Application = express();
	const folder = path.join(__dirname, "./swagger");
	const defaultOptions: TypeUniversalPatternOptions = {
		swagger: {
			preMWS: [],
			postMWS: [],
			baseDoc: "/core",
			host: "localhost",
			apiDocs: "api-docs",
			folder,
			routes: {},
			info: {
				version: 2.0,
				title: "Server API",
				termsOfService: "https://visiongroup.nyc/terms",
				contact: {
					email: "cesar@visiongroup.nyc",
				},
				license: {
					name: "Apache 2.0",
					url: "https://www.apache.org/licenses/LICENSE-2.0.html",
				},
			},
		},
		compress: true,
		express,
		cors: true,
		production: true,
		routeController: async (
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			next();
		},
		port: options?.port || 3000,
		cache: false,
	};

	if (options.database) {
		debug("database setted ");
		if (!options?.database?.uri || options?.database?.uri === "") {
			throw new Error("Invalid database URI");
		}
		if (!options?.database?.name || options?.database?.name === "") {
			throw new Error("Invalid database name");
		}
	}

	if (options.database) {
		debug("database connected");
		db = await vgMongo(options.database.uri, options.database.name);
	}

	const localOptions = lodash.merge(defaultOptions, options);

	const UP: TypeUniversalPattern = {
		localOptions,
		db,
		getModule,
		instanceId: randomUUID(),
		hooks: {},
		controllers: {},
		services: {},
		insternalHooks: {},
		swagger: {},
		addHook: () => {},
		registerController: () => {},
	};

	if (localOptions?.enabledStats) {
		app.get("/stats", async (req: Request, res: Response) =>
			res.json(internalStats),
		);

		app.use(async (req: Request, res: Response, next: NextFunction) => {
			if (!process.isPrimary) {
				process.send({ cmd: "notifyRequest", instanceId: UP.instanceId });
			}
			next();
		});
	}

	app.use(cache(localOptions?.enabledStats));

	app.use(async (req: Request, res: Response, next: NextFunction) => {
		(req as any).instanceId = UP.instanceId;
		(req as any).db = db;
		next();
	});

	const urlencodeLimit = localOptions?.urlencoded?.limit || "1mb";
	app.use(bodyParser.urlencoded({ limit: urlencodeLimit, extended: false }));
	app.disable("view cache");
	const jsonLimit = localOptions?.bodyParser?.limit || "1mb";
	app.use(bodyParser.json({ limit: jsonLimit }));
	app.use(bodyParser.text());

	app.use(cookieParser());
	if (localOptions?.express) {
		if (localOptions?.express?.limit) {
			app.use(express.json({ limit: localOptions.express.limit }));
		}
		if (localOptions?.express?.static) {
			app.use(express.static(localOptions.express.static));
		}
	}
	localOptions.swagger.preMWS.forEach((mws: () => void) => app.use(mws));

	if (localOptions?.routes) {
		const { routes } = localOptions;
		Object.keys(routes).forEach((method) => {
			debug("additional route: ", method);
			Object.keys(routes[method]).forEach((url) => {
				(app as any)[method.toLowerCase()](url, routes[method][url]);
			});
		});
	}

	if (localOptions.compress) {
		app.use(compression({ level: 9 }));
	}
	if (localOptions.cors) {
		app.use(cors());
	}

	const yamlContent = [
		...readdirSync(localOptions.swagger.folder).map((file) => {
			if (file.split(".").pop() === "yaml") {
				return readFileSync(
					path.join(localOptions.swagger.folder, file),
					"utf8",
				).toString();
			}
			return false;
		}),
		readFileSync(
			path.join(__dirname, "./swagger", "index.yaml"),
			"utf8",
		).toString(),
	]
		.map((file) => yaml.load(file))
		.reduce((acc, current) => lodash.merge(acc, current), {});

	UP.swagger = lodash.merge({ ...yamlContent }, localOptions.swagger, {
		basePath: localOptions.swagger.baseDoc,
	});

	if (!localOptions.production) {
		app.use(
			`${localOptions.swagger.baseDoc}/docs/`,
			express.static(`${__dirname}/libs/swagger-ui`),
		);
		app.use(
			`${localOptions.swagger.baseDoc}/docs/`,
			(req: Request, res: Response) => {
				const content = readFileSync(
					`${__dirname}/libs/swagger-ui/index.tmp`,
				).toString();
				res.end(
					content.replace(
						"[[URL]]",
						`${localOptions.swagger.baseDoc}/api-docs`,
					),
				);
			},
		);
		app.use(
			`${localOptions.swagger.baseDoc}/api-docs`,
			(req: Request, res: Response) => res.json(UP.swagger),
		);
	}

	app.use(swaggerMetadata(UP));
	UP.services = services(UP);
	UP.controllers = controllers(UP);
	UP.addHook = addHook(UP);
	UP.registerController = registerController(UP);

	localOptions.swagger.postMWS.forEach((mws: () => void) => app.use(mws));

	/*
		Cluster or child
	*/
	if (cluster.isPrimary) {
		debug(
			`Primary ${process.pid} is running with instanceId: ${UP.instanceId}`,
		);

		const stats: Record<string, number> = {};
		const messageHandler = (msg: { cmd: string; instanceId: string }) => {
			if (msg.cmd && msg.cmd === "notifyNewFork") {
				stats[msg.instanceId] = 0;
			}

			if (msg.cmd && msg.cmd === "notifyRequest") {
				stats[msg.instanceId] += 1;
				for (const id in cluster.workers) {
					if (cluster.workers[id]) {
						cluster.workers[id].send({
							cmd: "notifyInternalStats",
							stats,
						});
					}
				}
			}
		};

		const numCPUs = availableParallelism();
		for (let i = 0; i < numCPUs; i += 1) {
			const forked = cluster.fork();
			forked.on("message", messageHandler);
		}
		cluster.on("exit", (worker: any) => {
			debug(`worker ${worker.process.pid} died`);
		});
	} else {
		process.send({ cmd: "notifyNewFork", instanceId: UP.instanceId });
		process.on("message", (msg: { cmd: string; stats: object }) => {
			if (msg.cmd && msg.cmd === "notifyInternalStats") {
				internalStats = msg.stats;
			}
		});
		const server = createServer(app);
		server.listen(localOptions.port);
		debug(`Worker ${process.pid} started with instanceId ${UP.instanceId}`);
	}

	debug(`ready on *:${localOptions.port}`);
	GlobalHooks(UP);
	return UP;
}
