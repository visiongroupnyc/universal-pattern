const debug = require('debug')('up:services:insert');
const { ObjectId } = require('vg-mongo');

function insertFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, data, opts = {}) => {
		debug('Called');
		const collection = getModule(endpoint);
		const inserted = await db[collection].insertOne(data, opts);
		const finalDocument = await db[collection].findOne({ _id: new ObjectId(String(inserted.insertedId)) }, {}, opts);
		return finalDocument;
	};
}

module.exports = insertFactory;
