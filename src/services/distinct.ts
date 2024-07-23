import { default as Debug } from "debug";

const debug = Debug("up:services:distinct");

type DistinctFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type DistinctFunction = (
	endpoint: string,
	field?: string,
	query?: object,
) => Promise<any[]>;

export function distinctFactory({
	getModule,
	db,
}: DistinctFactoryOptions): DistinctFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		field: string = "_id",
		query: object = {},
	): Promise<any[]> => {
		debug("Called");
		const collection = getModule(endpoint);
		const result = await db[collection].distinct(field, query);
		return result;
	};
}
