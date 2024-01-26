const debug = require('debug')('up:controllers');
const { ObjectId } = require('vg-mongo');

const searchControllerFactory = require('./search');
const findOneControllerFactory = require('./findone');
const insertControllerFactory = require('./insert');
const insertOrCountControllerFactory = require('./insertorcount');
const removeControllerFactory = require('./remove');

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
		'universal.update': async (req, res, next) => {
			let data = req.swagger.params.modeldata.value;
			const { _id } = { ...data };

			debug('.update called: ', data);
			if (!db) {
				throw new Error('Cant access to universal.* without MongoDB Connection');
			}

			try {
				if (Application.hooks['*'] && Application.hooks['*'].beforeUpdate) {
					data = await Application.hooks['*'].beforeUpdate(req, data, Application);
				}

				if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeUpdate) {
					data = await Application.hooks[req.swagger.apiPath].beforeUpdate(req, data, Application);
				}

				delete data._id;
				const result = await services.update(req.swagger.apiPath, _id, data, { updated: true, set: true });
				await services.update(req.swagger.apiPath, _id, {
					$inc: { _n: 1 },
				}, { updated: false, set: false });

				let updateDocument = await services.findOne(req.swagger.apiPath, { _id: db.ObjectId(_id) }, {});

				if (Application.hooks['*'] && Application.hooks['*'].afterUpdate) {
					updateDocument = await Application.hooks['*'].afterUpdate(req, { ...updateDocument, result }, Application);
				}
				if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterUpdate) {
					updateDocument = await Application.hooks[req.swagger.apiPath].afterUpdate(req, { ...updateDocument, result }, Application);
				}

				return res.json({ ...updateDocument, result });
			} catch (err) {
				return next(err);
			}
		},
		'universal.remove': removeControllerFactory({
			db,
			services,
			Application,
		}),
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
