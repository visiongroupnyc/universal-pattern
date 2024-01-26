# universal.count

Cuenta el total de registros dentro de una collection.

```yaml
  /feed/count:
    get:
      tags:
        - feed
      summary: return total items feed
      x-swagger-router-controller: universal.count
      responses:
        '200':
          description: feed by id
          schema:
            $ref: '#/definitions/feeditem'
```
