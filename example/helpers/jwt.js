const jwt = require('jsonwebtoken');

const jwtsecret = process.env.JWT_SECRET || 'NoSecret';

const getDataByToken = async (token) => {
	const authText = token.split(' ');
	if (authText[0].trim().toUpperCase() !== 'BEARER:') return null;
	const ntoken = authText[1].trim();
	const verified = await jwt.verify(ntoken, jwtsecret);
	return verified;
};

const signJWT = (userData, secret = jwtsecret) => {
	const data = jwt.sign({
		email: userData.email,
		firstName: userData.firstName,
		lastName: userData.lastName,
		level: userData.level || 1,
	}, secret, { expiresIn: 60 * 60 * 24 * 7 });
	return data;
};

module.exports = {
	getDataByToken,
	signJWT,
};
