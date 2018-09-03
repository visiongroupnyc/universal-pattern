const debug = require('debug')('universal-pattern:libs:swagger-router');

const swaggerRouter = (Application) => {
  const { app, controllers, swagger } = Application;
  const { paths } = swagger;
  Object.entries(paths)
    .forEach(([path, value]) => {
      Object.entries(value)
        .forEach(([method, props]) => {
          debug('registering: ', method, path, props['x-swagger-router-controller'], controllers);
          const cbError = () => {
            throw new Error(`Handler not found: ${props['x-swagger-router-controller']}`);
          };
          const handler = controllers[props['x-swagger-router-controller']] || cbError;
          const basePath = swagger.basePath.split(':').shift().replace('http://', '').replace('https://', '');

          app[method](`${basePath}${path}`, (req, res, next) => {
            try {
              console.info('data: ', req.query);
              handler(req, res, (err) => {
                if (err) {
                  debug('Controller catch Error: ', err);
                  res.status(503).json({
                    code: 'controller_error_catched',
                    message: err,
                    success: false,
                  }).end();
                } else {
                  next();
                }
              });
            } catch (err) {
              debug('Error: ', err);
              res.status(500).end(err.toString());
            }
          });
        });
    });
};

module.exports = swaggerRouter;
