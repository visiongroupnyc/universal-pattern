const debug = require('debug')('universal-pattern:libs:swagger-metadata');

const getParameters = (swagger, url, method) => {
  debug('getParameters called: ', url, method);
  const globalParameters = swagger.parameters;
  const localParameters = swagger.paths[url][method].parameters;
  if (localParameters) {
    return localParameters.map((p) => {
      if (p.$ref) {
        const k = p.$ref.replace('#/parameters/', '');
        return globalParameters[k];
      }
      return p;
    })
      .reduce((acc, current) => ({ ...acc, [current.name]: current }), {});
  }
  return {};
};

const validateParameters = (req, res, params) => {
  let valid = true;
  Object.entries(params)
    .forEach(([k, v]) => {
      const trans = v.in === 'header' ? 'headers' : v.in;
      let i = false;

      req.swagger.params[k] = {
        value: v.default || null,
      };

      if (req[trans] && req[trans][k]) {
        if (v.type === 'number') req.swagger.params[k].value = parseInt(req[trans][k], 10);
        else req.swagger.params[k].value = req[trans][k];
        i = true;
      }
      if (v.required && !i) valid = false;
    });
  return valid;
};

const swaggerMetadata = (Application) => {
  debug('swaggerMetadata constructor called');
  const { swagger } = Application;
  const getPath = url => url.split('?').shift();

  return (req, res, next) => {
    const url = getPath(req.url);
    const method = req.method.toLowerCase();
    req.swagger = {
      params: {},
      apiPath: url,
    };

    debug('swaggerMetadata called: ', req.url, url, method);

    if (swagger.paths[url] && swagger.paths[url][method]) {
      const data = getParameters(swagger, url, method, req);
      const isValid = validateParameters(req, res, data);
      debug('la cosa existe: ', req.swagger, isValid);
      if (isValid) return next();
      return res.status(550).end(`Invalid parameters: ${JSON.stringify(req.swagger)}`);
    }
    return next();
  };
};

module.exports = swaggerMetadata;
