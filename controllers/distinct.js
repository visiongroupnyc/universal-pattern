const debug = require('debug')('up:controllers:distinct');

function distinctControllerFactory({
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');
		try {
			const { field } = req.query;
			const result = await services.distinct(req.swagger.apiPath, field);
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = distinctControllerFactory;
