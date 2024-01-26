# services.findOne

Busca un document dentro de una collection.
Retorna un object or null si no encuentra documento.

```javascript
const result = await services.findOne('/cars', query = { name: /auto/ },  props = {});
```

- props:
	- skip: el total de documentos a saltar
	- sort: objecto con las propiedades a ordenar ({ _id: -1 })
	- limit: total de documentos a obtener (máximo)
	- projection: las propiedades que queremos popular
