const debug = require('debug')('up:services:distinct');

function countFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, field = '_id', query = {}) => {
		debug('Called');
		const collection = getModule(endpoint);
		const result = db[collection].distinct(field, query);
		return result;
	};
}

module.exports = countFactory;
