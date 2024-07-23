export type TypeUniversalPatternOptions = {
	database?: {
		uri: string;
		name: string;
	};
	port?: number;
	enabledStats?: boolean;
	routes?: {
		[method: string]: {
			[url: string]: (req: Request, res: Response) => void;
		};
	};
	swagger?: any;
	preMWS?: any[];
	postMWS?: any[];
	express?: {
		limit?: string;
		static?: string;
	};
	compress?: boolean;
	cors?: boolean;
	production?: boolean;
	bodyParser?: {
		limit?: string;
	};
	urlencoded?: {
		limit?: string;
	};
};
