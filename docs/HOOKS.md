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