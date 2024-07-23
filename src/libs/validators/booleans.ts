import { default as Debug } from "debug";

const debug = Debug("up:libs:validators:booleans");

type Meta = {
	required?: boolean;
	default?: any;
};

export const validBoolean = (
	req: any,
	method: string,
	prop: string,
	meta: Meta,
): boolean => {
	debug("called: ", req.method, req.url, prop, meta);
	const p = req[method][prop];
	if (meta.required && p === undefined) {
		throw new Error(`require boolean: ${prop}`);
	}

	if (p !== undefined) {
		return Boolean(p);
	}
	return Boolean(meta.default);
};
