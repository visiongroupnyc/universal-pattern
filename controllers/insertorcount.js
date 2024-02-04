const debug = require('debug')('up:controllers:insertOrCount');
const UPFire = require('../libs/upfire');

function insertOrCountControllerFactory({
	services,
	lookupProcess,
	uniqueProcess,
	injectDefaultModel,
	Application,
	db,
}) {
	debug('Factory called');

	const upFire = UPFire({
		db,
	});
	return async (req, res, next) => {
		debug('Called');

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
			if (Application.hooks['*'] && Application.hooks['*'].beforeInsert) {
				params = await Application.hooks['*'].beforeInsert(req, params, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeInsert) {
				params = await Application.hooks[req.swagger.apiPath].beforeInsert(req, params, Application);
			}

			let doc = await services.insertOrCount(req.swagger.apiPath, injectDefaultModel(params, req));
			console.info('doc: ', doc);
			if (Application.hooks['*'] && Application.hooks['*'].afterInsert) {
				params = await Application.hooks['*'].afterInsert(req, params, Application);
			}

			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterInsert) {
				doc = await Application.hooks[req.swagger.apiPath].afterInsert(req, doc, Application);
			}

			if (req.swagger.definition['x-swagger-fire']) {
				await upFire(req, doc);
			}

			return res.json(doc);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = insertOrCountControllerFactory;
