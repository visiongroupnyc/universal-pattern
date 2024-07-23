import { default as Debug } from "debug";

const debug = Debug("up:libs:validators:objects");

type MetaProperty = {
	type: string;
	required?: boolean;
	default?: any;
};

type Meta = {
	properties: { [key: string]: MetaProperty };
};

export const validObject = (
	req: any,
	method: string,
	prop: string,
	meta: Meta,
): any => {
	debug("validObject called: ", req.method, req.url, prop, meta);
	if (method === "body") {
		const toValidate = req.body[prop];
		if (!("properties" in meta)) {
			throw new Error("Invalid Swagger object schema definition");
		}
		const keys = Object.keys(meta.properties);
		for (let x = 0; x < keys.length; x += 1) {
			const key = keys[x];
			const m = meta.properties[key];
			if (m.required) {
				if (typeof toValidate[key] === "undefined") {
					throw new Error(`The prop ${key} is required`);
				}
			}

			if (m.default) {
				if (typeof toValidate[key] === "undefined") {
					req.body[prop][key] = m.default;
				}
			}

			if (m.type === "string") {
				if (
					Object.prototype.toString.call(toValidate[key]) !== "[object String]"
				) {
					throw new Error("Invalid type, String is required");
				}
			}

			if (m.type === "array") {
				if (
					Object.prototype.toString.call(toValidate[key]) !== "[object Array]"
				) {
					throw new Error("Invalid type, Array is required");
				}
			}

			if (m.type === "integer") {
				if (
					Object.prototype.toString.call(toValidate[key]) !== "[object Number]"
				) {
					throw new Error("Invalid type, Integer is required");
				}
			}
		}

		return req.body[prop];
	}
	return {};
};
