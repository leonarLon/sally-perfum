import { describe, expect, it } from "vitest";
import { safeAdminReturnTo } from "@/lib/auth/session";
import { dbErrorMessage, detectImageType, productSchema, slugify, stockSchema, variantSchema } from "./schemas";

const UUID = "4b1f6a1e-2c3d-4e5f-8a9b-0c1d2e3f4a5b";
const baseProduct = { name: "Água de Rosas Nº 5", brand_id: UUID, category_id: UUID, gender: "feminino", origin: "nacional" };

describe("admin: validação de produto", () => {
  it("gera slug sem acento a partir do nome e trata notas como lista", () => {
    const p = productSchema.parse({ ...baseProduct, top_notes: "bergamota, pimenta rosa ,  ", heart_notes: "" });
    expect(p.slug).toBe("agua-de-rosas-n-5");
    expect(p.top_notes).toEqual(["bergamota", "pimenta rosa"]);
    expect(p.heart_notes).toBeNull(); // vazio = pirâmide não confirmada, nunca inventada
    expect(p.status).toBe("draft");
    expect(p.featured).toBe(false);
    expect(p.concentration).toBeNull();
  });

  it("rejeita slug inválido, marca ausente e gênero desconhecido", () => {
    expect(productSchema.safeParse({ ...baseProduct, slug: "Slug Com Espaço" }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseProduct, brand_id: "x" }).success).toBe(false);
    expect(productSchema.safeParse({ ...baseProduct, gender: "outro" }).success).toBe(false);
  });

  it("checkbox marcado vira true", () => {
    expect(productSchema.parse({ ...baseProduct, featured: "on" }).featured).toBe(true);
  });

  it("slugify remove acentos e pontuação", () => {
    expect(slugify("  L'Interdit — Eau de Parfum  ")).toBe("l-interdit-eau-de-parfum");
  });
});

describe("admin: validação de variante e preço", () => {
  it("converte preços para centavos inteiros e marca confirmação", () => {
    const v = variantSchema.parse({ sku: "sly-teste-100", volume_ml: "100", price: "1.299,90", compare_at: "1.499,00", price_confirmed: "on", is_active: "on" });
    expect(v).toMatchObject({ sku: "SLY-TESTE-100", volume_ml: 100, price_cents: 129990, compare_at_cents: 149900, price_is_reference: false, is_active: true });
  });

  it("sem confirmação o preço continua de referência", () => {
    expect(variantSchema.parse({ sku: "SLY-A-1", price: "50" }).price_is_reference).toBe(true);
  });

  it("recusa preço zero, formato errado e preço 'de' menor ou igual ao de venda", () => {
    expect(variantSchema.safeParse({ sku: "SLY-A-1", price: "0" }).success).toBe(false);
    expect(variantSchema.safeParse({ sku: "SLY-A-1", price: "12.5" }).success).toBe(false);
    const r = variantSchema.safeParse({ sku: "SLY-A-1", price: "100,00", compare_at: "100,00" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["compare_at"]);
  });

  it("valida SKU, volume e código de barras", () => {
    expect(variantSchema.safeParse({ sku: "a", price: "10" }).success).toBe(false);
    expect(variantSchema.safeParse({ sku: "SLY-A-1", price: "10", volume_ml: "0" }).success).toBe(false);
    expect(variantSchema.safeParse({ sku: "SLY-A-1", price: "10", barcode: "123" }).success).toBe(false);
  });
});

describe("admin: validação de estoque", () => {
  it("aceita contagem e exige motivo", () => {
    expect(stockSchema.parse({ variant_id: UUID, mode: "set", quantity: "12", min_stock: "3", reason: "Contagem" }).quantity).toBe(12);
    expect(stockSchema.safeParse({ variant_id: UUID, mode: "set", quantity: "12", min_stock: "3", reason: "" }).success).toBe(false);
  });

  it("recusa entrada zero, negativos e frações", () => {
    expect(stockSchema.safeParse({ variant_id: UUID, mode: "in", quantity: "0", min_stock: "3", reason: "NF 1" }).success).toBe(false);
    expect(stockSchema.safeParse({ variant_id: UUID, mode: "set", quantity: "-1", min_stock: "3", reason: "Contagem" }).success).toBe(false);
    expect(stockSchema.safeParse({ variant_id: UUID, mode: "set", quantity: "1.5", min_stock: "3", reason: "Contagem" }).success).toBe(false);
  });
});

describe("admin: segurança", () => {
  it("detecta imagem pela assinatura, não pela extensão", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe("image/jpeg");
    expect(detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mime).toBe("image/png");
    expect(detectImageType(new TextEncoder().encode("RIFF____WEBPVP8 "))?.mime).toBe("image/webp");
    expect(detectImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("GIF89a"))).toBeNull();
  });

  it("returnTo só aceita caminhos internos do painel (sem open redirect)", () => {
    expect(safeAdminReturnTo("/admin/produtos?q=dior")).toBe("/admin/produtos?q=dior");
    for (const bad of ["https://evil.example", "//evil.example", "/admin//evil", "/\\evil", "/produtos", "/admin/login", null, 42]) {
      expect(safeAdminReturnTo(bad)).toBe("/admin");
    }
  });

  it("erros do banco viram mensagens sem detalhes internos", () => {
    expect(dbErrorMessage({ code: "23505", message: 'duplicate key value violates unique constraint "product_variants_sku_key"' })).toMatch(/SKU/);
    expect(dbErrorMessage({ code: "42501", message: "permission denied for table products" })).toBe("Você não tem permissão para esta ação.");
    expect(dbErrorMessage({ code: "XX000", message: "internal: relation secret" })).not.toMatch(/secret/);
  });
});
