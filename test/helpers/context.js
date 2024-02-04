const Context = () => {
	const handler = {
		get: function _get(obj, prop) {
			return obj[prop];
		},
		set: function _set(obj, prop, value) {
			obj[prop] = value;
			return true;
		},
	};
	return new Proxy({}, handler);
};

module.exports = Context;
