const generateSalt = () => `${(Math.random() + Math.random()).toString(32)}`;
const getSalt = (salt) => `${salt}`;

module.exports = {
	generateSalt,
	getSalt,
};
