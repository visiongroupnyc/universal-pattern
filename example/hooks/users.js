const debug = require('debug')('up:example:hooks:users');

const encrypt = require('../helpers/encrypt');
const { generateSalt } = require('../helpers/salt');

const users = (upInstance) => {
	const {
		addHook,
	} = upInstance;

	addHook('/users', 'beforeInsert', async (req, document) => {
		debug('hook users.beforeInsert: ', document);
		const salt = generateSalt();
		document.password = encrypt(document.password, salt);
		document.active = true;
		document.level = 30;
		document.salt = salt;
		return document;
	});

	addHook('/users', 'afterInsert', async (req, document) => {
		debug('hook users.afterInsert: ', document);
		delete document.password;
		delete document.salt;
		return document;
	});
};

module.exports = users;
