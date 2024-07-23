import { type Request, type Response, type NextFunction } from "express";

const requestCache: { [key: string]: { [url: string]: any } } = {};

type CacheMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<void>;

export const cache = (isStatsEnabled = false): CacheMiddleware => {
	return async function _cache(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const returnJSON = res.json.bind(res);
		if (isStatsEnabled && req.path === "/stats") {
			return next();
		}
		const key = `${req.method}:${req.path}`;
		res.json = (...args: any[]) => {
			returnJSON(...args);

			if (req.method === "GET") {
				if (!requestCache[key]) {
					requestCache[key] = {};
				}
				requestCache[key][req.url] = args[0];
			} else {
				if (args[0]?.__clearCache) {
					delete requestCache[key];
				}
			}
		};

		if (req.method === "GET" && requestCache?.[key]?.[req.url]) {
			return res.json(requestCache[key][req.url]);
		}

		return next();
	};
};
