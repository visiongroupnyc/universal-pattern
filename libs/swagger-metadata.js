const debug = require('debug')('up:libs:swagger-metadata');

const getParameters = require('./getparameters');
const {
	validateParameters,
} = require('./validators');

const swaggerMetadata = (Application) => {
	debug('swaggerMetadata Constructor called');
	const { swagger } = Application;
	const getPath = (url) => url.split('?').shift().replace(swagger.basePath, '');

	return (req, res, next) => {
		debug('mws called: ', req.method, req.url);
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
				const keys = Object.keys(req.body);
				if (keys.length > 0) {
					keys.forEach((k) => {
						if (!req.swagger.params.modeldata.value[k]) {
							req.swagger.params.modeldata.value[k] = req.body[k];
						}
					});
				}

				if (data?.modeldata?.schema) {
					debug('mws: with schema');
					req.swagger.params.modeldata['x-swagger-unique'] = [];
					req.swagger.params.modeldata['x-swagger-lookup'] = [];

					if (data.modeldata.schema['x-swagger-model-version']) {
						req.swagger.params['x-swagger-model-version'] = data.modeldata.schema['x-swagger-model-version'];
					} else {
						req.swagger.params['x-swagger-model-version'] = 2;
					}

					if (data.modeldata.schema.properties) {
						Object.keys(data.modeldata.schema.properties).forEach((key) => {
							const item = data?.modeldata?.schema?.properties[key];
							if (item['x-swagger-lookup']) {
								req.swagger.params.modeldata['x-swagger-lookup'].push({ ...item['x-swagger-lookup'], field: key });
							}

							if (item['x-swagger-unique']) {
								req.swagger.params.modeldata['x-swagger-unique'].push({ ...item['x-swagger-unique'], field: key, item });
							}
						});
					}
				}
				return next();
			} catch (error) {
				debug('Invalid request: ', req.url, req.swagger, error);
				return res.status(500).end(`${error}`);
			}
		}
		return next();
	};
};

module.exports = swaggerMetadata;
