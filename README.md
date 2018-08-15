# Universal Pattern
Universal Pattern is single and easy way to build professionals API using MongoDB and Node.js.

# Instalation
```bash
$ npm install universal-pattern --save
```

# Implementation
```javascript
const http = require('http');
const express = require('express');
const path = require('path');
const config = require('config');
const up = require('universal-pattern');

const app = express();
const server = http.createServer(app);


up(app, {
  swagger: {
    baseDoc: config.get('basePath'),
    host: config.get('host'),
    folder: path.join(process.cwd(), 'swagger'),
  },
  database: {
    uri: config.get('connection.mongodb.uri'),
  },
})
  .then(up => server.listen(5000))
  .catch(err => console.error('Error initializing ', err));
```

Now, create the folder 'swagger' and put into it the first yaml file.

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
