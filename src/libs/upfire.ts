import { default as Debug } from "debug";
import { ObjectId } from "vg-mongo";

const debug = Debug("up:libs:upfire");

const validActions = ["inc", "sum", "count", "dec"];

type DB = {
	[collection: string]: {
		updateOne: (query: object, update: object) => Promise<void>;
	};
};

type Fire = {
	action: string;
	to: string;
	where: string;
	value: number | string;
};

type UPFireOptions = {
	db: DB;
};

type UPFireFunction = (req: any, doc: any) => Promise<void>;

export function UPFire({ db }: UPFireOptions): UPFireFunction {
	debug("Factory");
	const processFire = async (fire: Fire, doc: any) => {
		if (!fire.action) {
			throw new Error('"action" property is required, ex: "inc", "sum"');
		}
		if (!fire.to) {
			throw new Error('"to" property is required, ex: "inc", "sum"');
		}
		const { to, where } = fire;

		let { value, action } = fire;

		action = action.toLowerCase().trim();

		if (validActions.indexOf(action) === -1) {
			throw new Error("Invalid action");
		}
		const parts = to.split(".");
		if (parts.length !== 2) {
			throw new Error('Invalid "to" format, ex: collectionName.prop');
		}

		const [collection, propToAlter] = parts;

		const partsWhere = where.split(",");
		const query: { [key: string]: any } = {};
		partsWhere.forEach((pw) => {
			pw = pw.replace("{", "").replace("}", "").trim();
			const kv = pw.split(":");
			if (kv.length !== 2) {
				throw new Error("Invalid where format");
			}
			const prop = kv[1].trim().substr(1);
			if (!Object.prototype.hasOwnProperty.call(doc, prop)) {
				throw new Error(`${prop} not exists into document`);
			}
			if (kv[0].trim() === "_id") {
				query[kv[0].trim()] = new ObjectId(doc[prop]);
			} else {
				query[kv[0].trim()] = doc[prop];
			}
		});

		if (typeof value !== "number") {
			if (value[0] !== "$") {
				throw new Error(`Invalid value ${value}, require "$"`);
			}
			value = value.substr(1);
			value = doc[value.trim()];
		}

		if (action === "inc" || action === "dec") {
			if (action === "dec") {
				value = (value as number) * -1;
			}
			await db[collection].updateOne(query, {
				$inc: { [propToAlter]: value },
			});
		}
	};

	return async (req: any, doc: any) => {
		debug("Called");
		const fires = req.swagger.definition["x-swagger-fire"];
		if (!Array.isArray(fires)) {
			throw new Error("x-swagger-fire should be Array");
		}
		for (const fire of fires) {
			await processFire(fire, doc);
		}
	};
}
