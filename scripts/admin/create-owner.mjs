#!/usr/bin/env node
/**
 * Cria (ou promove) a conta do proprietário no Supabase Auth e concede o papel "owner".
 * Operação REMOTA: rode só com autorização. Idempotente.
 *
 *   node --env-file=.env.local scripts/admin/create-owner.mjs
 *
 * Lê ADMIN_EMAIL e ADMIN_PASSWORD do ambiente (.env.local, fora do git). A senha nunca
 * é impressa. Depois de criar, você pode apagar ADMIN_PASSWORD do .env.local.
 */
import { createClient } from "@supabase/supabase-js";

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey, ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!url || !serviceKey) fail("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Defina ADMIN_EMAIL com um e-mail válido no .env.local.");

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUserByEmail(target) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail(`Não foi possível listar usuários: ${error.message}`);
    const found = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUserByEmail(email);
if (user) {
  console.log(`• Conta já existe (${user.id.slice(0, 8)}…); a senha não foi alterada.`);
} else {
  if (!password || password.length < 12) fail("Defina ADMIN_PASSWORD com pelo menos 12 caracteres no .env.local.");
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) fail(`Não foi possível criar a conta: ${error.message}`);
  user = data.user;
  console.log(`✓ Conta criada (${user.id.slice(0, 8)}…), e-mail já confirmado.`);
}

const { error: roleError } = await supabase.from("user_roles").upsert({ user_id: user.id, role: "owner" }, { onConflict: "user_id,role", ignoreDuplicates: true });
if (roleError) fail(`Não foi possível conceder o papel: ${roleError.message}`);

const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
console.log(`✓ Papéis atuais: ${(roles ?? []).map((r) => r.role).join(", ")}`);
console.log("Pronto. Entre em /admin/login com esse e-mail.");
