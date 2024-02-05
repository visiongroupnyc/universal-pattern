const debug = require('debug')('up:hooks:index');

function GlobalHooks(upInstance) {
	debug('GlobalHooks creating');
	const {
		addHook,
	} = upInstance;

	async function afterInsert(req, dataDocument, cb) {
		try {
			debug('afterInsert * called: ', dataDocument);
			await cb(req, dataDocument);
			return dataDocument;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	async function beforeInsert(req, dataDocument, cb) {
		try {
			debug('beforeInsert * called: ', dataDocument);
			await cb(req, dataDocument);
			return dataDocument;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	async function beforeSearch(req, dataDocument, cb) {
		try {
			debug('beforeSearch * called: ', dataDocument);
			await cb(req, dataDocument);
			return dataDocument;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	async function afterSearch(req, dataDocument, cb) {
		try {
			debug('afterSearch * called: ');

			if (req?.swagger?.definition['x-swagger-public-fields']) {
				dataDocument.docs = dataDocument.docs.map((d) => Object.fromEntries(
					Object
						.entries(d)
						.filter(([k]) => req.swagger.definition['x-swagger-public-fields'].includes(k)),
				));
			}

			if (req?.swagger?.definition['x-swagger-skip-fields']) {
				for (let x = 0; x < dataDocument.docs.length; x += 1) {
					for (let y = 0; y < req.swagger.definition['x-swagger-skip-fields'].length; y += 1) {
						delete dataDocument.docs[x][req.swagger.definition['x-swagger-skip-fields'][y]];
					}
				}
			}

			await cb(req, dataDocument);
			return dataDocument;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	addHook('*', 'beforeSearch', beforeSearch);
	addHook('*', 'afterSearch', afterSearch);
	addHook('*', 'beforeInsert', beforeInsert);
	addHook('*', 'afterInsert', afterInsert);
}

module.exports = GlobalHooks;
