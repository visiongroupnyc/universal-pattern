# Swagger definition
El objetivo de Universal Pattern es tener dentro del directorio `swagger` cada uno de nuestros `modulos`.

Es importante comprender que los distintos `metodos` de nuestros módulos deberán estar en el mismo archivo.

Veamos un ejemplo del archivo `swagger/brands.yaml`

```yaml
paths:
  /brands:
    get:
      tags:
        - brands
      summary: brands list
      x-swagger-router-controller: universal.search
      parameters:
        - $ref: '#/parameters/q'
        - $ref: '#/parameters/page'
        - $ref: '#/parameters/sorting'
        - $ref: '#/parameters/limit'
        - $ref: '#/parameters/fields'

      responses:
        '200':
          description: return all brand from database
          schema:
            $ref: '#/definitions/brand'
    put:
      tags:
        - brands
      summary: insert new brand
      x-swagger-router-controller: universal.insert
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/brandInput'
      responses:
        '200':
          description: brand added
          schema:
            $ref: '#/definitions/brand'

    delete:
      tags:
        - brands
      summary: delete brand
      x-swagger-router-controller: universal.remove
      parameters:
        - $ref: '#/parameters/by_id'
      responses:
        '200':
          description: deleted brand
          schema:
            $ref: '#/definitions/brand'

    patch:
      tags:
        - brands
      summary: for updated brand document
      x-swagger-router-controller: universal.update
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/brandUpdate'
      responses:
        '200':
          description: updated brand
          schema:
            $ref: '#/definitions/models'

definitions:
  brandInput:
    x-swagger-model-version: 2
    type: object
    properties:
      name:
        type: string
        required: true


  brandUpdate:
    type: object
    properties:
      _id:
        type: string
        format: mongoId

  brand:
    brand: object
    properties:
      _id:
        type: string
        format: mongoId
      name:
        type: string
      totalCars:
        type: number

```

Recordemos que Universal Pattern leerá todos los archivos ubucados en el directorio `swagger` automáticamente cuando inicia.

A la hora de definit nuestro archivo `yaml`, podemos utilizar una serie de propiedades que serán interpretadas por Universal Pattern.


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