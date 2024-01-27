const debug = require('debug')('up:services:insertOrCount');
const { ObjectId } = require('vg-mongo');

function insertOrCountFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, params, opts = {}) => {
		debug('Called');
		try {
			const collection = getModule(endpoint);
			const q = {};
			q[params._criterial] = params[params._criterial];
			delete params._criterial;
			let documentId = null;
			const inserted = await db[collection].insertOne(params, opts);
			documentId = inserted.insertedId;

			const finalDocument = await db[collection].findOne({ _id: new ObjectId(String(documentId)) }, {}, opts);
			return finalDocument;
		} catch (err) {
			throw new Error(err);
		}
	};
}

module.exports = insertOrCountFactory;
