# Universal Pattern
Universal Pattern es una librería que permite de una forma muy simple crear microservicios y endpoint utilizando [Node.js](https://nodejs.org), [Swagger](https://editor.swagger.io) y [MongoDB](https://www.mongodb.com/).

El concepto principal es crear archivos `yaml` que denerán estar alojados en el directorio `swagger`.
Cada archivo `yaml` representa un módulo para Universal Pattern.
Por ejemplo, si queremos crear un ABM de `brands`, debemos crear un archivo llamando `brands.yaml` dentro del directorio swagger.

Dentro de la definición del archivo swagger, estableceremos los distintos endpoints (ruta + método http).
Podemos definir que tipo de datos de entrada necesitamos, y cual será el dato de salida.

Como ya se estará dando cuenta, el propócito de Universal Pattern es poder definir módulos y que los mismos funcionen, sin necesidad de programación adicional (es decir, no tener que escribir el código de los módulos).

Las ventajas principales son:

- Alta velocidad de desarrollo
- Documentar es darle vida a los endpoints
- Validaciones
- Swagger con esteroides!
- Poder probar los endpoints en el mismo servicio! solo accediendo al directorio `/docs`

Powered by [Cesar Casas](https://www.linkedin.com/in/cesarcasas)

Funded by [Vision Group NYC](https://visiongroup.nyc)

## Contenido

- [Universal Pattern](#universal-pattern)
	- [Contenido](#contenido)
	- [📋 Requerimientos](#-requerimientos)
- [Instalación](#instalación)
- [Primer modulo](#primer-modulo)
	- [Crear directorios](#crear-directorios)
	- [Creando module yaml](#creando-module-yaml)
	- [Creamos app.js](#creamos-appjs)
	- [Ejecutando!](#ejecutando)
- [Ejemplo](#ejemplo)
- [License](#license)

## 📋 Requerimientos
Antes de comenzar a trabajar con Universal Pattern, debemos tener instalado previamente

- Node.js (version 20 o superior)
- MongoDB

# Instalación
Recomendamos utilizar Universal Pattern desde un entorno Linux, aunque funcionará sin problemas en entornos Windows y MacOS.

```bash
$ npm install universal-pattern --save
```

Es importante entender que para trabajar con Universal Pattern deberemos crear una estructura básica de archivos y directorios.

```
SuProyecto/
	├ swagger/			# Directorio donde guardaremos nuestros archivos yaml (módulos)
	├ controllers/		# Directorio donde se guardan los controladores customizados
	├ hooks/			# Directorio donde se guarda los hooks customizados
	├ app.js			# nuestro archivo de aplicación
	├ package.json
```

# Primer modulo
🎉 Vamos a crear tu primer módulo con Universal Pattern.
Primero que nada crearemos un proyecto nuevo utilizando npm (el manejador de paquetes de Node.js, deberán tenerlo instalado).
Recuerde que es necesario tener instalado Node.js version 20 o superior y MongoDB version 6 o superior.


```bash
$ mkdir up-example
$ cd up-example
$ npm init
```

El comando npm init nos hará una seríe de preguntas.

- package name: dejamos el que está por default (up-example), presionamos enter
- version: presionamos enter.
- description: podemos indicar o no una descripción, es opcional.
- entry point: aquí ingresaremos "app.js"
- test command: aquí ingresaremos "node".
- git repository: nos está preguntando cual será el path o url de nuestro repositorio de git. Presionamos enter.
- keywords: presionamos enter
- author: ingresamos nuestro nombre
- license: presionamos enter
- Is this OK?: presionamos enter

## Crear directorios

```bash
$ mkdir swagger
$ mkdir controllers
$ mkdir hooks
$ npm install universal-pattern --save
```

## Creando module yaml
Ahora crearemos el archivo `models.yaml` dentro del directorio `swagger` con el siguiente contenido.

```yaml
paths:
  /models:
    get:
      tags:
        - models
      summary: models list
      x-swagger-router-controller: universal.search
      parameters:
        - $ref: '#/parameters/q'
        - $ref: '#/parameters/page'
        - $ref: '#/parameters/sorting'
        - $ref: '#/parameters/limit'
        - $ref: '#/parameters/fields'

      responses:
        '200':
          description: reports
          schema:
            $ref: '#/definitions/models'
    put:
      tags:
        - models
      summary: insert new model
      x-swagger-router-controller: universal.insert
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/modelInput'
      responses:
        '200':
          description: model added
          schema:
            $ref: '#/definitions/models'

    delete:
      tags:
        - models
      summary: delete model
      x-swagger-router-controller: universal.remove
      parameters:
        - $ref: '#/definitions/by_id'
      responses:
        '200':
          description: deleted model
          schema:
            $ref: '#/definitions/models'

    patch:
      tags:
        - models
      summary: for updated model document
      x-swagger-router-controller: universal.update
      parameters:
        - name: modeldata
          in: body
          required: true
          schema:
            $ref: '#/definitions/modelUpdate'
      responses:
        '200':
          description: updated model
          schema:
            $ref: '#/definitions/models'

definitions:
  modelInput:
    x-swagger-model-version: 2
    type: object
    properties:
      name:
        type: string
        required: true
        minLength: 4
      description:
        type: string
      scoring:
        type: integer
        decimal: 0
        requied: true
        min: 1
        max: 100

  modelUpdate:
    type: object
    properties:
      _id:
        type: string
        format: mongoId

  models:
    type: object
    properties:
      name:
        type: string
      description:
        type: string
      scoring:
        type: integer

```

## Creamos app.js
Ahora es momento de crear el archivo `app.js` que tendrá el siguiente contenido:

```javascript
const path = require('node:path');
const up = require('universal-pattern');
const swaggerFolder = path.join(process.cwd(), 'swagger'); // definimos el directorio swagger
const params = {
	swagger: {
		baseDoc: process.env.BASEPATH, // es el directorio base de nuestro servicios. Ej: '/services'
		host: `${process.env.HOST}:${process.env.PORT}`, // el host, default localhost.
		folder: swaggerFolder, // el directorio swagger
		info: {
			version: 2.0,
			title: 'Universal Pattern Example',
			termsOfService: 'www.domain.com/terms',
			contact: {
				email: 'cesar@visiongroup.nyc',
			},
			license: {
				name: 'Apache',
				url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
			},
		},
	},
	compress: true, // indica que el output deberá estar comprimido
	cors: true, // habilita cors
	production: false, // indica si está en modo producción. En modo producción no se permite el acceso a la documentación
	routeController: (req, res, next) => next(), // controlador a ejecutar antes que cualquier otro controlador.
	port: process.env.PORT, // puerto donde correrá nuestro servicio
	database: { // la configuración de la base de datos.
		uri: process.env.CONNECTION, // string de connection a la base de datos
		name: process.env.DBNAME, // nombre de la base de datos
	},
};

async function init() {
	try {
		const upInstance = await up(params); // creamos una instancia de UP
		console.info(`UP InstanceId: ${upInstance.instanceId}`);
	} catch (err) {
		console.error('Error initializing ', err);
	}
}

init(); // iniciamos nuestro servicio
```


## Ejecutando!
Ahora vamos a ejecutar nuestro ejemplo.

```bash
$ node app.js
HOST=localhost PORT=5000 CONNECTION=mongodb://127.0.0.1:27017 DBNAME=uptesting BASEPATH=/services node app.js
```

Abrimos nuestro navegador en la siguiente url (http://localhost:5000/services/docs) y veremos la documentación de nuestro nuevo módulo (y obviamente, podremos probarlo!)


# Ejemplo
Podemos ver un ejemplo completo de implementación en [este link](https://github.com/visiongroupnyc/universal-pattern/tree/master/test)

# License
[MIT](LICENSE)
