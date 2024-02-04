module.exports = async (req, res, next) => {
	res.setHeader('Surrogate-Control', 'no-store');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');

	res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
	res.header('Access-Control-Expose-Headers', 'Content-Length');
	res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range, apikey, x-access-token');
	res.header('Content-Security-Policy', 'default-src \'self\' data: gap: https://ssl.gstatic.com \'unsafe-eval\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; media-src *; img-src \'self\' data: content:;');
	if (req.method === 'OPTIONS') return res.sendStatus(200);

	if (req.headers && req.headers['x-forwarded-for']) {
		const parts = req.headers['x-forwarded-for'].split(',');
		req.realip = parts.shift();
	} else {
		req.realip = req.ip;
	}
	return next();
};
