import { default as Debug } from "debug";

const debug = Debug("up:libs:validators:numbers");

type Meta = {
	required?: boolean;
	format?: string;
	decimals?: number;
	min?: number;
	max?: number;
	default?: any;
};

export const validNumber = (
	req: any,
	method: string,
	prop: string,
	meta: Meta,
): number | undefined => {
	debug("validNumber called: ", req.method, req.url, prop, meta);
	let n: number | undefined;
	const p = req[method][prop];

	if (meta.required && !p) {
		throw new Error(`require number: ${prop}`);
	}
	if (p) {
		if (meta.format === "float") {
			n = parseFloat(p);
		} else {
			n = parseInt(p, 10);
		}

		if (Number.isNaN(n)) {
			throw new Error("Invalid number format");
		}

		if (typeof meta?.decimals === "number") {
			n = parseFloat(n.toFixed(meta.decimals));
		}

		if (meta?.min !== undefined) {
			if (n < meta.min) {
				throw new Error(`Value can not be less than ${meta.min}`);
			}
		}
		if (meta?.max !== undefined) {
			if (n > meta.max) {
				throw new Error(`Value can not be greater than ${meta.max}`);
			}
		}
	}

	if (n !== undefined) {
		return n;
	}
	if (meta.default !== undefined) {
		return meta.default;
	}
	return p;
};
