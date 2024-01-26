const debug = require('debug')('up:controllers:insert');

function insertControllerFactory({
	db,
	services,
	lookupProcess,
	Application,
	uniqueProcess,
	injectDefaultModel,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		if (!db) {
			throw new Error('Cant access to universal.* without MongoDB Connection');
		}

		let params = req.swagger.params.modeldata.value;

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

			if (params.startAt) {
				params.startAt = new Date(params.startAt);
			}

			if (params.endAt) {
				params.endAt = new Date(params.endAt);
			}

			if (Application.hooks['*'] && Application.hooks['*'].beforeInsert) {
				params = await Application.hooks['*'].beforeInsert(req, params, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeInsert) {
				params = await Application.hooks[req.swagger.apiPath].beforeInsert(req, params, Application);
			}

			let doc = await services.insert(req.swagger.apiPath, injectDefaultModel(params, req));
			if (Application.hooks['*'] && Application.hooks['*'].afterInsert) {
				params = await Application.hooks['*'].afterInsert(req, params, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterInsert) {
				doc = await Application.hooks[req.swagger.apiPath].afterInsert(req, doc, Application);
			}
			return res.json(doc);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = insertControllerFactory;
