const debug = require('debug')('up:controllers');
const { ObjectId } = require('vg-mongo');

const searchControllerFactory = require('./search');
const findOneControllerFactory = require('./findone');
const insertControllerFactory = require('./insert');
const removeControllerFactory = require('./remove');
const updateControllerFactory = require('./update');
const todayControllerFactory = require('./today');
const getLastControllerFactory = require('./getlast');
const countControllerFactory = require('./count');
const distinctControllerFactory = require('./distinct');

const controllers = (Application) => {
	debug('Called');
	const {
		services,
		db,
		getModule,
	} = Application;

	if (!db) {
		throw new Error('Cant access to universal.* without MongoDB Connection');
	}
	const injectDefaultModel = (model, req) => ({
		...model,
		_v: parseInt(req.swagger.params['x-swagger-model-version'], 10),
		_n: 0,
		_retry: 0,
		added: new Date(),
	});

	const lookupProcess = async (params, lookup) => {
		debug('lookupProcess called');
		const fields = lookup.populate.reduce((a, b) => ({ ...a, [b]: 1 }), {});
		if (!params[lookup.field]) throw new Error(`${lookup.field} is required`);
		if (params[lookup.field].length !== 24) throw new Error(`"${params[lookup.field]}" is not a ObjectId valid`);
		const data = await services.findOne(`/${lookup.collection}`, { _id: params[lookup.field] }, { projection: fields });
		if (!data) throw new Error(`Invalid value ${lookup.field}(${params[lookup.field]}) for ${lookup.collection}`);
		params[lookup.collection] = data;
		if (data._id) {
			params[lookup.collection]._id = data._id.toString();
		}
		return data;
	};

	const uniqueProcess = async (params, unique) => {
		debug('uniqueProcess called');
		const collection = getModule(unique.apiPath);
		const data = await services.findOne(`/${collection}`, { [unique.field]: params[unique.field] }, {
			projection: { _id: 1 },
		});
		if (data) {
			await db[collection].updateOne({ _id: new ObjectId(String(data._id)) }, { $inc: { _retry: 1 } });
			throw new Error(`Duplicate value for ${unique.field} field, should be unique`);
		}
	};

	return {
		'universal.insert': insertControllerFactory({
			getModule,
			services,
			lookupProcess,
			Application,
			uniqueProcess,
			injectDefaultModel,
			db,
			action: 'insert',
		}),

		'universal.insertOrCount': insertControllerFactory({
			services,
			lookupProcess,
			uniqueProcess,
			injectDefaultModel,
			Application,
			db,
			action: 'insertOrCount',
		}),

		'universal.update': updateControllerFactory({
			services,
			Application,
			db,
		}),

		'universal.remove': removeControllerFactory({
			services,
			Application,
			db,
		}),

		'universal.today': todayControllerFactory({
			services,
		}),
		'universal.findOne': findOneControllerFactory({
			services,
		}),
		'universal.search': searchControllerFactory({
			Application,
			services,
			db,
		}),
		'universal.getLast': getLastControllerFactory({
			services,
		}),
		'universal.count': countControllerFactory({
			services,
		}),
		'universal.distinct': distinctControllerFactory({
			services,
		}),
	};
};

module.exports = controllers;
