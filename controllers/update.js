const debug = require('debug')('up:controllers:update');

function updateControllerFactory({
	db,
	services,
	Application,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		let data = req.swagger.params.modeldata.value;
		const { _id } = { ...data };

		debug('.update called: ', data);
		if (!db) {
			throw new Error('Cant access to universal.* without MongoDB Connection');
		}

		try {
			if (Application.hooks['*'] && Application.hooks['*'].beforeUpdate) {
				data = await Application.hooks['*'].beforeUpdate(req, data, Application);
			}

			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeUpdate) {
				data = await Application.hooks[req.swagger.apiPath].beforeUpdate(req, data, Application);
			}

			delete data._id;
			let updateDocument = await services.update(req.swagger.apiPath, _id, data, { updated: true, set: true });

			if (Application.hooks['*'] && Application.hooks['*'].afterUpdate) {
				updateDocument = await Application.hooks['*'].afterUpdate(req, { ...updateDocument }, Application);
			}

			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterUpdate) {
				updateDocument = await Application.hooks[req.swagger.apiPath].afterUpdate(req, { ...updateDocument }, Application);
			}

			return res.json({ ...updateDocument });
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = updateControllerFactory;