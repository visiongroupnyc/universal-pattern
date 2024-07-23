import { default as Debug } from "debug";

const debug = Debug("up:services:getLast");

type GetLastFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type GetLastFunction = (endpoint: string) => Promise<any>;

export function getLastFactory({
	getModule,
	db,
}: GetLastFactoryOptions): GetLastFunction {
	debug("Factory called");
	return async (endpoint: string): Promise<any> => {
		debug("Called");
		const collection = getModule(endpoint);
		const result = await db[collection].findOne(
			{},
			{
				sort: { _id: -1 },
			},
		);

		return result;
	};
}
