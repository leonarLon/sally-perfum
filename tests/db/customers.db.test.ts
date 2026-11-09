// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, seedSql } from "./harness";

const addr = (label = "Casa") => ({ label, recipient: "Maria Teste", cep: "01310100", street: "Av. Paulista", number: "1000", district: "Bela Vista", city: "São Paulo", state: "SP" });

describe("Banco: área do cliente e LGPD (Fase 7)", () => {
  let db: PGlite;
  let ana: string;
  let bia: string;
  let adminId: string;
  let productId: string;
  let draftId: string;
  const asAna = () => ({ role: "authenticated" as const, userId: ana });
  const asBia = () => ({ role: "authenticated" as const, userId: bia });
  const insertAddress = (actor: Parameters<typeof as>[1], a = addr()) =>
    as<{ id: string }>(db, actor, "insert into customer_addresses (label, recipient, cep, street, number, district, city, state) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id", [
      a.label, a.recipient, a.cep, a.street, a.number, a.district, a.city, a.state,
    ]).then((r) => r[0].id);

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(seedSql());
    ana = await createUser(db, "ana@sally.test");
    bia = await createUser(db, "bia@sally.test");
    adminId = await createUser(db, "admin@sally.test", "admin");
    const { rows } = await db.query<{ id: string }>("select id from products where status = 'published' order by slug limit 2");
    productId = rows[0].id;
    draftId = rows[1].id;
    await db.query("update products set status = 'draft' where id = $1", [draftId]);
  }, 60_000);

  describe("perfil", () => {
    it("o dono cria e edita o próprio perfil; outra pessoa não vê nem altera", async () => {
      await as(db, asAna(), "insert into profiles (user_id, full_name, phone) values ($1, 'Ana Souza', '11987654321')", [ana]);
      await as(db, asAna(), "update profiles set full_name = 'Ana S.' where user_id = $1", [ana]);
      expect(await as(db, asAna(), "select full_name from profiles")).toEqual([{ full_name: "Ana S." }]);
      expect(await as(db, asBia(), "select * from profiles")).toEqual([]);
      await as(db, asBia(), "update profiles set full_name = 'hack'");
      expect((await db.query<{ full_name: string }>("select full_name from profiles where user_id = $1", [ana])).rows[0].full_name).toBe("Ana S.");
      await expect(as(db, asBia(), "insert into profiles (user_id, full_name) values ($1, 'hack')", [ana])).rejects.toThrow(/row-level security/);
    });

    it("ninguém troca o dono de uma linha nem o visitante acessa", async () => {
      await expect(as(db, asAna(), "update profiles set user_id = $1", [bia])).rejects.toThrow(/permission denied/);
      await expect(as(db, { role: "anon" }, "select * from profiles")).rejects.toThrow(/permission denied/);
    });
  });

  describe("endereços", () => {
    it("cada pessoa vê só os próprios endereços e define um padrão por vez", async () => {
      const a1 = await insertAddress(asAna(), addr("Casa"));
      const a2 = await insertAddress(asAna(), addr("Trabalho"));
      await insertAddress(asBia());
      expect((await as(db, asAna(), "select id from customer_addresses")).length).toBe(2);
      await as(db, asAna(), "select public.set_default_address($1)", [a1]);
      await as(db, asAna(), "select public.set_default_address($1)", [a2]);
      const defaults = await as<{ id: string }>(db, asAna(), "select id from customer_addresses where is_default");
      expect(defaults.map((d) => d.id)).toEqual([a2]);
      await expect(as(db, asBia(), "select public.set_default_address($1)", [a1])).rejects.toThrow(/não encontrado/);
    });

    it("não altera nem apaga endereço alheio", async () => {
      const [{ id }] = await as<{ id: string }>(db, asAna(), "select id from customer_addresses limit 1");
      await as(db, asBia(), "delete from customer_addresses where id = $1", [id]);
      await as(db, asBia(), "update customer_addresses set street = 'hack' where id = $1", [id]);
      const { rows } = await db.query<{ street: string }>("select street from customer_addresses where id = $1", [id]);
      expect(rows[0].street).toBe("Av. Paulista");
    });

    it("limita a 10 endereços por pessoa e valida CEP e UF", async () => {
      for (let i = 0; i < 8; i++) await insertAddress(asAna(), addr(`End ${i}`));
      await expect(insertAddress(asAna(), addr("Excedente"))).rejects.toThrow(/limite de 10/);
      await expect(insertAddress(asBia(), { ...addr(), cep: "123" })).rejects.toThrow(/check/);
      await expect(insertAddress(asBia(), { ...addr(), state: "XX" })).rejects.toThrow(/check/);
    });

    it("admin não lê endereços salvos de clientes (minimização)", async () => {
      expect(await as(db, { role: "authenticated", userId: adminId }, "select id from customer_addresses")).toEqual([]);
    });
  });

  describe("favoritos", () => {
    it("favorita produto publicado, não duplica e remove", async () => {
      await as(db, asAna(), "insert into favorites (product_id) values ($1)", [productId]);
      await expect(as(db, asAna(), "insert into favorites (product_id) values ($1)", [productId])).rejects.toThrow(/duplicate key/);
      expect((await as(db, asAna(), "select product_id from favorites")).length).toBe(1);
      expect(await as(db, asBia(), "select product_id from favorites")).toEqual([]);
      await as(db, asAna(), "delete from favorites where product_id = $1", [productId]);
      expect(await as(db, asAna(), "select product_id from favorites")).toEqual([]);
    });

    it("não favorita rascunho nem em nome de outra pessoa", async () => {
      await expect(as(db, asAna(), "insert into favorites (product_id) values ($1)", [draftId])).rejects.toThrow(/row-level security/);
      await expect(as(db, asAna(), "insert into favorites (user_id, product_id) values ($1, $2)", [bia, productId])).rejects.toThrow(/row-level security/);
      await expect(as(db, { role: "anon" }, "insert into favorites (product_id) values ($1)", [productId])).rejects.toThrow(/permission denied/);
    });
  });

  describe("exclusão de conta", () => {
    it("apaga perfil, endereços e favoritos; pedidos e movimentações ficam sem vínculo", async () => {
      const carla = await createUser(db, "carla@sally.test");
      const c = { role: "authenticated" as const, userId: carla };
      await as(db, c, "insert into profiles (user_id, full_name) values ($1, 'Carla')", [carla]);
      await insertAddress(c);
      await as(db, c, "insert into favorites (product_id) values ($1)", [productId]);
      const { rows: v } = await db.query<{ id: string }>("select v.id from product_variants v join inventory i on i.variant_id = v.id join products p on p.id = v.product_id where p.status = 'published' and i.on_hand - i.reserved > 0 limit 1");
      const [{ r }] = await as<{ r: { order_id: string } }>(db, { role: "service_role" }, "select public.create_order($1, $2, $3, $4, $5, 'pix', true) r", [
        randomUUID(), carla, JSON.stringify([{ variant_id: v[0].id, quantity: 1 }]), JSON.stringify({ name: "Carla", email: "carla@sally.test" }),
        JSON.stringify({ cep: "01310100", street: "Rua A", number: "1", district: "Centro", city: "São Paulo", state: "SP" }),
      ]);

      await db.query("delete from auth.users where id = $1", [carla]);

      for (const t of ["profiles", "customer_addresses", "favorites"]) {
        expect((await db.query<{ n: number }>(`select count(*)::int n from ${t} where user_id = $1`, [carla])).rows[0].n).toBe(0);
      }
      const o = await db.query<{ user_id: string | null }>("select user_id from orders where id = $1", [r.order_id]);
      expect(o.rows[0].user_id).toBeNull();
      const m = await db.query<{ n: number }>("select count(*)::int n from inventory_movements where actor_id = $1", [carla]);
      expect(m.rows[0].n).toBe(0);
    });
  });
});
