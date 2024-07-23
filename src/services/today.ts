import { default as Debug } from "debug";
import { default as moment } from "moment";

const debug = Debug("up:services:today");

type TodayFactoryOptions = {
	getModule: (url: string) => string;
	db: { [key: string]: any };
};

type TodayFunction = (
	endpoint: string,
	opts?: { limit?: number; sort?: string },
) => Promise<any[]>;

export function todayFactory({
	getModule,
	db,
}: TodayFactoryOptions): TodayFunction {
	debug("Factory called");
	return async (
		endpoint: string,
		opts: { limit?: number; sort?: string } = { limit: 10000, sort: "_id:-1" },
	): Promise<any[]> => {
		debug("Called");

		const collection = getModule(endpoint.replace("/today", ""));

		const today = new Date();
		today.setHours(0, 0, 0);
		const tomorrow = new Date(moment(today).add(1, "days").toISOString());

		const query = {
			$and: [{ added: { $gte: today } }, { added: { $lte: tomorrow } }],
		};
		const result = await db[collection].find(query, opts).toArray();
		return result;
	};
}
