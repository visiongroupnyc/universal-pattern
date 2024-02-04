const debug = require('debug')('up:libs:validators');

const validString = require('./strings');
const validObject = require('./objects');
const validNumber = require('./numbers');
const validBoolean = require('./booleans');
const validArray = require('./arrays');

const validateParameters = (req, params, level = {}) => {
	debug('validateParameters called: ', level);
	Object.entries(params)
		.forEach(([k, v]) => {
			debug('validating: ', k, v, level);
			try {
				let method = v.in === 'header' ? 'headers' : v.in || 'body';
				if (v.schema) {
					method = 'body';
				}
				if (!level[method]) level[method] = {};

				if (v?.schema?.type === 'object' && method === 'body') {
					level[method][k] = {
						value: {
							...validateParameters(req, v.schema.properties, {}),
						},
					};
					return level;
				}

				if (v.type === 'number' || v.type === 'integer') {
					const value = validNumber(req, method, k, v);
					level[method][k] = value;
					// level = { ...level, [method][k]: value };
					return level;
				}

				if (v.type === 'string') {
					const value = validString(req, method, k, v);
					level[method][k] = value;
					// level = { ...level, [k]: value };
					return level;
				}

				if (v.type === 'boolean') {
					const value = validBoolean(req, method, k, v);
					level[method][k] = value;
					// level = { ...level, [k]: value };
					return level;
				}

				if (v.type === 'array') {
					const value = validArray(req, method, k, v);
					level[method][k] = value;
					// level = { ...level, [k]: value };
					return level;
				}

				if (v.type === 'object') {
					const value = validObject(req, method, k, v);
					if (value) {
						// level = { ...level, [k]: value };
						level[method][k] = value;
						return level;
					}
				}

				if (v.type === 'file') {
					// Object.assign(level, { [k]: { value } });
					return level;
				}

				level = { ...level, [k]: req[method][k] };
				return level;
			} catch (err) {
				console.info('se cago validando: ', err);
				throw Error(`${err.toString()}`);
			}
		});

	return level;
};

module.exports = {
	validString,
	validObject,
	validNumber,
	validBoolean,
	validArray,
	validateParameters,
};
