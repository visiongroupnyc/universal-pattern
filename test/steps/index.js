const login = require('./login');
const delay = require('./delay');

module.exports = (context) => ({
	login: login(context),
	delay: delay(context),
});
