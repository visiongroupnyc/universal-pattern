const http = require('http');
const express = require('express');
const path = require('path');
const config = require('config');
const up = require('../index');

const port = config.get('port');
const app = express();
const server = http.createServer(app);

const params = {
  swagger: {
    baseDoc: config.get('basePath'),
    host: `${config.get('host')}:${config.get('port')}`,
    folder: path.join(process.cwd(), 'swagger'),
    info: {
      version: 10.0,
      title: 'Universal Pattern Example',
      termsOfService: 'www.domain.com/terms',
      contact: {
        email: 'cesarcasas@bsdsolutions.com.ar',
      },
      license: {
        name: 'Apache',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
  },
  compress: true,
  cors: true,
  production: process.env.NODE_ENV === 'production',
  routeController: (req, res, next) => next(),
};

if (config.get('connection') && config.get('connection.mongodb')) {
  params.database = {
    uri: config.get('connection.mongodb.uri'),
    name: config.get('connection.mongodb.name'),
  };
}

up(app, params)
  .then(() => server.listen(port, () => console.info(`listen *:${port}`)))
  .catch((err) => console.error('Error initializing ', err));
