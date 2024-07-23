import { default as Debug } from "debug";
import { ObjectId } from "vg-mongo";

const debug = Debug("up:services:insertOrCount");

type InsertOrCountFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type InsertOrCountParams = {
	_criterial: string;
	[key: string]: any;
};

type InsertOrCountFunction = (
	endpoint: string,
	params: InsertOrCountParams,
	opts?: object,
) => Promise<any>;

export function insertOrCountFactory({
	getModule,
	db,
}: InsertOrCountFactoryOptions): InsertOrCountFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		params: InsertOrCountParams,
		opts: object = {},
	): Promise<any> => {
		debug("Called");
		try {
			const collection = getModule(endpoint);
			const q: { [key: string]: any } = {};
			q[params._criterial] = params[params._criterial];
			delete params._criterial;
			let documentId: ObjectId | null = null;
			const inserted = await db[collection].insertOne(params, opts);
			documentId = inserted.insertedId;

			const finalDocument = await db[collection].findOne(
				{ _id: new ObjectId(String(documentId)) },
				opts,
			);
			return finalDocument;
		} catch (err: any) {
			throw new Error(err.message);
		}
	};
}
