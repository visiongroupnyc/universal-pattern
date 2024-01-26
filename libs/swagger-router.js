const debug = require('debug')('up:libs:swagger-router');

const swaggerRouter = (Application) => {
	const { app, controllers, swagger } = Application;
	const { paths } = swagger;
	const swaggerRouterManager = (props) => (req, res, next) => Application.localOptions.routeController(req, res, next, props);

	app.use((req, res, next) => {
		req.Application = Application;
		next();
	});

	Object.entries(paths)
		.forEach(([path, value]) => {
			Object.entries(value)
				.forEach(([method, props]) => {
					const cbError = () => {
						throw new Error(`Handler not found: ${props['x-swagger-router-controller']}`);
					};
					const handler = () => controllers[props['x-swagger-router-controller']] || cbError;
					const basePath = swagger.basePath.replace('http://', '').replace('https://', '');
					const finalpath = `${basePath}${path}`;

					debug('Adding controller: ', finalpath, controllers[props['x-swagger-router-controller']]);
					app[method](finalpath, swaggerRouterManager(props), async (req, res, next) => {
						try {
							handler()(req, res, (err) => {
								if (err) {
									debug('Controller catch Error: ', err);
									return res.status(503).json({
										code: 'controller_error_catched',
										message: err.toString(),
										success: false,
									}).end();
								}
								return next();
							});
						} catch (err) {
							console.info('Internal Error: ', err);
							res.status(500).end(err.toString());
						}
					});
				});
		});
};

module.exports = swaggerRouter;
