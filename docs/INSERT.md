# Insert methods
Dentro de Universal pattern contamos con distintos controladores para insertar documentos.

- insert: inserta un documento nuevo.
- insertOrCount: inserta un nuevo documento si solo si la propiedad indicada no está marcada como `unique` y el valor existe previamente.

## universal.insert

El controlador `insert` permite insertar un nuevo documento dentro de una collection.
Retornará el documento insertado con el `_id` asignado por MongoDB. Adicionalmente dos propiedades:
- `added` : la marca de tiempo (ISODate) en la que se insertó el documento.
- `_v` : indica la version del documento (no la cantidad de actualizaciones)
- `_n` : indica la cantidad de actualizaciones que ha sufrido el documento.
- `_updated`: la fecha/hora de la última actualización del documento

## universal.insertOrCount

Insertará un nuevo documento pero analizando si existe uno previamente con la key:value indicada.
Por ejemplo, imaginemos que queremos insertar un nuevo usuario, pero no queremos que se repita el email.

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

Como vemos, la propiedad email tiene la propiedad `x-swagger-unique`, lo que le indica a Universal Pattern que no se puede repetir ese email dentro de la collection.

En caso de que el key:value ya exista previamente, la propiedad `_retry` se incrementará en 1.
Esta propiedad funcionará como registro testigo de las veces que se ha intentado insertar un nuevo documento que tenga previamente key:value declarados como unique.


## x-swagger-lookup

Cuando insertamos un nuevo document, a la hora de definir el schema de dato, podemos hacer uso de la propiedad `x-swagger-lookup`.

Esta propiedad indica que se deberá buscar en la collection indicada el Id que se pasa como argumento, y si solo si existe, se procede con la inserción del documento.
Podemos indicar que propiedades queremos popular de la collection a la cual le hacemos lookup.

En el siguiente ejemplo, para insertar un nuevo documento en la collection `cars`, debemos usar la prop `brandId`, la cual es un lookup hacia la collection brands.
Si el brandId existe dentro de la collection `brands`, se popularán las propiedades `_id` y `name`.


```yaml
definitions:
  carInput:
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
          - gray
          - yellow
        required: true
      brandId:
        type: string
        format: mongoId
        x-swagger-lookup:
          collection: brands
          populate:
            - _id
            - name
```
