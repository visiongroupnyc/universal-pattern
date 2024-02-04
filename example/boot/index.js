const encrypt = require('../helpers/encrypt');
const { generateSalt } = require('../helpers/salt');

/*
El fragmento de código que has proporcionado parece ser parte de una función de arranque (bootstrap) para una aplicación
que utiliza la biblioteca Universal Pattern. La función Boot se llama típicamente al iniciar la aplicación y realiza las siguientes operaciones:

Verificación de Usuario Superadministrador: Se verifica si existe un usuario con un nivel de acceso de 50
(superadministrador) en la base de datos utilizando el método findOne. Si no se encuentra dicho usuario, se procede a crear uno.

Creación de Usuario Superadministrador: Si no existe un superadministrador, se imprime un mensaje en la consola.
Luego se genera una nueva 'sal' utilizando la función generateSalt.
Después, se crea un nuevo usuario con los datos proporcionados (nombre, apellido, correo electrónico, criterio y contraseña cifrada junto con el nivel de acceso y la 'sal' generados).

Configuración del Índice de la Base de Datos: Se crea un índice en la colección users de la base de datos para el
campo email con un valor de índice de -1, lo que generalmente significa un índice descendente.

Finalización: Una vez que se completan estas operaciones, la función retorna true, indicando que el proceso de arranque se ha completado con éxito.

Algunos puntos importantes a tener en cuenta:

La función generateSalt es una utilidad para crear una 'sal', que es una cadena de caracteres aleatorios que se utiliza para añadir complejidad a las contraseñas antes de cifrarlas.

La función encrypt cifra la contraseña junto con la 'sal'. La contraseña 'SET_PASSWORD' debe ser reemplazada por una contraseña segura antes de poner en producción el código.

Se utiliza una estructura de objetos destructurados para extraer services y db del objeto upInstance.
Esto sugiere que upInstance es un objeto que contiene la configuración y los servicios de la aplicación.

Es importante tener en cuenta que el correo electrónico 'mail@example.com' y la contraseña 'SET_PASSWORD' son datos de
ejemplo y deben ser reemplazados por valores válidos y seguros en un entorno de producción.

El manejo de contraseñas y la creación de usuarios administrativos son operaciones sensibles y deben tratarse con cuidado,
asegurando que la información sensible no se almacene en el código fuente y que las credenciales administrativas no sean
accesibles para partes no autorizadas.
*/

async function Boot(upInstance) {
	const {
		services,
		db,
	} = upInstance;

	const hasSuperAdminUser = await services.findOne('/users', { level: 50 });
	if (!hasSuperAdminUser) {
		console.info('without super admin user');
		const salt = generateSalt();
		await services.insert('/users', {
			firstName: 'Universal',
			lastName: 'Pattern',
			email: 'mail@example.com',
			criterial: 'universal pattern example',
			password: encrypt('SET_PASSWORD', salt),
			active: true,
			level: 50,
			salt,
		});
	}

	await db.users.createIndex({ email: -1 });
	return true;
}

module.exports = Boot;
