const debug = require('debug')('up:controllers:remove');
const UPFire = require('../libs/upfire');

function removeControllerFactory({
	services,
	Application,
	db,
}) {
	debug('Factory called');
	const upFire = UPFire({
		db,
	});
	return async (req, res, next) => {
		debug('Called');

		const { _id } = req.query;

		try {
			if (Application.hooks['*'] && Application.hooks['*'].beforeRemove) {
				await Application.hooks['*'].beforeRemove(req, _id, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeRemove) {
				await Application.hooks[req.swagger.apiPath].beforeRemove(req, _id);
			}

			let removedDocument = await services.remove(req.swagger.apiPath, _id);

			if (Application.hooks['*'] && Application.hooks['*'].afterRemove) {
				removedDocument = await Application.hooks['*'].afterRemove(req, { ...removedDocument });
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterRemove) {
				removedDocument = await Application.hooks[req.swagger.apiPath].afterRemove(req, { ...removedDocument });
			}

			if (req.swagger.definition['x-swagger-fire']) {
				await upFire(req, removedDocument);
			}

			// remove cache
			res.__clearCache = true;
			return res.json({ ...removedDocument });
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = removeControllerFactory;
