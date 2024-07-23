import { default as Debug } from "debug";
import { ObjectId } from "vg-mongo";

const debug = Debug("up:services:update");

type UpdateFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type UpdateFunction = (
	endpoint: string,
	_id: string,
	data?: object,
	options?: { updated?: boolean; set?: boolean },
	opts?: object,
) => Promise<any>;

export function updateFactory({
	getModule,
	db,
}: UpdateFactoryOptions): UpdateFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		_id: string,
		data: object = {},
		options: { updated?: boolean; set?: boolean } = {
			updated: true,
			set: true,
		},
		opts: object = {},
	): Promise<any> => {
		debug("Called");
		const collection = getModule(endpoint);
		let update: { [key: string]: any } = {};
		if (options.updated) {
			(data as any)._updated = new Date();
			delete update.update;
		}
		if (options.set) {
			update = { $set: data };
		} else {
			update = data;
		}

		const documentId = new ObjectId(_id);
		await db[collection].updateOne({ _id: documentId }, update, opts);
		await db[collection].updateOne(
			{ _id: documentId },
			{
				$inc: { _n: 1 },
			},
		);

		const updatedDocument = await db[collection].findOne({ _id: documentId });
		return updatedDocument;
	};
}
