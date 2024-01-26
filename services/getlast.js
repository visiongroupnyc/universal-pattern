const debug = require('debug')('up:services:getLast');

function getLastFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint) => {
		debug('Called');
		const collection = getModule(endpoint);
		const result = await db[collection].findOne({}, {
			sort: { _id: -1 },
		});

		return result;
	};
}

module.exports = getLastFactory;
