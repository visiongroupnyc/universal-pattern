const crypto = require('crypto');

module.exports = (plainPassword, salt) => {
	const buffsalt = new Buffer.from(salt, 'base64');
	const hashedPassword = crypto.pbkdf2Sync(plainPassword, buffsalt, 10000, 64, 'SHA1').toString('base64');
	return hashedPassword;
};
