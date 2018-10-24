const debug = require('debug')('universal-pattern:libs:swagger-metadata');

const getParameters = (swagger, url, method) => {
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
  debug('validString called: ', method, prop, meta);
  let n;
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const p = req[method][prop];
  if (meta.required && !p) throw new Error(`required string: ${prop}`);
  if (meta.format === 'date') {
    n = new Date(p);
    if (n.toString() === 'Invalid Date') throw new Error(`Invalid date format: ${prop}`);
    return n;
  }

  if (meta.format === 'email') {
    if (!emailRegex.test(String(p).toLowerCase())) throw new Error(`Invalid email format: ${prop}`);
    return String(p).toLowerCase();
  }

  if (meta['x-swagger-regex']) {
    if (!RegExp(meta['x-swagger-regex']).test(p)) throw new Error(`Invalid x-swagger-regex: ${meta['x-swagger-regex']} ${prop}`);
    return p;
  }

  if (p) {
    if (meta.enum && meta.enum.indexOf(p) === -1) throw new Error(`Invalid value enum: ${prop}`);
    if (meta.minLength && meta.minLength > p.length) throw new Error(`Invalid minLength: ${prop} (${p.length})`);
    if (meta.maxLength && meta.maxLength < p.length) throw new Error(`Invalid maxLength: ${prop} (${p.length})`);
    return p;
  }
  return meta.default;
};

const validNumber = (req, method, prop, meta) => {
  debug('validNumber: ', prop, meta);
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

const validObject = (req, method, prop, meta) => {
  debug('validObject called: ', prop, meta);
  if (method === 'post') {
    const { body } = req;
    const { schema } = meta;
  }
  return req.body;
};

const validateParameters = (req, params, level = {}) => {
  debug('validateParameters called: ', params, level);
  Object.entries(params)
    .forEach(([k, v]) => {
      try {
        let method = v.in === 'header' ? 'headers' : v.in || 'body';
        if (v.schema) {
          method = 'body';
        }
        if (v.schema && v.schema.type === 'object') {
          level[k] = { value: {} };
          return validateParameters(req, v.schema.properties, level[k].value);
        }
        if (v.type === 'number') {
          const value = validNumber(req, method, k, v);
          if (method === 'body') {
            if (value) Object.assign(level, { [k]: value });
          } else Object.assign(level, { [k]: { value } });
          return level;
        }
        if (v.type === 'string') {
          const value = validString(req, method, k, v);
          if (method === 'body') {
            if (value) Object.assign(level, { [k]: value });
          } else Object.assign(level, { [k]: { value } });
          return level;
        }
        if (v.type === 'object') {
          const value = validObject(req, method, k, v);
          if (value) {
            if (method === 'body') Object.assign(level, { [k]: value });
            else Object.assign(level, { [k]: { value } });
            return level;
          }
        }

        Object.assign(level, { [k]: { value: req[method][k] } });
        return level;
      } catch (err) {
        debug('invalid model data validation: ', err);
        throw Error(`invalid model data validation: ${err.toString()}`);
      }
    });
  return level;
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
      try {
        const data = getParameters(swagger, url, method, req);
        validateParameters(req, data, req.swagger.params);
        debug('params formatted: ', req.swagger.params);
        return next();
      } catch (error) {
        debug('invalid request: ', req.url, req.swagger, error);
        return res.status(400).end(`Invalid parameters: ${error}`);
      }
    }
    return next();
  };
};

module.exports = swaggerMetadata;
