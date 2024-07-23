import { default as Debug } from "debug";

const debug = Debug("up:services:updateByFilter");

type UpdateByFilterFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type UpdateByFilterFunction = (
	endpoint: string,
	query?: object,
	data?: object,
	options?: { updated?: boolean; set?: boolean },
	opts?: object,
) => Promise<any>;

export function updateByFilterFactory({
	getModule,
	db,
}: UpdateByFilterFactoryOptions): UpdateByFilterFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		query: object = {},
		data: object = {},
		options: { updated?: boolean; set?: boolean } = {
			updated: true,
			set: true,
		},
		opts: object = {},
	): Promise<any> => {
		debug("Called");
		let rData = data;
		const collection = getModule(endpoint);
		if (options.updated) {
			(rData as any)._updated = new Date();
		}
		if (options.set) {
			rData = { $set: data };
		}

		const updated = await db[collection].updateMany(query, rData, { ...opts });
		return updated;
	};
}
