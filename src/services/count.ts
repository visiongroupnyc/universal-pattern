import { default as Debug } from "debug";

const debug = Debug("up:services:count");

type CountFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type CountFunction = (endpoint: string, query?: object) => Promise<number>;

export function countFactory({
	getModule,
	db,
}: CountFactoryOptions): CountFunction {
	debug("Factory called");
	return async (endpoint: string, query: object = {}): Promise<number> => {
		debug("Called");
		const collection = getModule(endpoint);
		const result = await db[collection].count(query);

		return result;
	};
}
