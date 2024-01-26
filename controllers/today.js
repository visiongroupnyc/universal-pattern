const debug = require('debug')('up:controllers:today');

function todayControllerFactory({
	db,
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		if (!db) {
			throw new Error('Cant access to universal.* without MongoDB Connection');
		}

		try {
			const data = await services.today(req.swagger.apiPath);
			return res.json(data);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = todayControllerFactory;
