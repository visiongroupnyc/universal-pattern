const debug = require('debug')('up:services:remove');

function removeFactory({
	getModule,
	db,
}) {
	return async (endpoint, _id, opts = {}) => {
		const collection = getModule(endpoint);
		debug(`remove called with id: ${JSON.stringify(_id)}`);
		const removed = await db[collection].asyncRemove({ _id: db.ObjectId(_id) }, opts);
		return removed;
	};
}

module.exports = removeFactory;
