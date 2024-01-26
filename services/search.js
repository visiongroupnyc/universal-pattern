const debug = require('debug')('up:services:search');

function searchFactory({
	getModule,
	db,
}) {
	return async function search(endpoint, query, pages = {}, fields = {}, opts = {}) {
		const collection = getModule(endpoint);

		const pagination = {
			limit: pages.limit || 50,
			page: pages.page || 1,
			sort: pages.sorting === '' ? undefined : pages.sorting,
		};
		const result = await db[collection].paginate(
			pages.q || {},
			fields,
			pagination,
			opts,
		);
		return result;
	};
}

module.exports = searchFactory;
