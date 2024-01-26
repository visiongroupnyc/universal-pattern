const debug = require('debug')('up:controllers:insertOrCount');

function insertOrCountControllerFactory({
	db,
	services,
	lookupProcess,
	uniqueProcess,
	injectDefaultModel,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		if (!db) {
			throw new Error('Cant access to universal.* without MongoDB Connection');
		}

		const params = req.swagger.params.modeldata.value;
		try {
			if (req.swagger.params.modeldata && req.swagger.params.modeldata['x-swagger-unique'] && req.swagger.params.modeldata['x-swagger-unique'].length > 0) {
				await Promise.all(
					req.swagger.params.modeldata['x-swagger-unique']
						.map((l) => uniqueProcess(params, {
							...l,
							apiPath: req.swagger.apiPath,
						})),
				);
			}

			if (req.swagger.params.modeldata && req.swagger.params.modeldata['x-swagger-lookup'] && req.swagger.params.modeldata['x-swagger-lookup'].length > 0) {
				await Promise.all(
					req.swagger.params.modeldata['x-swagger-lookup']
						.map((l) => lookupProcess(params, { ...l })),
				);
			}
			const doc = await services.insertOrCount(req.swagger.apiPath, injectDefaultModel(params, req));
			return res.json(doc);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = insertOrCountControllerFactory;
