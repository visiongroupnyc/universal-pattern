const { randomUUID } = require('node:crypto');

const generateSalt = () => `${randomUUID()}`;
const getSalt = (salt) => `${salt}`;

module.exports = {
	generateSalt,
	getSalt,
};
