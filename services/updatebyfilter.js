const debug = require('debug')('up:services:updateByFilter');

function updateByFilterFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, query = {}, data, options = { updated: true, set: true }, opts = {}) => {
		debug('Called');
		let rData = data;
		const collection = getModule(endpoint);
		if (options.updated) data._updated = new Date();
		if (options.set) rData = { $set: data };

		const updated = await db[collection].updateMany(query, rData, { ...opts });
		return updated;
	};
}

module.exports = updateByFilterFactory;
