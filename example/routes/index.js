module.exports = {
	get: {
		'/health': [
			async (req, res, next) => {
				req.testing = true;
				next();
			},
			async (req, res) => res.status(200).end(`Working ${req.testing}`),
		],
	},
};
