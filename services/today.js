const debug = require('debug')('up:services:findOne');
const moment = require('moment');

function todayFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, opts = { limit: 10000, sort: '_id:desc' }) => {
		debug('Called');

		const collection = getModule(endpoint.replace('/today', ''));

		const today = new Date();
		today.setHours(0, 0, 0);
		const tomorow = new Date(moment(today).add(1, 'days'));

		const query = { $and: [{ added: { $gte: today } }, { added: { $lte: tomorow } }] };
		const result = await db[collection].find(query, opts).toArray();
		return result;
	};
}

module.exports = todayFactory;
