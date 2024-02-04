const path = require('node:path');
const helmet = require('helmet');

const up = require('../index');
const hooks = require('./hooks');
const controllers = require('./controllers');
const boot = require('./boot');
const headers = require('./mws/headers');
const decodejwt = require('./mws/decodejwt');

const swaggerFolder = path.join(process.cwd(), 'swagger');

const preMWS = [];
preMWS.push(
	helmet({
		noSniff: false,
	}),
);

preMWS.push(headers);
preMWS.push(decodejwt);

const params = {
	swagger: {
		baseDoc: process.env.BASEPATH,
		host: `${process.env.HOST}:${process.env.PORT}`,
		folder: swaggerFolder,
		info: {
			version: 2.0,
			title: 'Universal Pattern Example',
			termsOfService: 'www.domain.com/terms',
			contact: {
				email: 'cesar@visiongroup.nyc',
			},
			license: {
				name: 'Apache',
				url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
			},
		},
	},
	preMWS,
	postMWS: [],
	bodyParser: {
		json: { limit: '2mb' },
		urlencoded: { limit: '500mb', extended: false },
	},
	compress: true,
	express: {
		json: { limit: 10485760 },
		static: 'public',
	},
	cors: true,
	production: false,
	routeController: (req, res, next) => next(),
	port: process.env.PORT,
	database: {
		uri: process.env.CONNECTION,
		name: process.env.DBNAME,
	},
	enabledStats: true,
	cache: true,
};

async function init() {
	try {
		const upInstance = await up(params);
		controllers(upInstance);
		hooks(upInstance);
		boot(upInstance);
		console.info(`UP InstanceId: ${upInstance.instanceId}`);
	} catch (err) {
		console.error('Error initializing ', err);
	}
}

init();
