# Universal Pattern
Universal Pattern is single and easy way to build professionals API using MongoDB and Node.js.

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).


# Instalation
```bash
$ npm install universal-pattern --save
```

# Implementation
First, create a new project using npm, and install required modules.

```bash
$ npm init
$ npm install express config --save
```

## creating app.js
Create the app.js file, and put this code inside.
Important: this project use 'config' npm package. Install this first. Then, create 'config' folder and default.json file into it.

default.json example:
```javascript
{
  "basePath": "/auditor",
  "host": "localhost",
  "port": 5000,
  "name": "up-example",
  "version": "0.1",
  "connection": {
    "mongodb": {
      "uri": "mongodb://127.0.0.1/up"
    }
  }
}

```

```javascript
const http = require('http');
const express = require('express');
const path = require('path');
const config = require('config');
const up = require('universal-pattern');

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
        name: 'UP',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
  },
  compress: true,
  cors: true,
  database: {
    uri: config.get('connection.mongodb.uri'),
  },
})
  .then((upInstance) => server.listen(port, () => console.info(`listen *:${port}`)))
  .catch(err => console.error('Error initializing ', err));
```

## Creating auditreport.yaml
Now, create the folder 'swagger' and put into it the first yaml file (e.g auditreport.yaml)

```yaml
paths:
  /auditreport:
    get:
      tags:
        - auditor
      summary: reports list
      x-swagger-router-controller: universal.search
      parameters:
        - $ref: '#/parameters/q'
        - $ref: '#/parameters/page'
        - $ref: '#/parameters/sorting'
        - $ref: '#/parameters/limit'
        - $ref: '#/parameters/fields'
        - $ref: '#/parameters/apikey'
        - name: coordinates
          in: query
          type: string
          default: "0,0,0"
          description: search by coordinates struct. long,lat,radius

      responses:
        '200':
          description: reports
          schema:
            $ref: '#/definitions/auditreport'
    put:
      tags:
        - auditor
      summary: insert new report
      x-swagger-router-controller: universal.insert
      parameters:
        - $ref: '#/parameters/apikey'
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/auditreport'
      responses:
        '200':
          description: report added
          schema:
            $ref: '#/definitions/auditreport'

    delete:
      tags:
        - auditor
      summary: delete report
      x-swagger-router-controller: universal.remove
      parameters:
        - $ref: '#/parameters/apikey'
        - name: _id
          in: query
          required: true
          type: string
      responses:
        '200':
          description: deleted report
          schema:
            $ref: '#/definitions/auditreport'

    patch:
      tags:
        - auditor
      summary: options report
      x-swagger-router-controller: universal.update
      parameters:
        - $ref: '#/parameters/apikey'
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/auditreport'
      responses:
        '200':
          description: updated report
          schema:
            $ref: '#/definitions/auditreport'

definitions:
  auditreport:
    type: object
    properties:
      _id:
        type: string
        minLength: 24
        maxLength: 24
      target:
        type: string
        enum:
          - imagen
          - dish
          - restaurant
          - user
          - comment
          - event
      userId:
        type: string
        minLength: 24
        maxLength: 24
      targetId:
        type: string
        minLength: 24
        maxLength: 24
      comment:
        type: string
```

## Runing example.
Finally, run the first UP App.

```bash
$ node app.js
```
Open your browser and go to (http://localhost:5000/auditor/docs)


# Options object
```javascript
swagger: { // Swagger property, required.
  baseDoc: config.get('basePath'), // this is the baseDoc, is a default initial folder path.
  host: config.get('host'), // what is the actual host?
  folder: path.join(process.cwd(), 'swagger'), // the folder with yamls files
},
compress: false, // is true, the add compression mws into app. Default is false
cors: false, // is true, add cors into header response. Default is false
database: { // the database (mongodb) properties
  uri: config.get('connection.mongodb.uri'), // database (mongodb) uri connection string
},
```

# Hooks

```javascript
// Insert hooks
upInstance.addHook('/endpoint', 'beforeInsert', async (req, dataDocument, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('/endpoint', 'afterInsert', async (req, insertedDocument, UPInstance) => {
  return Promise.resolve(params);
});

// Update hooks
upInstance.addHook('/endpoint', 'beforeUpdate', async (req, dataDocument, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('/endpoint', 'afterUpdate', async (req, updatedDocument, UPInstance) => {
  return Promise.resolve(params);
});

// Remove hooks
upInstance.addHook('/endpoint', 'beforeRemove', async (req, documentId, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('/endpoint', 'afterRemove', async (req, removedDocument, UPInstance) => {
  return Promise.resolve(params);
});


// Search hooks
upInstance.addHook('/endpoint', 'beforeSearch', async (req, searchParams, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('/endpoint', 'afterSearch', async (req, searchResults, UPInstance) => {
  return Promise.resolve(params);
});

```

# Register controllers
```javascript
upInstance.registerController('module.methodControllerName', (req, res, next) => {
  console.info(req.swagger);
  res.json({ ok: true });
});
```
