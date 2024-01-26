const debug = require('debug')('up:services');
const searchFactory = require('./search');
const findOneFactory = require('./findone');
const insertFactory = require('./insert');
const insertOrCountFactory = require('./insertorcount');
const removeFactory = require('./remove');
const updateFactory = require('./update');
const getLastFactory = require('./getlast');
const todayFactory = require('./today');
const countFactory = require('./count');
const updateByFilterFactory = require('./updatebyfilter');
const removeAllFactory = require('./removeall');
const findFactory = require('./find');
const distinctFactory = require('./distinct');
const aggregateFactory = require('./aggregate');

const services = (Application) => {
	debug('Called');
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
		search: searchFactory({
			getModule,
			db,
		}),
		today: todayFactory({
			getModule,
			db,
		}),
		insert: insertFactory({
			db,
			getModule,
		}),
		findOne: findOneFactory({
			db,
			getModule,
		}),
		insertOrCount: insertOrCountFactory({
			db,
			getModule,
		}),
		getLast: getLastFactory({
			db,
			getModule,
		}),
		remove: removeFactory({
			db,
			getModule,
		}),
		removeAll: removeAllFactory({
			getModule,
			db,
		}),
		update: updateFactory({
			getModule,
			db,
		}),
		updateByFilter: updateByFilterFactory({
			getModule,
			db,
		}),
		count: countFactory({
			getModule,
			db,
		}),

		find: findFactory({
			getModule,
			db,
		}),
		distinct: distinctFactory({
			getModule,
			db,
		}),
		aggregate: aggregateFactory({
			getModule,
			db,
		}),
	};
};

module.exports = services;
