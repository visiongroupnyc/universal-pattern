const requestCache = {};

module.exports = (isStatsEnabled = false) => async (req, res, next) => {
	const returnJSON = res.json;
	if (isStatsEnabled && req.path === '/stats') return next();
	const key = `${req.method}:${req.path}`;
	res.json = (...args) => {
		returnJSON.apply(res, args);

		if (req.method === 'GET') {
			if (!requestCache[key]) requestCache[key] = {};
			requestCache[key][req.url] = args[0];
		} else {
			if (args[0].__clearCache) delete requestCache[key];
		}
	};

	if (req.method === 'GET' && requestCache?.[key]?.[req.url]) {
		return res.json(requestCache[key][req.url]);
	}

	return next();
};
