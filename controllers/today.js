const debug = require('debug')('up:controllers:today');

function todayControllerFactory({
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');

		try {
			const data = await services.today(req.swagger.apiPath);
			return res.json(data);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = todayControllerFactory;
