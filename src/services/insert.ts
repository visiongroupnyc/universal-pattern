import { default as Debug } from "debug";
import { ObjectId } from "vg-mongo";

const debug = Debug("up:services:insert");

type InsertFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type InsertFunction = (
	endpoint: string,
	data: object,
	opts?: object,
) => Promise<any>;

export function insertFactory({
	getModule,
	db,
}: InsertFactoryOptions): InsertFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		data: object,
		opts: object = {},
	): Promise<any> => {
		debug("Called");
		const collection = getModule(endpoint);
		const inserted = await db[collection].insertOne(data, opts);
		const finalDocument = await db[collection].findOne(
			{ _id: new ObjectId(String(inserted.insertedId)) },
			opts,
		);
		return finalDocument;
	};
}
