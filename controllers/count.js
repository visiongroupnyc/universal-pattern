const debug = require('debug')('up:controllers:count');

function countControllerFactory({
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		try {
			const result = await services.count(req.swagger.apiPath, { });
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = countControllerFactory;
