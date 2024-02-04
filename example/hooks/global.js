const debug = require('debug')('up:hooks:global');

function GlobalHooks(upInstance) {
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

	async function beforeSearch(req, dataDocument) {
		try {
			debug('beforeSearch global called: ', dataDocument);
			return dataDocument;
		} catch (err) {
			debug(err.message);
			throw err;
		}
	}

	async function afterSearch(req, dataDocument) {
		try {
			debug('afterSearch called: ');
			let { docs } = dataDocument;
			if (req?.swagger?.definition['x-swagger-public-field']) {
				docs = docs.map((d) => Object.fromEntries(
					Object
						.entries(d)
						.filter(([k]) => req.swagger.definition['x-swagger-public-field'].includes(k)),
				));
			} else if (req.endpoint.skipFields) {
				docs.forEach((doc) => {
					req.endpoint.skipFields.forEach((field) => {
						delete doc[field];
					});
				});
			}

			dataDocument.docs = docs;
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
