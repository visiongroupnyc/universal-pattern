import { default as Debug } from "debug";

const debug = Debug("up:libs:validators:arrays");

type Meta = {
	required?: boolean;
	minLength?: number;
	items?: { type: string };
	default?: any;
};

export const validArray = (
	req: any,
	method: string,
	prop: string,
	meta: Meta,
) => {
	debug("Called: ", req.method, req.url, prop, meta);
	let n: any;
	const p = req[method][prop];
	if (meta.required && !p) {
		throw new Error(`require array: ${prop}`);
	}
	if (p) {
		if (!Array.isArray(p)) {
			throw new Error(`Invalid array: ${prop}`);
		}
		if (meta.minLength && p.length < meta.minLength) {
			throw new Error(`Invalid minLength array: ${prop}`);
		}
		if (meta.items && meta.items.type) {
			p.forEach((k: any) => {
				let ok = false;
				if (meta.items.type === "object") {
					ok = Object.prototype.toString.call(k) === "[object Object]";
				}
				if (meta.items.type === "integer" || meta.items.type === "number") {
					ok = Object.prototype.toString.call(k) === "[object Number]";
				}
				if (meta.items.type === "array") {
					ok = Array.isArray(k);
				}
				if (meta.items.type === "string") {
					ok = Object.prototype.toString.call(k) === "[object String]";
				}
				if (meta.items.type === "boolean") {
					ok = Object.prototype.toString.call(k) === "[object Boolean]";
				}
				if (!ok) {
					throw new Error(
						`Invalid format item type: ${k} , required ${meta.items.type}`,
					);
				}
			});
		} else {
			n = p;
		}
	}
	return n || meta.default || p;
};
