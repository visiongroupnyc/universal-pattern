const debug = require('debug')('up:services:remove');
const { ObjectId } = require('vg-mongo');

function removeFactory({
	getModule,
	db,
}) {
	debug('Factory called');
	return async (endpoint, _id) => {
		debug('Called');
		const collection = getModule(endpoint);
		const removedDocument = await db[collection].findOne({ _id: new ObjectId(_id) });
		if (!removedDocument) throw new Error('_id not found');
		const removedResult = await db[collection].deleteOne({ _id: new ObjectId(_id) });

		return {
			...removedDocument,
			result: removedResult,
		};
	};
}

module.exports = removeFactory;
