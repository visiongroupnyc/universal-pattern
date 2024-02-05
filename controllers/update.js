const debug = require('debug')('up:controllers:update');
const UPFire = require('../libs/upfire');

function updateControllerFactory({
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
		let data = req.swagger.params.modeldata.value;
		const { _id } = { ...data };

		try {
			if (Application.hooks['*'] && Application.hooks['*'].beforeUpdate) {
				data = await Application.hooks['*'].beforeUpdate(req, data);
			}

			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeUpdate) {
				data = await Application.hooks[req.swagger.apiPath].beforeUpdate(req, data);
			}

			delete data._id;
			let updateDocument = await services.update(req.swagger.apiPath, _id, data, { updated: true, set: true });

			if (Application.hooks['*'] && Application.hooks['*'].afterUpdate) {
				updateDocument = await Application.hooks['*'].afterUpdate(req, { ...updateDocument });
			}

			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterUpdate) {
				updateDocument = await Application.hooks[req.swagger.apiPath].afterUpdate(req, { ...updateDocument });
			}

			if (req.swagger.definition['x-swagger-fire']) {
				await upFire(req, updateDocument);
			}
			// remove cache
			res.__clearCache = true;
			return res.json({ ...updateDocument });
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = updateControllerFactory;
