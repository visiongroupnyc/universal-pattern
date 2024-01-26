# Universal Pattern Microservice Example.

Se propone desarrollar una red social de fanáticos de autos.
El sistema permitirá buscar autos (por marca), y que cada usuario pueda hacer una review de los mismos.
Esa review quedará en el feed del usuario.

Los usuarios de la red social podrán dejar comentarios sobre las reviews realizadas, como así tambien like.


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

## Feed
Cada usuario tiene un feed con toda su activdad.

## Feed Comments

## Feed Likes

## Ratings

# Running
```bash
DEBUG=up* ./server.sh
```
