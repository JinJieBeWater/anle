import { db } from "@anle/db";
import * as schema from "@anle/db/schema/auth";
import { env } from "@anle/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    jwt({
      jwt: {
        audience: "powersync",
      },
    }),
  ],
});
