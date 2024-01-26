const debug = require('debug')('up:controllers:getLast');

function findOneControllerFactory({
	db,
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		if (!db) {
			throw new Error('Cant access to universal.* without MongoDB Connection');
		}

		const { _id } = req.query;
		try {
			const result = await services.getLast(req.swagger.apiPath, { _id });
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = findOneControllerFactory;
