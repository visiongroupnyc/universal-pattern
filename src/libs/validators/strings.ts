import { default as Debug } from "debug";

const debug = Debug("up:libs:validators:string");

type Meta = {
	required?: boolean;
	format?: string;
	"x-swagger-regex"?: string;
	enum?: string[];
	minLength?: number;
	maxLength?: number;
	default?: any;
};

export const validString = (
	req: any,
	method: string,
	prop: string,
	meta: Meta,
): any => {
	debug("validString called: ", method, req.url, prop, meta);
	let n: Date | undefined;
	const emailRegex =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const p = req[method][prop];
	if (meta.required && !p) {
		throw new Error(`Required string: ${prop}`);
	}
	if (meta.format === "date") {
		n = new Date(p);
		if (n.toString() === "Invalid Date") {
			throw new Error(`Invalid date format: ${prop}`);
		}
		return n;
	}

	if (meta.format === "email") {
		if (!emailRegex.test(String(p).toLowerCase())) {
			throw new Error(`Invalid email format: ${prop}`);
		}
		return String(p).toLowerCase();
	}

	if (meta["x-swagger-regex"]) {
		if (!RegExp(meta["x-swagger-regex"]).test(p)) {
			throw new Error(
				`Invalid x-swagger-regex: ${meta["x-swagger-regex"]} ${prop}`,
			);
		}
		return p;
	}

	if (p) {
		if (meta.enum && meta.enum.indexOf(p) === -1) {
			throw new Error(`Invalid value enum: ${prop}`);
		}
		if (meta.minLength && meta.minLength > p.length) {
			throw new Error(`Invalid minLength: ${prop} (${p.length})`);
		}
		if (meta.maxLength && meta.maxLength < p.length) {
			throw new Error(`Invalid maxLength: ${prop} (${p.length})`);
		}
		return p;
	}
	return meta.default;
};
