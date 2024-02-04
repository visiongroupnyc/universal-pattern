const login = require('./login');

module.exports = (context) => ({
	login: login(context),
});
