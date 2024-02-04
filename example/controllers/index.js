const users = require('./users');

const controllers = (upInstance) => {
	users(upInstance);
};

module.exports = controllers;
