const debug = require('debug')('up:index');

const {
	readFileSync,
	readdirSync,
} = require('node:fs');
const http = require('node:http');

const cluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');
const {
	randomUUID,
} = require('node:crypto');

const vgMongo = require('vg-mongo');

const yaml = require('js-yaml');
const lodash = require('lodash');
const path = require('node:path');
const bodyParser = require('body-parser');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const services = require('./services');
const controllers = require('./controllers');
const swaggerMetadata = require('./libs/swagger-metadata');
const swaggerRouter = require('./libs/swagger-router');

const GlobalHooks = require('./hooks');

let internalStats = {};
const requestCache = {};

let db = null;
const getModule = (url) => url.replace('/', '')
	.split('?')
	.shift()
	.split('/')
	.shift();

const addHook = (UP) => (endpoint, method, cb) => {
	debug('adding hook: ', endpoint, method);
	if (!UP.hooks[endpoint]) UP.hooks[endpoint] = {};
	if (typeof UP.hooks[endpoint][method] === 'function') {
		const prev = UP.hooks[endpoint][method];
		UP.hooks[endpoint][method] = async (req, data) => {
			await prev(req, data, cb);
			return data;
		};
	} else {
		UP.hooks[endpoint][method] = cb;
	}
};

const registerController = (UP) => (name, controller) => {
	debug('reginstering controller: ', name);
	if (name in UP.controllers) throw Error(`Controller ${name} already register`);
	UP.controllers[name] = controller;
};

async function universalPattern(options = {}) {
	const app = express();
	const folder = path.join(__dirname, './swagger');
	const defaultOptions = {
		swagger: {
			preMWS: [],
			postMWS: [],
			baseDoc: '/core',
			host: 'localhost',
			apiDocs: 'api-docs',
			folder,
			info: {
				version: 2.0,
				title: 'Server API',
				termsOfService: 'https://visiongroup.nyc/terms',
				contact: {
					email: 'cesar@visiongroup.nyc',
				},
				license: {
					name: 'Apache 2.0',
					url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
				},
			},
		},
		compress: true,
		express,
		cors: true,
		production: true,
		routeController: (req, res, next) => { next(); },
		port: options?.port || 3000,
	};

	if (options.database) {
		debug('database setted ');
		if (!options?.database?.uri || options?.database?.uri === '') throw new Error('Invalid database URI');
		if (!options?.database?.name || options?.database?.name === '') throw new Error('Invalid database name');
	}

	if (options.database) {
		debug('database connected');
		db = await vgMongo(options.database.uri, options.database.name);
	}

	const localOptions = lodash.merge(defaultOptions, options);

	const UP = {
		localOptions,
		db,
		// app,
		getModule,
		instanceId: randomUUID(),
	};

	app.use(async (req, res, next) => {
		const returnJSON = res.json;
		const key = `${req.metod}:${req.url}`;
		res.json = (...args) => {
			requestCache[key] = args[0];
			returnJSON.apply(res, args);
			if (args[0].__clearCache) delete requestCache[key];
		};

		if (requestCache[key]) {
			return res.json(requestCache[key]);
		}
		return next();
	});

	app.use((req, res, next) => {
		req.instanceId = UP.instanceId;
		next();
	});

	const urlencodeLimit = localOptions?.urlencoded?.limit || '1mb';
	app.use(bodyParser.urlencoded({ limit: urlencodeLimit, extended: false }));
	app.disable('view cache');
	const jsonLimit = localOptions?.bodyParser?.limit || '1mb';
	app.use(bodyParser.json({ limit: jsonLimit }));
	app.use(bodyParser.text());

	app.use(cookieParser());
	if (localOptions.express) {
		if (localOptions.express.limit) {
			app.use(express.json({ limit: localOptions.express.limit }));
		}
		if (localOptions.express.static) {
			app.use(express.static(localOptions.express.static));
		}
	}
	localOptions.preMWS.forEach((mws) => app.use(mws));

	if (localOptions.compress) app.use(compression({ level: 9 }));
	if (localOptions.compress) app.use(cors());

	const yamlContent = [...readdirSync(localOptions.swagger.folder)
		.map((file) => {
			if (file.split('.').pop() === 'yaml') {
				return readFileSync(path.join(localOptions.swagger.folder, file), 'utf8').toString();
			}
			return false;
		}), readFileSync(path.join(__dirname, './swagger', 'index.yaml'), 'utf8').toString()]
		.map((file) => yaml.load(file))
		.reduce((acc, current) => lodash.merge(acc, current), {});

	UP.swagger = lodash.merge({ ...yamlContent }, localOptions.swagger, { basePath: localOptions.swagger.baseDoc });

	if (!localOptions.production) {
		app.use(`${localOptions.swagger.baseDoc}/docs/`, express.static(`${__dirname}/libs/swagger-ui`));
		app.use(`${localOptions.swagger.baseDoc}/docs/`, (req, res) => {
			const content = readFileSync(`${__dirname}/libs/swagger-ui/index.tmp`).toString();
			res.end(content.replace('[[URL]]', `${localOptions.swagger.baseDoc}/api-docs`));
		});
		app.use(`${localOptions.swagger.baseDoc}/api-docs`, (req, res) => res.json(UP.swagger));
	}

	if (localOptions?.enabledStats) {
		app.get('/stats', async (req, res) => res.json(internalStats));

		app.use(async (req, res, next) => {
			if (!process.isPrimary) process.send({ cmd: 'notifyRequest', instanceId: UP.instanceId });
			next();
		});
	}

	app.use(swaggerMetadata(UP));
	UP.services = services(UP);
	UP.controllers = controllers(UP);
	UP.hooks = {};
	UP.insternalHooks = {};
	swaggerRouter({
		...UP,
		app,
		localOptions,
	});
	UP.addHook = addHook(UP);
	UP.registerController = registerController(UP);

	localOptions.postMWS.forEach((mws) => app.use(mws));

	/*
		Cluster or child
	*/
	if (cluster.isPrimary) {
		debug(`Primary ${process.pid} is running with instanceId: ${UP.instanceId}`);

		const stats = {};
		const messageHandler = (msg) => {
			if (msg.cmd && msg.cmd === 'notifyNewFork') {
				stats[msg.instanceId] = 0;
			}

			if (msg.cmd && msg.cmd === 'notifyRequest') {
				stats[msg.instanceId] += 1;
				for (const id in cluster.workers) {
					cluster.workers[id].send({
						cmd: 'notifyInternalStats',
						stats,
					});
				}
			}
		};

		for (let i = 0; i < numCPUs; i += 1) {
			const forked = cluster.fork();
			forked.on('message', messageHandler);
		}
		cluster.on('exit', (worker) => {
			debug(`worker ${worker.process.pid} died`);
		});
	} else {
		process.send({ cmd: 'notifyNewFork', instanceId: UP.instanceId });
		process.on('message', (msg) => {
			if (msg.cmd && msg.cmd === 'notifyInternalStats') {
				internalStats = msg.stats;
			}
		});
		const server = http.createServer(app);
		server.listen(defaultOptions.port);
		debug(`Worker ${process.pid} started with instanceId ${UP.instanceId}`);
	}

	debug(`ready on *:${defaultOptions.port}`);
	GlobalHooks(UP);
	return UP;
}

module.exports = universalPattern;
