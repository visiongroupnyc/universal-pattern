# Universal Pattern
Universal Pattern is single and easy way to build professionals API using MongoDB and Node.js.

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

## Powered by [Cesar Casas](https://www.linkedin.com/in/cesarcasas)
## Examples

See the `test` folder
```bash
$ cd test
$ node index
```
### Simple social network API with Universal Pattern
* (Universal Pattern Example)[https://github.com/lortmorris/up-example]

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

!Important: remember set both params for connection.mongodb, the uri and the database name.

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
      "uri": "mongodb://127.0.0.1",
      "name": "uptest"
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
  production: process.env.NODE_ENV === 'production',
  database: {
    uri: config.get('connection.mongodb.uri'),
    name: config.get('connection.mongodb.name'),
  },
  routeController: (req, res, next, props) => next(),
})
  .then((upInstance) => server.listen(port, () => console.info(`listen *:${port}`)))
  .catch(err => console.error('Error initializing ', err));
```
* production: if this props is false, we wil have available the interactive documentation (swagger ui)

## Creating models.yaml
Now, create the folder 'swagger' and put into it the first yaml file (e.g models.yaml)

```yaml
paths:
  /models:
    get:
      tags:
        - models
      summary: models list
      x-swagger-router-controller: universal.search
      parameters:
        - $ref: '#/parameters/q'
        - $ref: '#/parameters/page'
        - $ref: '#/parameters/sorting'
        - $ref: '#/parameters/limit'
        - $ref: '#/parameters/fields'

      responses:
        '200':
          description: reports
          schema:
            $ref: '#/definitions/models'
    put:
      tags:
        - models
      summary: insert new cart
      x-swagger-router-controller: universal.insert
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/modelInput'
      responses:
        '200':
          description: cart added
          schema:
            $ref: '#/definitions/models'

    delete:
      tags:
        - models
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
            $ref: '#/definitions/models'

    patch:
      tags:
        - models
      summary: for updated cart document
      x-swagger-router-controller: universal.update
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/modelUpdate'
      responses:
        '200':
          description: updated cart
          schema:
            $ref: '#/definitions/models'

definitions:
  modelInput:
    x-swagger-model-version: 3
    type: object
    properties:
      name:
        type: string
        required: true
      level:
        type: integer
        required: true
      props:
        type: array
        items:
          type: string
        minLength: 4


  modelUpdate:
    type: object
    properties:
      _id:
        type: string
        format: mongoId

  models:
    type: object
    properties:
      name:
        type: string


