# services.search

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
