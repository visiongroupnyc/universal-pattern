const debug = require('debug')('up:services:find');
const { ObjectId } = require('vg-mongo');

function findFilterFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, query = {}, fields = {}, props = {}) => {
		debug('Called');
		const collection = getModule(endpoint);
		if (query._id) query._id = new ObjectId(query._id);
		const options = {};
		if (props.projection) options.projection = { ...props.projection };
		if (props.fields) options.projection = { ...fields };
		if (props.skip) options.skip = { ...props.skip };
		if (props.sort) options.sort = { ...props.sort };
		if (props.limit) options.limit = { ...props.limit };
		const result = await db[collection].find(query, options).toArray();
		return result;
	};
}

module.exports = findFilterFactory;
