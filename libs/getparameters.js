const debug = require('debug')('up:libs:getparameters');

const getParameters = (swagger, url, method) => {
	debug('called');
	const globalParameters = swagger.parameters;
	const localParameters = swagger.paths[url][method].parameters;
	if (localParameters) {
		let parameters = localParameters.map((p) => {
			if (p.$ref) {
				const k = p.$ref.replace('#/parameters/', '');
				const definition = globalParameters[k];
				if (!definition) throw new Error(`Parameter not found: ${p.$ref}`);
				return definition;
			}
			return p;
		});
		parameters = parameters.reduce((acc, current) => {
			if (current.schema) {
				if (current.schema.$ref) {
					const parts = current.schema.$ref.replace('#/', '').split('/');
					current.schema = swagger[parts[0]][parts[1]];
				}
			}
			return ({ ...acc, [current.name]: current });
		}, {});
		return parameters;
	}
	return {};
};

module.exports = getParameters;
