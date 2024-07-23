# services.today

Retorna todos los documentos insertados en el día actual

Example:

```javascript
  const logs = await upInstance.services.today('/logs', {
    limit: 10000, // limit documents
    sort: { _id: -1 } // sort
  });
```
