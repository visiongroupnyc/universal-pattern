const debug = require('debug')('up:services');
const searchFactory = require('./search');
const findOneFactory = require('./findone');
const insertFactory = require('./insert');
const insertOrCountFactory = require('./insertorcount');
const removeFactory = require('./remove');
const updateFactory = require('./update');


const services = (Application) => {
	const { db, getModule } = Application;
	if (!db) {
		const methods = [
			'search',
			'today',
			'insert',
			'findOne',
			'insertOrCount',
			'remove',
			'removeAll',
			'update',
			'updateByFilter',
			'count',
			'find',
			'getLast',
			'modify',
			'aggregate',
			'distinct',
		].reduce((acc, actual) => {
			acc[actual] = () => {
				throw new Error('DB no setted');
			};
			return acc;
		}, {});
		return methods;
	}

	return {
		search: searchFactory({ getModule, db }),
		today: async (endpoint) => {
			debug('.today called: ');

			return new Promise((resolve, reject) => {
				const collection = getModule(endpoint.replace('/today', ''));
				const p = {
					limit: 500,
					page: 1,
					sorting: '_id:desc',
				};

				const today = new Date();
				today.setHours(0, 0, 0);
				const tomorow = new Date(this.moment(today).add(1, 'days'));

				db[collection].paginate({ $and: [{ added: { $gte: today } }, { added: { $lte: tomorow } }] }, {}, p)
					.then(resolve)
					.catch(reject);
			});// end promise
		},

		insert: insertFactory({ db, getModule }),
		findOne: findOneFactory({ db, getModule }),
		insertOrCount: insertOrCountFactory({ db, getModule }),
		remove: removeFactory({ db, getModule }),

		removeAll: async (endpoint, query = { a: 1 }, opts = {}) => {
			const collection = getModule(endpoint);
			return db[collection].asyncRemove(query, opts);
		},
		update: updateFactory({
			getModule,
			db,
		}),

		updateByFilter: async (endpoint, query = {}, data, options = { updated: true, set: true }, opts = {}) => {
			debug('updateByFilter called: ', endpoint, query, data, options, opts);
			let rData = data;
			const collection = getModule(endpoint);
			if (options.updated) data.updated = new Date();
			if (options.set) rData = { $set: data };

			const updated = await db[collection].asyncUpdate(query, rData, { ...opts, multi: true });
			return updated;
		},

		count: async (endpoint, query, opts = {}) => {
			debug('count called');
			const collection = getModule(endpoint);
			const total = await db[collection].asyncCount(query, opts);
			return total;
		},

		getLast: async (endpoint, query = {}, fields = {}) => {
			const collection = getModule(endpoint);
			debug('.getLast: ', collection, query, fields);
			return new Promise((resolve, reject) => {
				db[collection].find(query, fields)
					.sort({ _id: 1 }, (err, doc) => {
						if (err) return reject(err);
						return resolve(doc.length > 0 ? doc.pop() : null);
					});
			});
		},

		find: async (endpoint, query = {}, fields = {}, opts = {}) => {
			const collection = getModule(endpoint);
			debug('.find called: ', collection, query);
			const data = await db[collection].asyncFind(query, fields, opts);
			return data;
		},

		distinct: async (endpoint, field = '_id', query = {}) => {
			const collection = getModule(endpoint);
			debug('.distinct called: ', collection, field, query);
			return new Promise((resolve, reject) => {
				db[collection].distinct(field, query, (err, docs) => {
					if (err) return reject(err);
					return resolve(docs);
				});
			});
		},
		modify: async (collection, _id, query) => {
			debug('.modify called:', query);
			return new Promise((resolve, reject) => {
				db[collection].update({ _id: db.ObjectId(_id) }, query, (err, doc) => (err ? reject(err) : resolve(doc)));
			});
		},
		aggregate: async (endpoint, pipelines, options = undefined) => {
			const collection = getModule(endpoint);
			debug('aggregate called: ', collection, pipelines);
			return new Promise((resolve, reject) => {
				db[collection].aggregate(pipelines, options, (err, docs) => {
					if (err) return reject(err);
					return resolve(docs);
				});
			});
		},
	};
};

module.exports = services;
