const mongojs = require('mongojs');
const yaml = require('js-yaml');
const fs = require('fs');
const lodash = require('lodash');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const debug = require('debug')('universal-pattern');
const paginate = require('./libs/paginate');
const services = require('./services');
const controllers = require('./controllers');
const swaggerMetadata = require('./libs/swagger-metadata');
const swaggerRouter = require('./libs/swagger-router');

const hasMWS = (app, module = 'none') => app._router.stack.filter(mws => mws.name === module).length > 0;

const getModule = url => url.replace('/', '')
  .split('?')
  .shift()
  .split('/')
  .shift();


const addHook = UP => (endpoint, method, cb) => {
  debug('adding hook: ', endpoint, method);
  if (!UP.hooks[endpoint]) UP.hooks[endpoint] = {};
  UP.hooks[endpoint][method] = cb;
};

const registerController = UP => (name, controller) => {
  debug('reginstering controller: ', name);
  if (name in UP.controllers) throw Error(`Controller ${name} already register`);
  UP.controllers[name] = controller;
};

const universalPattern = (app = express(), options = {}) => {
  const localOptions = lodash.merge({
    swagger: {
      baseDoc: '/service',
      host: 'localhost',
      apiDocs: 'api-docs',
      folder: path.join(__dirname, './swagger'),
      info: {
        version: 1.0,
        title: 'Server API',
        termsOfService: '',
        contact: {
          email: 'hola@goxo.es',
        },
        license: {
          name: 'Apache 2.0',
          url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
        },
      },
    },
    compress: false,
    cors: false,
    database: {
      uri: 'mongodb://localhost:27017/up',
    },
  }, options);

  const db = mongojs(localOptions.database.uri);
  const UP = {
    localOptions,
    db,
    app,
    redis: options.redis,
    getModule,
  };

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  if (!hasMWS(app, 'compression') && localOptions.compress) app.use(compression({ level: 9 }));
  if (!hasMWS(app, 'cors') && localOptions.compress) app.use(cors());

  return new Promise((resolve) => {
    const yamlContent = [...fs.readdirSync(localOptions.swagger.folder)
      .map((file) => {
        if (file.split('.').pop() === 'yaml') {
          return fs.readFileSync(path.join(localOptions.swagger.folder, file), 'utf8').toString();
        }
        return false;
      }), fs.readFileSync(path.join(__dirname, './swagger', 'index.yaml'), 'utf8').toString()]
      .map(file => yaml.safeLoad(file))
      .reduce((acc, current) => lodash.merge(acc, current), {});

    UP.swagger = lodash.merge({ ...yamlContent }, localOptions.swagger, { basePath: localOptions.swagger.baseDoc });

    app.use(`${localOptions.swagger.baseDoc}/docs/`, express.static(`${__dirname}/libs/swagger-ui`));
    app.use(`${localOptions.swagger.baseDoc}/docs/`, (req, res) => {
      const content = fs.readFileSync(`${__dirname}/libs/swagger-ui/index.tmp`).toString();
      res.end(content.replace('[[URL]]', `${localOptions.swagger.baseDoc}/api-docs`));
    });
    app.use(`${localOptions.swagger.baseDoc}/api-docs`, (req, res) => res.json(UP.swagger));
    app.use(swaggerMetadata(UP));
    paginate(UP);
    UP.services = services(UP);
    UP.controllers = controllers(UP);
    UP.hooks = {};
    swaggerRouter(UP);
    UP.addHook = addHook(UP);
    UP.registerController = registerController(UP);
    return resolve(UP);
  });
};

module.exports = universalPattern;
