const mongojs = require('mongojs');
const yaml = require('js-yaml');
const fs = require('fs');
const lodash = require('lodash');
const path = require('path');
const bodyParser = require('body-parser');

const paginate = require('./libs/paginate');
const services = require('./services');
const controllers = require('./controllers');
const subcontrollersHandlers = require('./subcontrollers');
const swaggerMetadata = require('./libs/swagger-metadata');
const swaggerRouter = require('./libs/swagger-router');

const getModule = url => url.replace('/', '')
  .split('?')
  .shift()
  .split('/')
  .shift();

const universalPattern = (app, options = {}) => {
  const localOptions = lodash.merge({
    swagger: {
      swaggerUi: '/service',
      host: 'localhost',
      apiDocs: 'api-docs',
      folder: path.join(__dirname, './swagger'),
    },
    subcontrollers: {},
    database: {
      uri: 'mongodb://localhost:27017/up',
    },
  }, options);

  return new Promise((resolve) => {
    const db = mongojs(localOptions.database.uri);
    const UP = {
      localOptions,
      db,
      app,
      getModule,
    };

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
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
    app.use(swaggerMetadata(UP));
    paginate(UP);
    UP.services = services(UP);
    UP.subcontrollers = subcontrollersHandlers(UP);
    UP.controllers = controllers(UP);
    swaggerRouter(UP);

    return resolve(UP);
  });
};

module.exports = universalPattern;
