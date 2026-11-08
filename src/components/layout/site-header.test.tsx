import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("expõe busca acessível e atalhos com rótulos", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar perfumes")).toHaveAttribute("name", "q");
    const atalhos = screen.getByRole("navigation", { name: "Atalhos da conta" });
    for (const nome of ["Favoritos", "Minha conta", "Sacola"]) {
      expect(within(atalhos).getByRole("link", { name: nome })).toBeInTheDocument();
    }
  });

  it("navegação de categorias usa filtros de URL (sem catálogo hardcoded)", () => {
    render(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: "Categorias" });
    expect(within(nav).getByRole("link", { name: "Feminino" })).toHaveAttribute(
      "href",
      "/produtos?genero=feminino",
    );
  });
});
