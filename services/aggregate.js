const debug = require('debug')('up:services:aggregate');

function aggregateFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, pipelines, options = undefined) => {
		debug('Called');
		const collection = getModule(endpoint);

		const result = await db[collection].aggregate(pipelines, options);
		return result;
	};
}

module.exports = aggregateFactory;
