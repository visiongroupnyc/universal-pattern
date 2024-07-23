# Controllers
Dentro de universal pattern podemos utilizar controladores propios para ser ejecutados por endpoints definidos en swagger.

No es necesario pero si super recomendado utilizar un nombre de controlador que se identifique con el modulo y el nombre del controlador.

Por ejemplo, si queremos crear un grupo de endpoints con controladores propios


```javascript
upInstance.registerController('MyMoudleName.ControllerName', (req, res, next) => {
  console.info(req.swagger);
  res.json({ ok: true });
});

```