```

## Runing example.
Finally, run the first UP App.

```bash
$ node app.js
```
Open your browser and go to (http://localhost:5000/services/docs)


# Magic props when define you swagger.

## startAt and endAt
Automatic this props will converted into Date ISO Object.


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
  name: config.get('connection.mongodb.name'),
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
- `empty object`
- `searchParams`: is a object with pagination and sorting properties:
```
{
  limit: integer, // default is 30
  page: integer, // default is 1
  sorting: string // string with props separated by ',' ex: 'name:desc,age:asc'
  q: object with mongodb query
}
```

Example:
```javascript
const result = await upInstance.services.search('/users',
  {},
  {
    page: 1,
    limit: 10,
    sorting: 'name:desc',
    q: {
      age: { $gt: 5 },
    },
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

## aggregate
Run query using aggregate framework.

`aggregate(collection, query, [options = {}])`

Example: get all duplicates emails entries.
```javascript
const query = [
  {
    $group: {
      _id: {
        email: '$email',
      },
      uniqueIds: {
        $addToSet: '$_id',
      },
      count: {
        $sum: 1,
      },
    },
  },
  {
    $match: {
      count: {
        $gt: 1,
      },
    },
  },
];

const items = await Application.services.aggregate(`/${collection}`, query);
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

Important: the model definition should be named 'modeldata' ever!

ex:

```yaml
put:
  tags:
    - models
  summary: insert new cart
  x-swagger-router-controller: universal.insert
  parameters:
    - name: modeldata
      in: body
      required: true
      schema:
        $ref: '#/definitions/modelInput'
```    
The definition should have any name.


## Props by UP

After insert a new document, UP will add own props for a better document manager.

```javascript
{
  _v: 0, // the document version model. This props should be modify by x-swagger-model-version
  _n: 0, // the updated count
}
```

## versioning
x-swagger-model-version prop should be use for set the data model version.
If the prop isn't present, UP automatic will add the prop \_v: 1 .
If preset, the prop \_v value will be x-swagger-model-version value (parser to integer)

## parameters

### input email format
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


### x-swagger-regex
Test the input value using the regex.

```yaml
definitions:
  cartInput:
    type: object
    properties:
      name:
        type: string
        x-swagger-regex: "[az]*"
      cost:
        type: integer
        format: float
      color:
        type: string
        enum:
          - black
          - white
          - blue
          - green
        required: true
      modelId:
        type: string
        format: mongoId
        x-swagger-lookup:
          collection: models
          populate:
            - _id
            - name

```
### input mongoId format
with 'mongoId' you can indicate the format with the follow validations:
- maxLength: 24
- minLength: 24
- is a valid Hex value

Example:
```yaml
definitions:
  logs:
    type: object
    properties:
      categoryId:
        type: string
        format: mongoId
```


## working with Array
We can add arrays like props into modeldata.
You can set items type and minLength (this mean you can set the minimum array elements)
```yaml
modelInput:
  x-swagger-model-version: 3
  type: object
  properties:
    name:
      type: string
      required: true
    level:
      type: integer
      required: true
    props:
      type: array
      items:
        type: string
      minLength: 4
```
## lookup
the prop x-swagger-lookup within a prop definition indicate to UP is necessary have the follow behavior:
- Check if the parent prop if have the 'format: mongoId'
- Run query into defined collection to get the document (over \_id collection prop)
- Populate the props and saved into a new object
- append the new object to the original input model data.

x-swagger-lookup should be use only for PUT and UPDATE methods, never for GET or DELETE.

## unique prop
The prop `x-swagger-unique` indicate to Universal Pattern the prop should be check if the value already exists or not.

### Example
```yaml
definitions:
  userInput:
    type: object
    properties:
      firstname:
        type: string
        required: true
      lastname:
        type: string
        required: true
      email:
        type: string
        format: email
        required: true
        x-swagger-unique: true
```
---

# the param 'q'

The param q is use for all search endpoints (getters).
Only with this property we can do any search action.

## by ObjectId
Just use "\_" before prop name.
Remember, for embed props don't save the data like ObjectId, just like string.
Ex: search by \_id
 ```bash
 q=_id:3A5a1f3da747404c2a510dfa24
 ```

## by regular expression

Search all document where the prop name like 'tiago'
```bash
q=name:/tiago/
```

Search all documents where prop age is equal to nunber 31
## by numbers (integers)
```bash
q=age:.31.
```


## By boolean props

Get all documents where prop enable is false.
Options: true or false
```bash
q=enable:|false|
```

## Is NOT this values
Get all documents where name is NOT pepe
```bash
q=name:!pepe!
```

## By NULL OR NOTNULL
If we need filter by NULL or NOTNULL just use this words to upper case.
Ex: get all document where valid is NOTNULL
```bash
q=valid:NOTNULL
```

## By range
for filter by number range, use the special chars [] and | for separate from/to
Ex: get all document where score is between 100 and 200
```bash
q=score:[100|200]
```

## By gt or lt number
You can search using "<" or ">", setting the number value between the chars.
Ex: get all document where age is > 40
```bash
q=age:>40>
```

## Using $in
For search into a prop with differents options, you can use {} operators.
```bash
q=name:{Toyota|Fiat}
```
---

# Example
For a real example, see (https://github.com/lortmorris/up-example)

# Change log
## Dec 18, 2017
- Added \_id into update object for hooks

## nov 18, 2018
- Hotfix:
- Fix props.value when the type is integer.
- Added support for array prop type.
- Added support for  minLength into array type.
- Added support for items.type into array type.
- Added new properties into default saved document:
  - \_n: count the document updates.
  - \_v: the document version (x-swagger-model-version).
- Added lookup support!.

## Jan 9, 2020
- Hotfix for object properties definitions.

## Jan 13, 2020
- Hotfix for boolean type
- Replace Object.assign for {}
- Added `routeController` prop into upInstance. params (req, res, next, props )
- Removed `value` subprop from swagger.params.
- coordinates field fixed.

## Feb 25, 2020
- Hotfix: remove by _id

## May 17, 2021
- Removed nodejs package
- New vg-mongo package implemented (Vision Group MongoDB driver written by Cesar Casas)

## June 16, 2021
- Reeplaced MongoJS for vg-mongo

## June 21, 2021
- Added support for use Universal Pattern without MongoDB connection.
- Fix error handler

# License
[MIT](LICENSE)
