import { default as Debug } from "debug";

const debug = Debug("up:hooks:index");

type UpInstance = {
	addHook: (endpoint: string, hook: string, cb: Function) => void;
};

type HookFunction = (req: any, dataDocument: any, cb: Function) => Promise<any>;

export function GlobalHooks(upInstance: UpInstance) {
	debug("GlobalHooks creating");
	const { addHook } = upInstance;

	const afterInsert: HookFunction = async (req, dataDocument, cb) => {
		try {
			debug("afterInsert * called: ", dataDocument);
			await cb(req, dataDocument);
			return dataDocument;
		} catch (err: any) {
			debug(err.message);
			throw err;
		}
	};

	const beforeInsert: HookFunction = async (req, dataDocument, cb) => {
		try {
			debug("beforeInsert * called: ", dataDocument);
			await cb(req, dataDocument);
			return dataDocument;
		} catch (err: any) {
			debug(err.message);
			throw err;
		}
	};

	const beforeSearch: HookFunction = async (req, dataDocument, cb) => {
		try {
			debug("beforeSearch * called: ", dataDocument);
			await cb(req, dataDocument);
			return dataDocument;
		} catch (err: any) {
			debug(err.message);
			throw err;
		}
	};

	const afterSearch: HookFunction = async (req, dataDocument, cb) => {
		try {
			debug("afterSearch * called: ");

			if (req?.swagger?.definition["x-swagger-public-fields"]) {
				dataDocument.docs = dataDocument.docs.map((d: any) =>
					Object.fromEntries(
						Object.entries(d).filter(([k]) =>
							req.swagger.definition["x-swagger-public-fields"].includes(k),
						),
					),
				);
			}

			if (req?.swagger?.definition["x-swagger-skip-fields"]) {
				for (let x = 0; x < dataDocument.docs.length; x += 1) {
					for (
						let y = 0;
						y < req.swagger.definition["x-swagger-skip-fields"].length;
						y += 1
					) {
						delete dataDocument.docs[x][
							req.swagger.definition["x-swagger-skip-fields"][y]
						];
					}
				}
			}

			await cb(req, dataDocument);
			return dataDocument;
		} catch (err: any) {
			debug(err.message);
			throw err;
		}
	};

	addHook("*", "beforeSearch", beforeSearch);
	addHook("*", "afterSearch", afterSearch);
	addHook("*", "beforeInsert", beforeInsert);
	addHook("*", "afterInsert", afterInsert);
}
