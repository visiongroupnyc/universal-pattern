const debug = require('debug')('up:services:insert');

function insertFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, data, opts = {}) => {
		debug('Called');
		const collection = getModule(endpoint);
		data.added = new Date();
		const inserted = await db[collection].asyncInsert(data, opts);
		return inserted;
	};
}

module.exports = insertFactory;
