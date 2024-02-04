const { getDataByToken } = require('../helpers/jwt');

module.exports = (req, res, next) => {
	const token = req.headers.authorization;
	req.userData = null;
	if (token === '' || token === undefined || token === null) return next();
	return getDataByToken(token)
		.then((data) => {
			req.userData = data;
			return next();
		})
		.catch((err) => {
			console.error(err);
			next();
		});
};
