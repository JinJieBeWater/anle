import type { MiddlewareHandler } from "hono";

import { createContext } from "@anle/api/context";

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const context = await createContext({ context: c });

  if (!context.session?.user) {
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }

  await next();
};
