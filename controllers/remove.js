const debug = require('debug')('up:controllers:remove');

function removeControllerFactory({
	db,
	services,
	Application,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		if (!db) {
			throw new Error('Cant access to universal.* without MongoDB Connection');
		}

		const { _id } = req.query;

		try {
			if (Application.hooks['*'] && Application.hooks['*'].beforeRemove) {
				await Application.hooks['*'].beforeRemove(req, _id, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeRemove) {
				await Application.hooks[req.swagger.apiPath].beforeRemove(req, _id, Application);
			}

			let removedDocument = await services.remove(req.swagger.apiPath, _id);

			if (Application.hooks['*'] && Application.hooks['*'].afterRemove) {
				removedDocument = await Application.hooks['*'].afterRemove(req, { ...removedDocument }, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterRemove) {
				removedDocument = await Application.hooks[req.swagger.apiPath].afterRemove(req, { ...removedDocument }, Application);
			}

			return res.json({ ...removedDocument });
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = removeControllerFactory;
