# routeController

A la hora de defnir las propiedades de Universal Pattern nos encontraremos con la posibilidad de definir una propiedad llamada `routeController`.
Esta propiedad espera como valor una function (mws).
Básicamente es un interceptor de todos los request, antes de que ingresen al sistema de controllers de UP.

Por default, recomendamos este ejemplo:

```javascript
routeController: (req, res, next) => { next(); },
```

## En que caso deberíamos utilizarlo?
Imaginen que tiene un sistema de autentificación basados en JWT.
Lo que podemos hacer es controlar que el JWT sea válido, por ejemplo.

Otro ejemplo, es definir niveles de acceso a los endpoint por medio de una propiedad (que estará en el JWT).

