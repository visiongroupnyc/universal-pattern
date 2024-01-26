# Universal Pattern Microservice Example

Se propone desarrollar una red social de fanáticos de autos.
El sistema permitirá buscar autos (por marca), y que cada usuario pueda hacer una review de los mismos.
Esa review quedará en el feed del usuario.

Los usuarios de la red social podrán dejar comentarios sobre las reviews realizadas, como así tambien like.

# Como ejecutar el test?

Antes de ejecutar el ejemplo dentro del directorio `test` es necesario contar con Node.js v20 o superior y MongoDB 6 o superior.

Si es necesario, puede editar el archivo `server.sh` para cambiar la configuración del acceso a la base de datos, puerto, etc.

```bash
$ git clone https://github.com/visiongroupnyc/universal-pattern.git
$ cd universal-pattern
$ npm install
$ cd test
$ ./server.sh
```

# Modulos definidos

## Users

Los datos que necesitamos para dar de alta a un usuario son:
- fistName
- lastName
- Email.

* No se podrá tener mas de un usuario con el mismo E-Mail.

## Brands
Son las marcas de autos.
Se deberá tener las marcas de los autos en una collection.


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

