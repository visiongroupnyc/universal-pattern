const encrypt = require('../helpers/encrypt');

const { getSalt } = require('../helpers/salt');
const { signJWT } = require('../helpers/jwt');

/*
El código que has proporcionado define un controlador para la autenticación de usuarios dentro de una aplicación que\
utiliza Universal Pattern. Este controlador maneja el proceso de inicio de sesión y autenticación de los usuarios. Aquí te explico paso a paso lo que hace el código:

Requerir módulos auxiliares: Se importan funciones auxiliares para la encriptación (encrypt), la obtención de la 'sal' (getSalt) y la creación de JWTs (signJWT) desde sus respectivos módulos.

Definición del Controlador de Usuarios: Se define una función usersController que toma una instancia de Universal Pattern
(upInstance). Dentro de esta función, se accede al servicio services desde upInstance.

Registro del Método de Inicio de Sesión:

El método registerController de upInstance registra una nueva ruta 'Users.login' que manejará las peticiones de inicio de sesión.
Dentro de la función de inicio de sesión, se extraen las credenciales del usuario (email y password) de la solicitud (req). El email se convierte a minúsculas y se elimina cualquier espacio en blanco.
Verificación de las Credenciales:

Se busca un usuario en la base de datos con el email proporcionado utilizando services.findOne.
Si no se encuentra un usuario con ese email, se devuelve un estado HTTP 404 con un mensaje indicando que el usuario no se encontró.
Si se encuentra el usuario, se compara la contraseña proporcionada con la almacenada en la base de datos después de ser
encriptada con la 'sal' correspondiente. Si la contraseña no coincide, se devuelve un estado HTTP 401 con un mensaje de error.
Generación del JWT:

Si el usuario existe y la contraseña es válida, se genera un JWT usando la función signJWT, que seguramente toma el objeto de usuario existente y crea un token basado en él.
Finalmente, se devuelve una respuesta JSON con el JWT al cliente.
Manejo de Errores:

Si ocurre un error durante el proceso de inicio de sesión, se captura en un bloque catch, se imprime en la consola y se devuelve un estado HTTP 500 con la representación en cadena del error.
Exportación del Controlador:

La función usersController se exporta para que pueda ser utilizada en otra parte de la aplicación.
Este controlador es una parte esencial para la autenticación en la aplicación, ya que permite a los usuarios iniciar sesión
y obtener un JWT que probablemente se utilice para autenticar solicitudes posteriores a la API.
*/
const usersController = (upInstance) => {
	const {
		services,
	} = upInstance;

	upInstance.registerController('Users.login', async (req, res) => {
		const Credentials = req.swagger.params.modeldata.value;
		const email = Credentials.email.toLowerCase().trim();
		const password = Credentials.password;

		try {
			const exists = await services.findOne('/users', {
				email,
			});

			if (!exists) {
				return res.status(404).end('User not found');
			}

			if (exists.password !== encrypt(password, getSalt(exists.salt))) {
				return res.status(401).end('Invalid user or password');
			}

			const jwt = signJWT(exists);
			return res.json({
				jwt,
			});
		} catch (err) {
			console.error('Error login: ', err);
			return res.status(500).end(err.toString());
		}
	});
};

module.exports = usersController;
