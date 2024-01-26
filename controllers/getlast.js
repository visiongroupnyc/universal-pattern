const debug = require('debug')('up:controllers:getLast');

function findOneControllerFactory({
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');

		try {
			const result = await services.getLast(req.swagger.apiPath);
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = findOneControllerFactory;
