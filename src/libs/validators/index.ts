import { default as Debug } from "debug";

const debug = Debug("up:libs:validators");

import { validString } from "./strings.js";
import { validObject } from "./objects.js";
import { validNumber } from "./numbers.js";
import { validBoolean } from "./booleans.js";
import { validArray } from "./arrays.js";

type Meta = {
	required?: boolean;
	default?: any;
	type?: string;
	schema?: {
		type?: string;
		properties?: { [key: string]: Meta };
	};
	in?: string;
};

type Params = {
	[key: string]: Meta;
};

type Level = {
	[key: string]: any;
};

type Request = {
	[method: string]: { [prop: string]: any };
	method: string;
	url: string;
	headers?: { [key: string]: any };
	body?: { [key: string]: any };
};

export const validateParameters = (
	req: Request,
	params: Params,
	level: Level = {},
): Level => {
	debug("validateParameters called: ", level);
	Object.entries(params).forEach(([k, v]) => {
		debug("validating: ", k, v, level);
		try {
			let method = v.in === "header" ? "headers" : v.in || "body";
			if (v.schema) {
				method = "body";
			}
			if (!level[method]) {
				level[method] = {};
			}

			if (v?.schema?.type === "object" && method === "body") {
				level[method][k] = {
					value: {
						...validateParameters(req, v.schema.properties || {}, {}),
					},
				};
				return level;
			}

			if (v.type === "number" || v.type === "integer") {
				const value = validNumber(req, method, k, v);
				level[method][k] = value;
				return level;
			}

			if (v.type === "string") {
				const value = validString(req, method, k, v);
				level[method][k] = value;
				return level;
			}

			if (v.type === "boolean") {
				const value = validBoolean(req, method, k, v);
				level[method][k] = value;
				return level;
			}

			if (v.type === "array") {
				const value = validArray(req, method, k, v);
				level[method][k] = value;
				return level;
			}

			if (v.type === "object") {
				const value = validObject(req, method, k, v);
				if (value) {
					level[method][k] = value;
					return level;
				}
			}

			if (v.type === "file") {
				return level;
			}

			level = { ...level, [k]: req[method][k] };
			return level;
		} catch (err) {
			console.info("se cago validando: ", err);
			throw Error(`${err.toString()}`);
		}
	});

	return level;
};

export default {
	validString,
	validObject,
	validNumber,
	validBoolean,
	validArray,
	validateParameters,
};
