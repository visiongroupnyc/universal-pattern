const debug = require('debug')('up:example:hooks:global');

function GlobalHooks(upInstance) {
	debug('GlobalHooks called');
	const {
		addHook,
	} = upInstance;

	async function afterInsert(req, dataDocument) {
		try {
			debug('afterInsert global called: ', dataDocument);
			return dataDocument;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	async function beforeInsert(req, dataDocument) {
		try {
			debug('beforeInsert global called: ', dataDocument);
			debug('userData: ', req.userData);
			dataDocument._instanceId = req.instanceId;
			return dataDocument;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	async function beforeSearch(req, query) {
		try {
			debug('beforeSearch global called: ', query);
			return query;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	async function afterSearch(req, dataDocument) {
		try {
			debug('afterSearch global called: ', dataDocument);
			dataDocument.docs = dataDocument.docs.map((doc) => ({ ...doc, alterByGlobalHook: true }));
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
