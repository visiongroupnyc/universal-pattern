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
  "basePath": "/services",
  "host": "localhost",
  "port": 5000,
  "name": "up-example",
  "version": "0.1",
  "connection": {
    "mongodb": {
      "uri": "mongodb://127.0.0.1/uptest"
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
        name: 'Apache',
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

## Creating carts.yaml
Now, create the folder 'swagger' and put into it the first yaml file (e.g carts.yaml)

```yaml
paths:
  /carts:
    get:
      tags:
        - carts
      summary: reports list
      x-swagger-router-controller: universal.search
      parameters:
        - $ref: '#/parameters/q'
        - $ref: '#/parameters/page'
        - $ref: '#/parameters/sorting'
        - $ref: '#/parameters/limit'
        - $ref: '#/parameters/fields'
        - name: coordinates
          in: query
          type: string
          default: "0,0,0"
          description: search by coordinates struct. long,lat,radius
      responses:
        '200':
          description: reports
          schema:
            $ref: '#/definitions/cart'
    put:
      tags:
        - carts
      summary: insert new cart
      x-swagger-router-controller: universal.insert
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/cart'
      responses:
        '200':
          description: cart added
          schema:
            $ref: '#/definitions/cart'

    delete:
      tags:
        - carts
      summary: delete cart
      x-swagger-router-controller: universal.remove
      parameters:
        - name: _id
          in: query
          required: true
          type: string
      responses:
        '200':
          description: deleted cart
          schema:
            $ref: '#/definitions/cart'

    patch:
      tags:
        - carts
      summary: for updated cart document
      x-swagger-router-controller: universal.update
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/cart'
      responses:
        '200':
          description: updated cart
          schema:
            $ref: '#/definitions/cart'

definitions:
  cart:
    type: object
    properties:
      name:
        type: string
      color:
        type: string
        enum:
          - black
          - white
          - blue
          - green
        required: true
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
---
# services methods.
The services are available into 'service' prop of 'Universal Pattern', usually called upInstance.

In all cases, the first argument is 'module name'. Remember, into UP the module name is the first name after '/' in url.
For example, for use the module 'users', the argument is '/users'.

## search
search into collection.

`search(module [,query, page, fields]);`

return Promise with result.

- `module`: string, the module name. Ex: '/users'
- `query`: just a MongoDB query.
- `page`: is a object with pagination and sorting properties:
```
{
  limit: integer, // default is 30
  page: integer, // default is 1
  sorting: string // string with props separated by ',' ex: 'name:desc,age:asc'
}
```

Example:
```javascript
const result = await upInstance.services.search('/users',
{
  age: { $gt: 5 },
},
{
  page: 1,
  limit: 10,
  sorting: 'name:desc',
});
```
## today
Get the last 500 documents inserted today.

`today(module);`

- `module`: string, the modulo name.

Example:
```javascript
  const logs = await upInstance.services.today('/logs');
```

## insert
Insert a new document into module.

`insert(module, document);`
- `module`: string, the module name. Ex: '/users'
- `document`: object, the document will be save.


Example:
```javascript
  upInstance.services.insert('/logs', {
    url: req.url,
  });
```
`Important: The service insert will add 'added' prop.`

## findOne
Search the first document.

`findOne(module, query, fields);``

- `module`: string, the module name. Ex: '/users'
- `query`: object, the mongoDB query.
- `fields`: object, the props should be populate. If empty, return all document prop.

Example:
```javascript
  const userData = await upInstance.service.findOne('/users', { _id: upInstance.db.ObjectId(userId) }, { name: 1, age: 1 });
```

## remove
Remove document by id.

`remove(module, id);`
`
- `module`: string, the module name. Ex: '/users'
- `id`: string, the mongoDB document id.

Example:
```javascript
  const removed = await upInstance.services.remove('/users', '5a1f3dabe8c5272a5f78f779');
```

## removeAll
Remove all document when match with query.

`removeAll(module, query);`
- `module`: string, the module name. Ex: '/users'
- `query`: object, the mongoDB query.

```javascript
  upInstance.services.removeAll('/logs', { added: { $lt: new Date() } });
```

## update
Update document.
`update(module, id, data[, opts = { updated: true, set: true }])`

- `module`: string, the module name. Ex: '/users'
- `id`: string, the document id.
- `data`: object, the new props to assign.
- `opts`: object, options:
  - `updated`: boolean, if true, added or updated the prop updated. Default is true.
  - `set`: boolean, if true, the method will add the $set operator. Default is true.


Example:
```javascript
  const updated = await upInstace.services.update('/items',
    '5a1f3da42c0f5e2a41ed0439',
    {
      $inc: { totalComments: 1 },
    },
    {
      set: false,
    },
  );
```

## updateByFilter
Update documents by query.

`updateByFilter(module, query, data [,opts = { updated: true, set: true }])`

- `module`: string, the module name. Ex: '/users'
- `id`: string, the document id.
- `query`: object, the mongoDB query.
- `data`: object, the new props to assign.
- `opts`: object, options:
  - `updated`: boolean, if true, added or updated the prop updated. Default is true.
  - `set`: boolean, if true, the method will add the $set operator. Default is true.


Example:
```javascript
  const updated = await upInstace.services.updateByFilter('/items',
    '5a1f3da42c0f5e2a41ed0439',
    {
      'user.age': { $lg: 5 },
    },
    {
      $inc: { totalComments: 1 },
    },
    {
      set: false,
    },
  );
```

## count
Return the total document matched with query.

`count(module, query)`

- `module`: string, the module name. Ex: '/users'
- `query`: object, the mongoDB query.

```javascript
  const totalComments = await upInstance.services.count('/comments', {
    'user._id': '5a1f3dabe8c5272a5f792137',
  });
  const updated = await upInstance.services.updateByFilter('/users', {
    totalComments,
  });
```

## getLast
Return the last document match with query.

`getLast(module, query, fields);`

- `module`: string, the module name. Ex: '/users'
- `query`: object, the mongoDB query.
- `fields`: object, the props should be populate. If empty, return all document prop.

```javascript
  const lastComment = await upInstance.services.getLast('/comments', {
  'user._id': '5a1f3da42c0f5e2a41ed042c',
}, {
  _id: 1,
  text: 1,
});
```

## find
Search documents without pagination system.

`find(module, query[, fields]);`

- `module`: string, the module name. Ex: '/users'
- `query`: object, the mongoDB query.
- `fields`: object, the props should be populate. If empty, return all document prop.

```javascript
  const messages = await upInstance.services.find('/messages', {
  'user._id': '5a1f3da42c0f5e2a41ed042c',
  }, {
    _id: 1,
    body: 1,
    urlCanonical: 1,
  });
  const tasks = await Promise.all(
    messages.map(m => upInstance.services.updateByFilter('/likes', {
        messageId: m._id.toString(),
      },
      {
        'message.urlCanonical': m.urlCanonical,
      }
    )),
  );
```


---

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

// global Hooks
upInstance.addHook('*', 'beforeSearch', async (req, searchParams, UPInstance) => {
  return Promise.resolve(params);
});
upInstance.addHook('*', 'afterSearch', async (req, searchResults, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('*', 'beforeInsert', async (req, dataDocument, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('*', 'afterInsert', async (req, insertedDocument, UPInstance) => {
  return Promise.resolve(params);
});

// Update hooks
upInstance.addHook('*', 'beforeUpdate', async (req, dataDocument, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('*', 'afterUpdate', async (req, updatedDocument, UPInstance) => {
  return Promise.resolve(params);
});

// Remove hooks
upInstance.addHook('*', 'beforeRemove', async (req, documentId, UPInstance) => {
  return Promise.resolve(params);
});

upInstance.addHook('*', 'afterRemove', async (req, removedDocument, UPInstance) => {
  return Promise.resolve(params);
});


```

---
# Register controllers
```javascript
upInstance.registerController('module.methodControllerName', (req, res, next) => {
  console.info(req.swagger);
  res.json({ ok: true });
});
```


---
# internal swagger properties.

## parameters
### input email property
Example:
```yaml
definitions:
  logs:
    type: object
    properties:
      type:
        type: number
        default: 5
        required: false
      email:
        type: string
        format: email
        required: true
```
---
# Example

For a real example, see (https://github.com/lortmorris/up-example)
