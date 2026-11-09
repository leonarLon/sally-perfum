import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CatalogItem, ProductDetail, ProductVariant } from "@/lib/catalog/types";
import { OlfactoryInfo } from "./olfactory-info";
import { installmentText } from "./price";
import { ProductCard, volumesLabel } from "./product-card";
import { ProductImage } from "./product-image";
import { PurchasePanel } from "./purchase-panel";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const item: CatalogItem = {
  id: "1", slug: "sauvage-dior", name: "Sauvage", short_description: null, gender: "masculino", origin: "importado",
  concentration: "Eau de Toilette", olfactory_family: "Aromático", family_group: "Aromático", featured: true,
  brand_name: "Dior", brand_slug: "dior", category_slug: "perfumes-masculinos", category_name: "Perfumes Masculinos",
  min_price_cents: 63500, max_price_cents: 126900, variant_count: 4, volumes_ml: [30, 60, 100, 200],
  has_promo: true, max_discount_percent: 20, in_stock: true, image_path: null,
  image_url: "https://epocacosmeticos.vteximg.com.br/arquivos/ids/1-800-800/a.jpg", image_alt: "Sauvage — Dior",
};

const variant = (o: Partial<ProductVariant>): ProductVariant => ({
  id: "v1", sku: "SLY-X-030", volume_ml: 30, price_cents: 10000, compare_at_cents: null, price_is_reference: true, stock_status: "in_stock", ...o,
});

describe("ProductCard", () => {
  it("mostra foto, marca, nome, volume, preço 'a partir de', desconto e link", () => {
    render(<ProductCard item={item} />);
    expect(screen.getByRole("img", { name: "Sauvage — Dior" })).toHaveAttribute("src", item.image_url);
    expect(screen.getByText("Dior")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sauvage" })).toHaveAttribute("href", "/produtos/sauvage-dior");
    expect(screen.getByText(/4 tamanhos \(30–200 ml\)/)).toBeInTheDocument();
    expect(screen.getByText("a partir de")).toBeInTheDocument();
    expect(screen.getByText(/635,00/)).toBeInTheDocument();
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it("indica produto esgotado", () => {
    render(<ProductCard item={{ ...item, in_stock: false }} />);
    expect(screen.getByText("Esgotado")).toBeInTheDocument();
  });
});

describe("ProductImage", () => {
  it("sem URL mostra placeholder identificado, nunca outra foto", () => {
    render(<ProductImage src={null} alt="Khamrah" sizes="100px" />);
    expect(screen.getByRole("img", { name: "Foto indisponível: Khamrah" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Khamrah" })).toBeNull();
  });
});

describe("helpers de exibição", () => {
  it("rótulo de volumes e parcelamento", () => {
    expect(volumesLabel([100])).toBe("100 ml");
    expect(volumesLabel([null])).toBeNull();
    expect(installmentText(4000)).toBeNull(); // abaixo de 2x R$ 50
    expect(installmentText(63500)?.replace(/\s/g, " ")).toBe("ou 10x de R$ 63,50 sem juros");
  });
});

describe("OlfactoryInfo", () => {
  const base = {
    id: "p", slug: "x", name: "X", short_description: null, description: null, gender: "unissex" as const, origin: "importado" as const,
    concentration: "Eau de Parfum", olfactory_family: null, family_group: null, occasion: null,
    brand: { name: "B", slug: "b" }, category: { name: "C", slug: "c" }, variants: [], images: [],
  } satisfies Partial<ProductDetail>;

  it("sem pirâmide confirmada informa isso e mostra só destaques citados", () => {
    render(<OlfactoryInfo product={{ ...base, top_notes: null, heart_notes: null, base_notes: null, highlights: ["Sálvia", "Sal Marinho"] } as ProductDetail} />);
    expect(screen.getByText(/não foi confirmada por fonte confiável/)).toBeInTheDocument();
    expect(screen.getByText("Sálvia, Sal Marinho")).toBeInTheDocument();
    expect(screen.queryByText("Notas de saída")).toBeNull();
    expect(screen.getByText("Família olfativa").nextSibling).toHaveTextContent("Não informado");
  });

  it("com pirâmide parcial marca o nível ausente como não confirmado", () => {
    render(<OlfactoryInfo product={{ ...base, top_notes: ["Bergamota"], heart_notes: null, base_notes: ["Cedro"], highlights: null } as ProductDetail} />);
    expect(screen.getByText("Bergamota")).toBeInTheDocument();
    expect(screen.getByText("Não confirmado")).toBeInTheDocument();
  });
});

describe("PurchasePanel", () => {
  it("seleciona a primeira variante disponível e troca preço ao escolher outro volume", async () => {
    const variants = [
      variant({ id: "a", sku: "SLY-A-030", volume_ml: 30, price_cents: 10000, stock_status: "out_of_stock" }),
      variant({ id: "b", sku: "SLY-A-100", volume_ml: 100, price_cents: 25000, compare_at_cents: 30000 }),
    ];
    render(<PurchasePanel variants={variants} />);
    const group = screen.getByRole("radiogroup");
    expect(within(group).getByRole("radio", { name: /100 ml/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("SKU SLY-A-100")).toBeInTheDocument();
    expect(screen.getByText(/Preço de referência/)).toBeInTheDocument();

    await userEvent.click(within(group).getByRole("radio", { name: /30 ml/ }));
    expect(screen.getByText("Esgotado", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Esgotado/ })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Quantidade" })).toBeDisabled();
  });
});
