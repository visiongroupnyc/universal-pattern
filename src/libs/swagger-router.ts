import { default as Debug } from "debug";
import { type Request, type Response, type NextFunction } from "express";

const debug = Debug("up:libs:swagger-router");

type SwaggerPath = {
	[key: string]: {
		[key: string]: any;
	};
};

type Application = {
	app: {
		[method: string]: (
			path: string,
			...handlers: ((req: Request, res: Response, next: NextFunction) => void)[]
		) => void;
	};
	controllers: {
		[key: string]: (req: Request, res: Response, next: NextFunction) => void;
	};
	swagger: {
		basePath: string;
		paths: SwaggerPath;
	};
	localOptions: {
		routeController: (
			req: Request,
			res: Response,
			next: NextFunction,
			props: any,
		) => void;
	};
};

export const swaggerRouter = (Application: Application) => {
	const { app, controllers, swagger, localOptions } = Application;

	const { paths } = swagger;
	const swaggerRouterManager =
		(props: any) => (req: Request, res: Response, next: NextFunction) =>
			localOptions.routeController(req, res, next, props);

	Object.entries(paths).forEach(([path, value]) => {
		Object.entries(value).forEach(([method, props]) => {
			const cbError = () => {
				throw new Error(
					`Handler not found: ${props["x-swagger-router-controller"]}`,
				);
			};
			const handler = () =>
				controllers[props["x-swagger-router-controller"]] || cbError;
			const basePath = swagger.basePath
				.replace("http://", "")
				.replace("https://", "");
			const finalpath = `${basePath}${path}`;

			debug(
				"Adding controller: ",
				finalpath,
				controllers[props["x-swagger-router-controller"]],
			);
			app[method](
				finalpath,
				swaggerRouterManager(props),
				async (req: Request, res: Response, next: NextFunction) => {
					try {
						handler()(req, res, (err: Error) => {
							if (err) {
								debug("Controller catch Error: ", err);
								return res
									.status(503)
									.json({
										code: "controller_error_catched",
										message: err.toString(),
										success: false,
									})
									.end();
							}
							return next();
						});
					} catch (err) {
						console.info("Internal Error: ", err);
						res.status(500).end(err.toString());
					}
				},
			);
		});
	});
};
