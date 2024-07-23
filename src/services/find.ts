import { default as Debug } from "debug";
import { ObjectId } from "vg-mongo";

const debug = Debug("up:services:find");

type FindFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type FindProps = {
	projection?: object;
	fields?: object;
	skip?: number;
	sort?: object;
	limit?: number;
};

type FindFunction = (
	endpoint: string,
	query?: { [key: string]: any },
	fields?: object,
	props?: FindProps,
) => Promise<any[]>;

export function findFactory({
	getModule,
	db,
}: FindFactoryOptions): FindFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		query: { [key: string]: any } = {},
		fields: object = {},
		props: FindProps = {},
	): Promise<any[]> => {
		debug("Called");
		const collection = getModule(endpoint);
		if (query._id) {
			query._id = new ObjectId(query._id);
		}
		const options: { [key: string]: any } = {};
		if (props.projection) {
			options.projection = { ...props.projection };
		}
		if (props.fields) {
			options.projection = { ...fields };
		}
		if (props.skip) {
			options.skip = props.skip;
		}
		if (props.sort) {
			options.sort = { ...props.sort };
		}
		if (props.limit) {
			options.limit = props.limit;
		}
		const result = await db[collection].find(query, options).toArray();
		return result;
	};
}
