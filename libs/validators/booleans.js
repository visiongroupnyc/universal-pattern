const debug = require('debug')('up:libs:validators:booleans');

const booleans = (req, method, prop, meta) => {
	debug('called: ', req.method, req.url, prop, meta);
	const p = req[method][prop];
	if (meta.required && !p) throw new Error(`require boolean: ${prop}`);

	if (p) {
		return Boolean(p);
	}
	return Boolean(meta.default);
};

module.exports = booleans;
