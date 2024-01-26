const debug = require('debug')('up:controllers');
const { ObjectId } = require('vg-mongo');

const searchControllerFactory = require('./search');
const findOneControllerFactory = require('./findone');
const insertControllerFactory = require('./insert');
const insertOrCountControllerFactory = require('./insertorcount');
const updateControllerFactory = require('./update');

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
		'universal.remove': async (req, res, next) => {
			const { _id } = req.swagger.params;
			debug('.remove called: ', _id);
			if (!db) {
				throw new Error('Cant access to universal.* without MongoDB Connection');
			}

			try {
				if (Application.hooks['*'] && Application.hooks['*'].beforeRemove) {
					await Application.hooks['*'].beforeRemove(req, _id, Application);
				}
				if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeRemove) {
					await Application.hooks[req.swagger.apiPath].beforeRemove(req, _id, Application);
				}

				let removedDocument = await services.findOne(req.swagger.apiPath, { _id: db.ObjectId(_id) }, {});
				const result = await services.remove(req.swagger.apiPath, _id);

				if (Application.hooks['*'] && Application.hooks['*'].afterRemove) {
					removedDocument = await Application.hooks['*'].afterRemove(req, { ...removedDocument, result }, Application);
				}
				if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterRemove) {
					removedDocument = await Application.hooks[req.swagger.apiPath].afterRemove(req, { ...removedDocument, result }, Application);
				}

				return res.json({ ...removedDocument, result });
			} catch (err) {
				return next(err);
			}
		},
		'universal.today': async (req, res, next) => {
			debug('.today called');
			if (!db) {
				throw new Error('Cant access to universal.* without MongoDB Connection');
			}

			try {
				const data = await services.today(req.swagger.apiPath);
				return res.json(data);
			} catch (err) {
				return next(err);
			}
		},
		'universal.findOne': findOneControllerFactory({ db, services }),
		'universal.search': searchControllerFactory({ Application, db, services }),
	};
};

module.exports = controllers;
