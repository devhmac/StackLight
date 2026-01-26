import type { MiddlewareHandler } from "hono";
import { AppContext } from "../types";

export const logger = (): MiddlewareHandler => {
  return async (c: AppContext, next) => {
    const start = Date.now();
    const requestId = c.get("requestId");

    console.log(`→ [${requestId}] ${c.req.method} ${c.req.path}`);

    await next();

    const duration = Date.now() - start;
    console.log(
      `← [${requestId}] ${c.req.method} ${c.req.path} ${c.res.status} ${duration}ms`,
    );
  };
};
