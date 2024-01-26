const debug = require('debug')('up:services:update');
const { ObjectId } = require('vg-mongo');

function updateFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, _id, data = {}, options = { updated: true, set: true }, opts = {}) => {
		debug('Called');
		const collection = getModule(endpoint);
		let update = {};
		if (options.updated) {
			data._updated = new Date();
			delete update.update;
		}
		if (options.set) update = { $set: data };
		else update = data;

		const documentId = new ObjectId(_id);
		await db[collection].updateOne({ _id: documentId }, update, opts);
		await db[collection].updateOne({ _id: documentId }, {
			$inc: { _n: 1 },
		});

		const updateDocument = await db[collection].findOne({ _id: documentId });
		return updateDocument;
	};
}

module.exports = updateFactory;
