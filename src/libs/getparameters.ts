import { default as Debug } from "debug";

const debug = Debug("up:libs:getparameters");

type Swagger = {
	parameters: { [key: string]: any };
	paths: { [url: string]: { [method: string]: { parameters: any[] } } };
	[key: string]: any;
};

type Parameter = {
	$ref?: string;
	schema?: { $ref?: string };
	name?: string;
	[key: string]: any;
};

type Parameters = { [key: string]: any };

export const getParameters = (
	swagger: Swagger,
	url: string,
	method: string,
): Parameters => {
	debug("called");
	const globalParameters = swagger.parameters;
	const localParameters = swagger.paths[url][method].parameters;
	if (localParameters) {
		let parameters = localParameters.map((p: Parameter) => {
			if (p.$ref) {
				const k = p.$ref.replace("#/parameters/", "");
				const definition = globalParameters[k];
				if (!definition) {
					throw new Error(`Parameter not found: ${p.$ref}`);
				}
				return definition;
			}
			return p;
		});
		parameters = parameters.reduce((acc: Parameters, current: Parameter) => {
			if (current.schema && current.schema.$ref) {
				const parts = current.schema.$ref.replace("#/", "").split("/");
				current.schema = swagger[parts[0]][parts[1]];
			}
			if (current.name) {
				acc[current.name] = current;
			}
			return acc;
		}, {});
		return parameters;
	}
	return {};
};
