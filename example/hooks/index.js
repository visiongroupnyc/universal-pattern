const global = require('./global');
const users = require('./users');

module.exports = (upInstance) => {
	global(upInstance);
	users(upInstance);
};
