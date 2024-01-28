const debug = require('debug')('up:libs:upfire');
const { ObjectId } = require('vg-mongo');

const validActions = ['inc', 'sum', 'count', 'dec'];

function UPFire({
	db,
}) {
	debug('Factory');
	const processFire = async (fire, doc) => {
		if (!fire.action) throw new Error('"action" property is required, ex: "inc", "sum"');
		if (!fire.to) throw new Error('"to" property is required, ex: "inc", "sum"');
		const {
			to,
			where,
		} = fire;

		let {
			value,
			action,
		} = fire;

		action = action.toLowerCase().trim();

		if (validActions.indexOf(action) === -1) throw new Error('Invalid action');
		const parts = to.split('.');
		if (parts.length !== 2) throw new Error('Invalid "to" format, ex: collectionName.prop');

		const [collection, propToAlter] = parts;

		const partsWhere = where.split(',');
		const query = {};
		partsWhere.forEach((pw) => {
			pw = pw.replace('{', '').replace('}', '').trim();
			const kv = pw.split(':');
			if (kv.length !== 2) throw new Error('Invalid where format');
			const prop = kv[1].trim().substr(1);
			if (!Object.hasOwn(doc, prop)) {
				throw new Error(`${prop} not exists into document`);
			}
			if (kv[0].trim() === '_id') {
				query[kv[0].trim()] = new ObjectId(doc[prop]);
			} else {
				query[kv[0].trim()] = doc[prop];
			}
		});

		if (typeof value !== 'number') {
			if (value[0] !== '$') throw new Error(`Invalid value ${value}, require "$"`);
			value = value.substr(1);
			value = doc[value.trim()];
		}

		if (action === 'inc' || action === 'dec') {
			if (action === 'dec') {
				value *= -1;
			}
			await db[collection].updateOne(query, {
				$inc: { [propToAlter]: value },
			});
		}
	};

	return async (req, doc) => {
		debug('Called');
		const fires = req.swagger.definition['x-swagger-fire'];
		if (!Array.isArray(fires)) throw new Error('x-swagger-fire should be Array');
		for await(fire of fires) {
			await processFire(fire, doc);
		}
	};
}

module.exports = UPFire;
