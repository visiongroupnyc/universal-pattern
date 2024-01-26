const debug = require('debug')('up:services:removeAll');

function removeAllFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, query = { a: 1 }, opts = {}) => {
		const collection = getModule(endpoint);
		const result = await db[collection].remove(query, opts);
		return result;
	};
}

module.exports = removeAllFactory;
