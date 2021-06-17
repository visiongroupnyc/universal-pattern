const http = require('http');
const express = require('express');
const path = require('path');
const config = require('config');
const up = require('../index');

const port = config.get('port');
const app = express();
const server = http.createServer(app);

up(app, {
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
  database: {
    uri: config.get('connection.mongodb.uri'),
  },
  routeController: (req, res, next) => next(),
})
  .then(() => server.listen(port, () => console.info(`listen *:${port}`)))
  .catch((err) => console.error('Error initializing ', err));
