const debug = require('debug')('up:services');
const searchFactory = require('./search');
const findOneFactory = require('./findone');
const insertFactory = require('./insert');
const insertOrCountFactory = require('./insertorcount');
const removeFactory = require('./remove');
const updateFactory = require('./update');
const getLastFactory = require('./getlast');
const todayFactory = require('./today');

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
		today: todayFactory({ getModule, db }),
		insert: insertFactory({ db, getModule }),
		findOne: findOneFactory({ db, getModule }),
		insertOrCount: insertOrCountFactory({ db, getModule }),
		getLast: getLastFactory({ db, getModule }),
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
