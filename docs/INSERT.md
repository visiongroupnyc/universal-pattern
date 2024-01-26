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
