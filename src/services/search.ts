import { default as Debug } from "debug";

const debug = Debug("up:services:search");

type SearchFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type Pages = {
	limit?: number;
	page?: number;
	sorting?: string;
	q?: object;
};

type SearchFunction = (
	endpoint: string,
	query: object,
	pages?: Pages,
	fields?: object,
	opts?: object,
) => Promise<any>;

export function searchFactory({
	getModule,
	db,
}: SearchFactoryOptions): SearchFunction {
	debug("Factory called");
	return async function search(
		endpoint: string,
		query: object,
		pages: Pages = {},
		fields: object = {},
		opts: object = {},
	): Promise<any> {
		debug("Called");
		const collection = getModule(endpoint);

		const pagination = {
			limit: pages.limit || 50,
			page: pages.page || 1,
			sort: pages.sorting === "" ? undefined : pages.sorting,
		};

		const result = await db[collection].paginate(
			pages.q || {},
			{ projection: fields },
			pagination,
			opts,
		);
		return result;
	};
}
