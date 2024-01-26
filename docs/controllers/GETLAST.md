# universal.getLast

Retorna el último documento insertado en una colleciton.


```yaml
  /cars/getlast:
    get:
      tags:
        - cars
      summary: return the last car added
      x-swagger-router-controller: universal.getLast
      responses:
        '200':
          description: car
          schema:
            $ref: '#/definitions/car'
```

