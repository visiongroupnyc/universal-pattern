const debug = require('debug')('up:libs:validators:numbers');

const numbers = (req, method, prop, meta) => {
	debug('validNumber called: ', req.method, req.url, prop, meta);
	let n;
	const p = req[method][prop];
	if (meta.required && !p) throw new Error(`require number: ${prop}`);
	if (p) {
		if (meta.format === 'float') n = parseFloat(p, 10);
		else n = parseInt(p, 10);
		if (Number.isNaN(n)) throw new Error('Invalid number format');
	}
	return n || meta.default || p;
};

module.exports = numbers;
