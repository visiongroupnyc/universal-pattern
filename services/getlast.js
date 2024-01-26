const debug = require('debug')('up:services:getLast');

function getLastFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, query = {}, fields = {}) => {
		debug('Called');
		const collection = getModule(endpoint);
		const result = await db[collection].find(query, fields)
			.sort({ _id: 1 })
			.limit(1)
			.toArray();

		return result.length > 0 ? result[0] : null;
	};
}

module.exports = getLastFactory;
