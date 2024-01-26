const debug = require('debug')('up:services:insert');

function insertFactory({
	getModule,
	db,
}) {
	return async (endpoint, data, opts = {}) => {
		const collection = getModule(endpoint);
		data.added = new Date();
		debug(`insert called: ${JSON.stringify(data)}`);
		const inserted = await db[collection].asyncInsert(data, opts);
		return inserted;
	};
}

module.exports = insertFactory;
