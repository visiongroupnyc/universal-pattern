
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
