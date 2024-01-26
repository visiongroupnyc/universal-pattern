const debug = require('debug')('up:libs:validators:numbers');

const numbers = (req, method, prop, meta) => {
	debug('validNumber called: ', req.method, req.url, prop, meta);
	let n;
	const p = req[method][prop];

	if (meta.required && !p) throw new Error(`require number: ${prop}`);
	if (p) {
		if (meta.format === 'float') n = parseFloat(p, 10);
		else {
			n = parseInt(p, 10);
		}

		if (Number.isNaN(n)) throw new Error('Invalid number format');

		if (typeof meta?.decimals === 'number') {
			n = parseInt(n.toFixed(meta.decimals), 10);
		}

		if (meta?.min) {
			if (n < meta.min) throw new Error(`Value can not be less than ${meta.min}`);
		}
		if (meta?.max) {
			if (n > meta.max) throw new Error(`Value can not be greater than ${meta.max}`);
		}
	}

	if (n) return n;
	if (meta.default) return meta.default;
	return p;
};

module.exports = numbers;
