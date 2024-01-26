const debug = require('debug')('up:services:findOne');
const { ObjectId } = require('vg-mongo');

function findOneFactory({
	getModule,
	db,
}) {
	return async (endpoint, query = {}, props = {}) => {
		debug('Called: ', endpoint, query, props);
		const collection = getModule(endpoint);
		if (query._id) query._id = new ObjectId(query._id);
		const result = await db[collection].findOne(query, props);
		return result;
	};
}

module.exports = findOneFactory;
