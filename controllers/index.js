const debug = require('debug')('up:controllers');
const { ObjectId } = require('vg-mongo');

const searchControllerFactory = require('./search');
const findOneControllerFactory = require('./findone');
const insertControllerFactory = require('./insert');
const insertOrCountControllerFactory = require('./insertorcount');
const removeControllerFactory = require('./remove');
const updateControllerFactory = require('./update');
const todayControllerFactory = require('./today');

const controllers = (Application) => {
	debug('Called');
	const {
		services,
		db,
		getModule,
	} = Application;

	const injectDefaultModel = (model, req) => ({
		...model,
		_v: parseInt(req.swagger.params['x-swagger-model-version'], 10),
		_n: 0,
		_retry: 0,
		added: new Date(),
	});

	const lookupProcess = async (params, lookup) => {
		const fields = lookup.populate.reduce((a, b) => ({ ...a, [b]: 1 }), {});
		const data = await services.findOne(`/${lookup.collection}`, { _id: db.ObjectId(params[lookup.field]) }, fields);
		if (!data) throw new Error(`Invalid value ${lookup.field}(${params[lookup.field]}) for ${lookup.collection}`);
		params[lookup.collection] = data;
		if (data._id) {
			params[lookup.collection]._id = data._id.toString();
		}
		return Promise.resolve(data);
	};

	const uniqueProcess = async (params, unique) => {
		const collection = getModule(unique.apiPath);
		const data = await services.findOne(`/${collection}`, { [unique.field]: params[unique.field] }, { _id: 1 });
		if (data) {
			await db[collection].updateOne({ _id: new ObjectId(String(data._id)) }, { $inc: { _retry: 1 } });
			throw new Error(`Duplicate value for ${unique.field} field, should be unique`);
		}
	};

	return {
		'universal.insert': insertControllerFactory({
			db,
			getModule,
			services,
			lookupProcess,
			Application,
			uniqueProcess,
			injectDefaultModel,
		}),

		'universal.insertOrCount': insertOrCountControllerFactory({
			db,
			services,
			lookupProcess,
			uniqueProcess,
			injectDefaultModel,
		}),

		'universal.update': updateControllerFactory({
			db,
			services,
			Application,
		}),

		'universal.remove': removeControllerFactory({
			db,
			services,
			Application,
		}),

		'universal.today': todayControllerFactory({
			db,
			services,
		}),
		'universal.findOne': findOneControllerFactory({ db, services }),
		'universal.search': searchControllerFactory({ Application, db, services }),
	};
};

module.exports = controllers;
