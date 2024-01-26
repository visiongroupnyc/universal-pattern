const debug = require('debug')('up:services:findOne');
const { ObjectId } = require('vg-mongo');

function findOneFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, query = {}, props = {}) => {
		debug('Called: ', endpoint, query, props);
		const collection = getModule(endpoint);
		if (query._id) query._id = new ObjectId(query._id);
		const options = {};
		if (props.projection) options.projection = { ...props.projection };
		if (props.skip) options.skip = { ...props.skip };
		if (props.sort) options.sort = { ...props.sort };
		if (props.limit) options.limit = { ...props.limit };
		const result = await db[collection].findOne(query, options);
		return result;
	};
}

module.exports = findOneFactory;
