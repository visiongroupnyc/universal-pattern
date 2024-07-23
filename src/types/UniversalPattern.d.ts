export type TypeUniversalPattern = {
	localOptions: any;
	db: any;
	getModule: (url: string) => string;
	instanceId: string;
	services?: any;
	controllers?: any;
	hooks?: any;
	internalHooks?: any;
	addHook: (endpoint: string, method: string, cb: Function) => void;
	registerController: (name: string, controller: () => void) => void;
	swagger?: any;
};
