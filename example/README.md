# Universal Pattern Microservice Example

Se propone desarrollar una red social de fanáticos de autos.
El sistema permitirá buscar autos por marca, y que cada usuario pueda hacer una review de los autos encontrados.

Esa review quedará en el feed del usuario que la realiza.

Los usuarios de la red social podrán dejar comentarios sobre las reviews realizadas, como así tambien like.

# Como ejecutar el ejemplo?

Antes de ejecutar el ejemplo dentro del directorio `example` es necesario contar con Node.js v20 o superior y MongoDB 6 o superior.

Si es necesario, puede editar el archivo `server.sh` para cambiar la configuración del acceso a la base de datos, puerto, etc.

```bash
$ git clone https://github.com/visiongroupnyc/universal-pattern.git
$ cd universal-pattern
$ npm install
$ cd example
$ ./server.sh
```

Ahora podemos abrir nuestro navegador y ver la [documentación de los endpoints](http://localhost:5000/services/docs)
# Modulos definidos

Todos los modulos definidos están documentados gracias a swagger.

## Users
El módulo de usuarios tiene algunos detalles importantes:
- Permite login y retorna un jwt.
- Cuando se ejecute el ejemplo por primera vez, se creará un usuario nivel 50 (el administrador):
  - mail@example.com / SET_PASSWORD
- Algunos endpoints requieren auth, es decir, que el usuario esté autentificado.
- Algunos endpoints requieren nivel 50.


## Brands
Son las marcas de autos.
Se deberá tener las marcas de los autos en una collection.

Sólo un usuario nivel 50 puede crear marcas.

## Cars
Es el módulo que trabaja con los autos en si.
Para insert un nuevo `car` debemos tener en consideración:

- Los colores disponibles están en un enum, por lo cual si pasamo un color que no esté en la lista, UP retornará un error.
- El `brandId` debe ser un id válido de MongoDB, y existir en la collection `brand`


## Feed
Cada usuario tiene un feed con toda su activdad.

## Feed Comments

## Feed Likes

## Ratings
