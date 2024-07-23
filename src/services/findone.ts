import { default as Debug } from "debug";
import { ObjectId } from "vg-mongo";

const debug = Debug("up:services:findOne");

type FindOneFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type FindOneProps = {
	projection?: object;
	skip?: number;
	sort?: object;
	limit?: number;
};

type FindOneFunction = (
	endpoint: string,
	query?: object,
	props?: FindOneProps,
) => Promise<any>;

export function findOneFactory({
	getModule,
	db,
}: FindOneFactoryOptions): FindOneFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		query: any = {},
		props: FindOneProps = {},
	): Promise<any> => {
		debug("Called");
		const collection = getModule(endpoint);
		if (query._id) {
			query._id = new ObjectId(query._id);
		}
		const options: any = {};
		if (props.projection) {
			options.projection = { ...props.projection };
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
		const result = await db[collection].findOne(query, options);
		return result;
	};
}
