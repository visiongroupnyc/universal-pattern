# services.find

Busca documentos dentro de una collection.
Retorna un array.

```javascript
const result = await services.find('/cars', query = { name: /auto/ }, fields = {}, props = {});
```

- fields: propiedades a popular
- props:
	- skip: el total de documentos a saltar
	- sort: objecto con las propiedades a ordenar ({ _id: -1 })
	- limit: total de documentos a obtener (máximo)
	- projection: opera igual que el parámetro `fields`

Dentro de props podemos utilizar cualquiera de las propiedades disponibles en el driver de MongoDB.
