import { default as Debug } from "debug";

const debug = Debug("up:libs:paginate");

type Collection = {
	asyncCount: (query: object, opts: object) => Promise<number>;
	find: (
		query: object,
		fields: object,
		opts: object,
	) => {
		sort: (sort: object) => {
			skip: (skip: number) => {
				limit: (
					limit: number,
					callback: (err: Error | null, docs: any[]) => void,
				) => void;
			};
		};
	};
};

type PaginateOptions = {
	page?: number;
	limit?: number;
	sort?: object;
};

type PaginateResult = {
	docs: any[];
	limit: number;
	count: number;
	page: number;
	totalPages: number;
};

const privPaginate = (collection: Collection) => {
	return async function _paginate(
		query: object,
		fields: object,
		options: PaginateOptions,
		opts: object = {},
	): Promise<PaginateResult> {
		debug("paginate called");

		const page = options.page || 1;
		const defaultLimit = 30;
		const { sort } = options;

		const count = await collection.asyncCount(query || {}, opts);
		const totalPages =
			Math.floor(count / (options.limit || defaultLimit)) +
			(count % (options.limit || defaultLimit) > 0 ? 1 : 0);

		return new Promise((resolve, reject) => {
			collection
				.find(query, fields, opts)
				.sort(sort)
				.skip((options.limit || defaultLimit) * (page - 1))
				.limit(
					options.limit || defaultLimit,
					(err2: Error | null, docs: any[]) => {
						if (err2) {
							return reject(err2);
						}
						return resolve({
							docs,
							limit: options.limit || defaultLimit,
							count,
							page,
							totalPages,
						});
					},
				);
		});
	};
};

type Application = {
	db: {
		[key: string]: Collection & { paginate?: Function };
		getCollectionNames: (
			callback: (err: Error | null, collections: string[]) => void,
		) => void;
	};
	swagger: {
		paths: {
			[key: string]: any;
		};
	};
	getModule: (path: string) => string;
};

export const paginate = (Application: Application) => {
	debug(".paginate constructor called");
	const { db } = Application;

	if (!db) {
		return;
	}
	db.getCollectionNames((err, collections) => {
		if (err) {
			return;
		}
		collections
			.concat(
				Object.keys(Application.swagger.paths).map((p) =>
					Application.getModule(p),
				),
			)
			.forEach((c) => {
				debug(`setting paginate to ${c}`);
				Application.db[c].paginate = privPaginate(Application.db[c]);
			});
	});
};
