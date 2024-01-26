const debug = require('debug')('up:controllers:findOne');

function findOneControllerFactory({
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');

		const { _id } = req.query;
		try {
			const result = await services.findOne(req.swagger.apiPath, { _id });
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = findOneControllerFactory;
