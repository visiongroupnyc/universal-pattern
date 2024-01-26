const debug = require('debug')('up:controllers:search');

function searchControllerFactory({
	Application,
	services,
}) {
	debug('Factory called');
	return async (req, res, next) => {
		debug('Called');

		let { q, sorting } = req.swagger.params;
		const {
			page,
			limit,
			fields,
			distinct,
			coordinates,
		} = req.swagger.params;

		if (q) {
			const parts = q.split(',');
			q = {};
			parts.forEach((i) => {
				const k = i.split(':');
				if (k.length === 2) {
					if (k[0] === '_id') q[k[0]] = db.ObjectId(k[1].trim());
					else if (k[0][0] === '_') q[k[0].substr(1)] = db.ObjectId(k[1].trim());
					else if (k[1][0] === '/' && k[1][k[1].length - 1] === '/') q[k[0]] = RegExp(k[1].trim().substr(1).slice(0, -1), 'i');
					else if (k[1][0] === '!' && k[1][k[1].length - 1] === '!') q[k[0]] = { $ne: k[1].trim().substr(1).slice(0, -1) };
					else if (k[1][0] === '>' && k[1][k[1].length - 1] === '>') {
						if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated') {
							q[k[0]] = { $gt: new Date(k[1].trim().substr(1).slice(0, -1)) };
						} else {
							q[k[0]] = { $gt: parseInt(k[1].trim().substr(1).slice(0, -1), 10) };
						}
					} else if (k[1][0] === '<' && k[1][k[1].length - 1] === '<') {
						if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated') {
							q[k[0]] = { $lt: new Date(k[1].trim().substr(1).slice(0, -1)) };
						} else {
							q[k[0]] = { $lt: parseInt(k[1].trim().substr(1).slice(0, -1), 10) };
						}
					} else if (k[1][0] === '.' && k[1][k[1].length - 1] === '.') q[k[0]] = parseInt(k[1].trim().substr(1).slice(0, -1), 10);
					else if (k[1][0] === '|' && k[1][k[1].length - 1] === '|') q[k[0]] = k[1].trim().substr(1).slice(0, -1) === 'true';
					else if (k[1][0] === '[' && k[1][k[1].length - 1] === ']') {
						// special AND
						const subparts = k[1].trim().substr(1).slice(0, -1).split('|');
						if (subparts.length !== 2) return;
						if (!('$and' in q)) q.$and = [];
						const item1 = {};
						item1[k[0]] = { $gt: parseInt(subparts[0], 10) };
						q.$and.push(item1);

						const item2 = {};
						item2[k[0]] = { $lt: parseInt(subparts[1], 10) };
						q.$and.push(item2);
					} else if (k[1].toUpperCase() === 'NULL') q[k[0]] = null;
					else if (k[1].toUpperCase() === 'NOTNULL') q[k[0]] = { $ne: null };
					else if (k[1][0] === '{' && k[1][k[1].length - 1] === '}') {
						const subparts = k[1].trim().substr(1).slice(0, -1).split('|');
						if (subparts.length === 0) return;
						q[k[0]] = { $in: subparts };
					} else {
						if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated') {
							const today = new Date(k[1].trim());
							const nextDay = new Date(k[1].trim());
							if (!('$and' in q)) q.$and = [];
							const item1 = {};
							item1[k[0]] = { $gt: today };
							q.$and.push(item1);

							nextDay.setDate(nextDay.getDate() + 1);
							const item2 = {};
							item2[k[0]] = { $lt: nextDay };
							q.$and.push(item2);
						} else {
							q[k[0]] = k[1].trim();
						}
					}
				}// end if (k.length === 2) {
			});
		}

		if (coordinates && coordinates !== '' && coordinates !== '0,0,0') {
			debug('with coordinates: ', coordinates);
			const parts = coordinates.split(',');
			if (parts.length === 3) {
				if (!q) q = {};
				q.location = {
					$nearSphere: {
						$geometry: {
							type: 'Point',
							coordinates: [parseFloat(parts[0]), parseFloat(parts[1])],
						},
						$maxDistance: parseInt(parts[2], 10), // > 100000 ? 100000 : parseInt(parts[2], 10),
					},
				};
			}
		}

		if (q && typeof q.criterial !== 'undefined') delete q.location;
		if (sorting) {
			const props = sorting.split(',');
			sorting = {};
			props.forEach((p) => {
				const parts = p.split(':');
				if (parts.length === 2) sorting[parts[0]] = (parts[1] === 'desc' ? -1 : 1);
			});
		}

		const populateFields = {};
		if (fields && fields !== '') {
			fields.split(',').forEach((f) => {
				populateFields[f.trim()] = 1;
			});
		}
		req.q = q;
		try {
			const searchParams = {
				page,
				limit,
				q,
				sorting,
			};
			if (Application.hooks['*'] && Application.hooks['*'].beforeSearch) {
				q = await Application.hooks['*'].beforeSearch(req, searchParams, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeSearch) {
				q = await Application.hooks[req.swagger.apiPath].beforeSearch(req, searchParams, Application);
			}

			let result = {};
			if (distinct && distinct.length > 0) {
				const ids = await services.distinct(req.swagger.apiPath, distinct, searchParams.q);
				const docs = await Promise.all(
					ids.map((id) => services.findOne(req.swagger.apiPath, { [distinct]: id }, {})),
				);
				result = {
					docs,
					page: 1,
					limit: docs.length,
					count: docs.length,
					totalPages: 1,
					distinct: true,
				};
			} else {
				result = await services.search(req.swagger.apiPath, {}, searchParams, populateFields);
			}

			if (Application.hooks['*'] && Application.hooks['*'].afterSearch) {
				result = await Application.hooks['*'].afterSearch(req, result, Application);
			}
			if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterSearch) {
				result = await Application.hooks[req.swagger.apiPath].afterSearch(req, result, Application);
			}
			return res.json(result);
		} catch (err) {
			return next(err);
		}
	};
}

module.exports = searchControllerFactory;
