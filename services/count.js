const debug = require('debug')('up:services:count');

function countFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, query = {}) => {
		debug('Called');
		const collection = getModule(endpoint);
		const result = await db[collection].count(query);

		return result;
	};
}

module.exports = countFactory;
