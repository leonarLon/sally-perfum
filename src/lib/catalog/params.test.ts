import { describe, expect, it } from "vitest";
import { buildQuery, hasActiveFilters, parseCatalogParams, toSearchArgs } from "./params";
import { resolveImageUrl } from "./images";

describe("parseCatalogParams", () => {
  it("aceita filtros válidos", () => {
    expect(
      parseCatalogParams({ q: " sauvage ", genero: "masculino", marca: "dior", min: "100", max: "500", ordem: "price_asc", pagina: "2" }),
    ).toEqual({ q: "sauvage", genero: "masculino", marca: "dior", min: 100, max: 500, ordem: "price_asc", pagina: 2 });
  });

  it("descarta valores inválidos ou maliciosos sem quebrar", () => {
    const f = parseCatalogParams({
      genero: "alien", marca: "../etc/passwd", ordem: "drop table", pagina: "-1", min: "abc", promocao: "true",
      familia: "Floral'; --",
    });
    expect(f).toEqual({});
  });

  it("usa o primeiro valor quando o parâmetro se repete e inverte min > max", () => {
    expect(parseCatalogParams({ genero: ["feminino", "masculino"], min: "500", max: "100" })).toEqual({ genero: "feminino", min: 100, max: 500 });
  });

  it("limita o tamanho da busca", () => {
    expect(parseCatalogParams({ q: "a".repeat(200) }).q).toBeUndefined();
  });
});

describe("toSearchArgs", () => {
  it("converte reais para centavos e flags para booleanos", () => {
    const args = toSearchArgs({ min: 150, max: 300, promocao: "1", disponivel: "1" });
    expect(args).toMatchObject({ p_min_price: 15000, p_max_price: 30000, p_promo: true, p_in_stock: true, p_page: 1, p_sort: "relevance" });
  });
});

describe("buildQuery", () => {
  it("preserva filtros, remove nulos e volta para a página 1 ao mudar filtro", () => {
    expect(buildQuery({ genero: "feminino", pagina: 3 }, { ordem: "price_asc" })).toBe("?genero=feminino&ordem=price_asc");
    expect(buildQuery({ genero: "feminino" }, { pagina: 2 })).toBe("?genero=feminino&pagina=2");
    expect(buildQuery({ genero: "feminino", marca: "dior" }, { marca: null })).toBe("?genero=feminino");
    expect(buildQuery({})).toBe("");
  });

  it("detecta filtros ativos ignorando ordem e página", () => {
    expect(hasActiveFilters({ ordem: "name", pagina: 2 })).toBe(false);
    expect(hasActiveFilters({ marca: "dior" })).toBe(true);
  });
});

describe("resolveImageUrl", () => {
  const base = "https://abc.supabase.co";
  it("prefere o Storage, depois a URL externa https, senão null", () => {
    expect(resolveImageUrl({ storage_path: "seed/la vie/0.webp" }, base)).toBe(
      "https://abc.supabase.co/storage/v1/object/public/product-images/seed/la%20vie/0.webp",
    );
    expect(resolveImageUrl({ external_url: "https://cdn.example.com/a.jpg" }, base)).toBe("https://cdn.example.com/a.jpg");
    expect(resolveImageUrl({ external_url: "javascript:alert(1)" }, base)).toBeNull();
    expect(resolveImageUrl({ external_url: "http://inseguro.com/a.jpg" }, base)).toBeNull();
    expect(resolveImageUrl(null, base)).toBeNull();
  });
});
