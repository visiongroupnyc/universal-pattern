import { default as Debug } from "debug";
import { ObjectId } from "vg-mongo";

const debug = Debug("up:services:remove");

type RemoveFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type RemoveFunction = (endpoint: string, _id: string) => Promise<any>;

export function removeFactory({
	getModule,
	db,
}: RemoveFactoryOptions): RemoveFunction {
	debug("Factory called");
	return async (endpoint: string, _id: string): Promise<any> => {
		debug("Called");
		const collection = getModule(endpoint);
		const removedDocument = await db[collection].findOne({
			_id: new ObjectId(_id),
		});
		if (!removedDocument) {
			throw new Error("_id not found");
		}
		const removedResult = await db[collection].deleteOne({
			_id: new ObjectId(_id),
		});

		return {
			...removedDocument,
			result: removedResult,
		};
	};
}
