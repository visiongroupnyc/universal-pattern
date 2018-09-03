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
      .reduce((acc, current) => {
        if (current.schema) {
          if (current.schema.$ref) {
            const parts = current.schema.$ref.replace('#/', '').split('/');
            current.schema = swagger[parts[0]][parts[1]];
          }
        }
        return ({ ...acc, [current.name]: current });
      }, {});
  }
  return {};
};


const validString = (req, method, prop, meta) => {
  debug('validString called: ', prop, meta);
  let n = null;
  if (meta.format === 'date') {
    n = new Date(req[method][prop]);
    if (n.toString() === 'Invalid Date') throw new Error('Invalid date format');
    return n;
  }
  return n.toString();
};

const validNumber = (req, method, prop, meta) => {
  debug('validNumber called: ', prop, meta);
  let n = null;
  if (meta.format === 'float') n = parseFloat(req[method][prop], 10);
  else n = parseInt(req[method][prop], 10);

  if (Number.isNaN(n)) throw new Error('Invalid number format');
  return n;
};

const validObject = (req, method, prop, meta) => {
  debug('validObject called: ', prop, meta);
  if (method === 'post') {
    const { body } = req;
    const { schema } = meta;
    debug('<>>>> ', body, schema);
  }
  return req.body;
};

const validateParameters = (req, params) => {
  req.swagger.params = {};
  Object.entries(params)
    .forEach(([k, v]) => {
      try {
        let method = v.in === 'header' ? 'headers' : v.in;
        if (v.schema) method = 'post';
        // let i = false;
        if (v.schema) return validateParameters(req, v.schema);
        if (v.type === 'number') req.swagger.params[k].value = validNumber(req, method, k, v);
        else if (v.type === 'string') req.swagger.params[k].value = validString(req, method, k, v);
        else if (v.type === 'object') req.swagger.params[k].value = validObject(req, method, k, v);
        else req.swagger.params[k].value = req[method][k];
        return req.swagger.params;
      } catch (err) {
        return null;
      }
    });
};

const swaggerMetadata = (Application) => {
  debug('swaggerMetadata constructor called');
  const { swagger } = Application;
  const getPath = url => url.split('?').shift().replace(swagger.basePath, '');

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
      const isValid = validateParameters(req, data);
      if (isValid) return next();
      debug('invalid request: ', req.url, req.swagger);
      return res.status(400).end(`Invalid parameters: ${JSON.stringify(req.swagger)}`);
    }
    return next();
  };
};

module.exports = swaggerMetadata;
