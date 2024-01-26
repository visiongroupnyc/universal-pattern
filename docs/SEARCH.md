# Búsquedas con Universal Pattern.

Dentro de Universal Pattern contamos con un controller llamado `search`, el cual permite buscar por medio de una serie de query params ya definidos dentro de una collection.

El resultado se retornará con la siguiente estructura

```javascript

```


## Argumentos de búsqueda.

- page: Indicar el número de página que se quiere obtener.
- limit: indicar el total de documentos por página
- fields: indicar las propiedades que queremos popular de cada documento.
- distinct: indicar que queremos solo documentos distintos en base a la propiedad pasada como argumento.
- coordinates: si nuestra colección de datos cuenta con un índice geo espacial, podemos indicar que queremos documentos que estén a una distancia X de una coordenada.
- q: es el argumento que nos permitirá hacer búsquedas por valores.


## el Argumento `q`

- _id: indica que queremos el documento  con el `_id` indicado.
