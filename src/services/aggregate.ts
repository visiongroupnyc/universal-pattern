import { default as Debug } from "debug";

const debug = Debug("up:services:aggregate");

type AggregateFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type AggregateFunction = (
	endpoint: string,
	pipelines: any[],
	options?: object,
) => Promise<any>;

export function aggregateFactory({
	getModule,
	db,
}: AggregateFactoryOptions): AggregateFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		pipelines: any[],
		options: object = {},
	): Promise<any> => {
		debug("Called");
		const collection = getModule(endpoint);

		const result = await db[collection].aggregate(pipelines, options);
		return result;
	};
}
