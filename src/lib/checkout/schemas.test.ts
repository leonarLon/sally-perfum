import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema, orderErrorMessage } from "./schemas";

const valid = {
  idempotency_key: "4b1f6a1e-2c3d-4e5f-8a9b-0c1d2e3f4a5b",
  name: "Maria Teste",
  email: "maria@example.com",
  phone: "(11) 98765-4321",
  cep: "01310-100",
  street: "Av. Paulista",
  number: "1000",
  complement: "",
  district: "Bela Vista",
  city: "São Paulo",
  state: "SP",
  payment_method: "pix",
  privacy: "on",
  items: JSON.stringify([{ variantId: "00000000-0000-4000-8000-000000000001", quantity: 2 }]),
};

describe("checkout: validação", () => {
  it("normaliza CEP e telefone e aceita o pedido válido", () => {
    const d = checkoutSchema.parse(valid);
    expect(d.cep).toBe("01310100");
    expect(d.phone).toBe("11987654321");
    expect(d.items).toHaveLength(1);
  });

  it("exige consentimento LGPD, CEP de 8 dígitos e estado válido", () => {
    expect(checkoutSchema.safeParse({ ...valid, privacy: undefined }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, cep: "1234" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, state: "XX" }).success).toBe(false);
  });

  it("recusa sacola adulterada (preço no item, quantidade fora do limite, JSON inválido)", () => {
    expect(checkoutSchema.safeParse({ ...valid, items: "[]" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, items: JSON.stringify([{ variantId: "x", quantity: 1 }]) }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, items: JSON.stringify([{ variantId: "00000000-0000-4000-8000-000000000001", quantity: 50 }]) }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, items: "{" }).success).toBe(false);
    // campos extras (ex.: preço) são ignorados: o servidor só usa variante e quantidade
    const d = checkoutSchema.parse({ ...valid, items: JSON.stringify([{ variantId: "00000000-0000-4000-8000-000000000001", quantity: 1, price_cents: 1 }]) });
    expect(d.items[0]).toEqual({ variantId: "00000000-0000-4000-8000-000000000001", quantity: 1 });
  });

  it("traduz erros do banco sem expor detalhes", () => {
    expect(orderErrorMessage("ESTOQUE_INSUFICIENTE:SLY-X-100:2")).toMatchObject({ outOfStock: "SLY-X-100", message: expect.stringMatching(/Só restam 2/) });
    expect(orderErrorMessage("ESTOQUE_INSUFICIENTE:SLY-X-100:0").message).toMatch(/esgotar/);
    expect(orderErrorMessage("relation orders violates something internal").message).toMatch(/Não foi possível/);
  });

  it("limita tentativas por chave dentro da janela", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit("teste:a", 3, 60_000, t).ok).toBe(true);
    expect(rateLimit("teste:a", 3, 60_000, t).ok).toBe(false);
    expect(rateLimit("teste:a", 3, 60_000, t + 60_001).ok).toBe(true);
  });
});
