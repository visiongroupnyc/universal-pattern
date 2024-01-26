const path = require('node:path');

const up = require('../index');

const swaggerFolder = path.join(process.cwd(), 'swagger');
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
				url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
			},
		},
	},
	compress: true,
	cors: true,
	production: false,
	routeController: (req, res, next) => next(),
	port: process.env.PORT,
	database: {
		uri: process.env.CONNECTION,
		name: process.env.DBNAME,
	},
};

async function init() {
	try {
		const upInstance = await up(params);
		console.info(`UP InstanceId: ${upInstance.instanceId}`);
	} catch (err) {
		console.error('Error initializing ', err);
	}
}

init();
