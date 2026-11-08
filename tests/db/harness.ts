import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");

export const migrationFiles = () =>
  fs
    .readdirSync(path.join(root, "supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => path.join(root, "supabase/migrations", f));

export const seedSql = () => fs.readFileSync(path.join(root, "supabase/seed/catalog.seed.sql"), "utf8");

/** Banco Postgres real (WASM) com o shim do Supabase e todas as migrations aplicadas. */
export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(fs.readFileSync(path.join(__dirname, "supabase-shim.sql"), "utf8"));
  for (const file of migrationFiles()) await db.exec(fs.readFileSync(file, "utf8"));
  return db;
}

export type Actor = { role: "anon" } | { role: "authenticated"; userId: string } | { role: "postgres" };

/**
 * Executa SQL como um papel do Supabase (anon / authenticated com JWT sub / postgres),
 * reproduzindo o que o PostgREST faz em cada requisição.
 */
export async function as<T = Record<string, unknown>>(db: PGlite, actor: Actor, sql: string, params: unknown[] = []) {
  await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);");
  if (actor.role === "authenticated") {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [actor.userId]);
  }
  if (actor.role !== "postgres") await db.exec(`set role ${actor.role};`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec("reset role;");
  }
}

export async function createUser(db: PGlite, email: string, role?: "admin" | "owner") {
  const { rows } = await db.query<{ id: string }>("insert into auth.users (email) values ($1) returning id", [email]);
  const id = rows[0].id;
  if (role) await db.query("insert into public.user_roles (user_id, role) values ($1, $2)", [id, role]);
  return id;
}
