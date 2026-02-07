import { db } from "@anle/db";
import { sql } from "drizzle-orm";

type Db = typeof db;
type DbTx = Parameters<Db["transaction"]>[0] extends (tx: infer T) => Promise<any> ? T : never;

export const withRls = async <T>(userId: string, run: (tx: DbTx) => Promise<T>) =>
  db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return run(tx);
  });
