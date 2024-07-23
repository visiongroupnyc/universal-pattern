import { default as Debug } from "debug";

import { searchFactory } from "./search.js";
import { findOneFactory } from "./findone.js";
import { insertFactory } from "./insert.js";
import { insertOrCountFactory } from "./insertorcount.js";
import { removeFactory } from "./remove.js";
import { updateFactory } from "./update.js";
import { getLastFactory } from "./getlast.js";
import { todayFactory } from "./today.js";
import { countFactory } from "./count.js";
import { updateByFilterFactory } from "./updatebyfilter.js";
import { removeAllFactory } from "./removeall.js";
import { findFactory } from "./find.js";
import { distinctFactory } from "./distinct.js";
import { aggregateFactory } from "./aggregate.js";

const debug = Debug("up:services");

type Application = {
	db: any;
	getModule: (url: string) => string;
};

type ServiceMethods = {
	[key: string]: (...args: any[]) => any;
};

export const services = (Application: Application): ServiceMethods => {
	debug("Called");
	const { db, getModule } = Application;
	if (!db) {
		const methods = [
			"search",
			"today",
			"insert",
			"findOne",
			"insertOrCount",
			"remove",
			"removeAll",
			"update",
			"updateByFilter",
			"count",
			"find",
			"getLast",
			"modify",
			"aggregate",
			"distinct",
		].reduce((acc, actual) => {
			acc[actual] = () => {
				throw new Error("DB not set");
			};
			return acc;
		}, {} as ServiceMethods);
		return methods;
	}

	return {
		search: searchFactory({
			getModule,
			db,
		}),
		today: todayFactory({
			getModule,
			db,
		}),
		insert: insertFactory({
			db,
			getModule,
		}),
		findOne: findOneFactory({
			db,
			getModule,
		}),
		insertOrCount: insertOrCountFactory({
			db,
			getModule,
		}),
		getLast: getLastFactory({
			db,
			getModule,
		}),
		remove: removeFactory({
			db,
			getModule,
		}),
		removeAll: removeAllFactory({
			getModule,
			db,
		}),
		update: updateFactory({
			getModule,
			db,
		}),
		updateByFilter: updateByFilterFactory({
			getModule,
			db,
		}),
		count: countFactory({
			getModule,
			db,
		}),
		find: findFactory({
			getModule,
			db,
		}),
		distinct: distinctFactory({
			getModule,
			db,
		}),
		aggregate: aggregateFactory({
			getModule,
			db,
		}),
	};
};
