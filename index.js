const mongojs = require('mongojs');
const yaml = require('js-yaml');
const fs = require('fs');
const lodash = require('lodash');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const paginate = require('./libs/paginate');
const services = require('./services');
const controllers = require('./controllers');
const subcontrollersHandlers = require('./subcontrollers');
const swaggerMetadata = require('./libs/swagger-metadata');
const swaggerRouter = require('./libs/swagger-router');

const hasMWS = (app, module = 'none') => app._router.stack.filter(mws => mws.name === module).length > 0;

const getModule = url => url.replace('/', '')
  .split('?')
  .shift()
  .split('/')
  .shift();

const universalPattern = (app = express(), options = {}) => {
  const localOptions = lodash.merge({
    swagger: {
      baseDoc: '/service',
      host: 'localhost',
      apiDocs: 'api-docs',
      folder: path.join(__dirname, './swagger'),
    },
    compress: false,
    cors: false,
    subcontrollers: {},
    database: {
      uri: 'mongodb://localhost:27017/up',
    },
  }, options);

  const db = mongojs(localOptions.database.uri);
  const UP = {
    localOptions,
    db,
    app,
    getModule,
  };

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // adding defaults mws
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

    UP.swagger = { ...yamlContent };
    app.use(`${localOptions.swagger.baseDoc}/docs/`, express.static(`${__dirname}/libs/swagger-ui`));
    app.use(`${localOptions.swagger.baseDoc}/api-docs`, (req, res) => res.json(UP.swagger));
    app.use('/---private--access-to-api-doc---', (req, res) => res.json(UP.swagger));
    app.use(swaggerMetadata(UP));
    paginate(UP);
    UP.services = services(UP);
    UP.subcontrollers = subcontrollersHandlers(UP);
    UP.controllers = controllers(UP);
    swaggerRouter(UP);

    // compression
    return resolve(UP);
  });
};

module.exports = universalPattern;
