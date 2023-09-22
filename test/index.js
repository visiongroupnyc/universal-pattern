const env = require('dotenv');
const http = require('http');
const express = require('express');
const path = require('path');

const up = require('../index');

const app = express();
const server = http.createServer(app);

env.config();
const port = process.env.PORT;
const connection = process.env.CONNECTION;
const dbname = process.env.DBNAME;
const basepath = process.env.BASEPATH;
const hostname = process.env.HOSTNAME;

const params = {
	swagger: {
		baseDoc: basepath,
		host: `${hostname}:${port}`,
		folder: path.join(process.cwd(), 'swagger'),
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
	production: process.env.NODE_ENV === 'production',
	routeController: (req, res, next) => next(),
};

if (connection) {
	params.database = {
		uri: connection,
		name: dbname,
	};
}

up(app, params)
	.then(() => server.listen(port, () => console.info(`listen *:${port}`)))
	.catch((err) => console.error('Error initializing ', err));
