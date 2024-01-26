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
			debug('called: ', endpoint);
			const q = {};
			q[params._criterial] = params[params._criterial];
			delete params._criterial;
			let documentId = null;
			// const document = await db[collection].findOne(q, {}, opts);

			// if (!document) {
				const inserted = await db[collection].insertOne(params, opts);
				documentId = inserted.insertedId;
			// } else {
				// documentId = document._id;
			// }

			// await db[collection].updateOne({ _id: new ObjectId(String(documentId)) }, { $inc: { _retry: 1 } }, opts);
			const finalDocument = await db[collection].findOne({ _id: new ObjectId(String(documentId)) }, {}, opts);
			return finalDocument;
		} catch (err) {
			throw new Error(err);
		}
	};
}

module.exports = insertOrCountFactory;
