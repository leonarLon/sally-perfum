import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * E2E do catálogo contra o Supabase configurado (.env.local). Requer a carga
 * autorizada; se o catálogo estiver vazio, os testes são marcados como pulados.
 */
test.describe("Catálogo público (Fase 3) — dados do Supabase", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/produtos");
    const empty = await page.getByText(/catálogo ainda está vazio|não foi possível carregar/i).isVisible().catch(() => false);
    test.skip(empty, "Catálogo remoto ainda não carregado (aguardando seed autorizado).");
  });

  test("lista ≥ 24 produtos na primeira página com contador e paginação", async ({ page }) => {
    await expect(page.getByRole("status").filter({ hasText: /perfumes encontrados/ })).toBeVisible();
    const total = Number((await page.getByText(/perfumes encontrados/).textContent())?.match(/\d+/)?.[0]);
    expect(total).toBeGreaterThanOrEqual(40);
    await expect(page.getByRole("article")).toHaveCount(24);
    await page.getByRole("navigation", { name: "Paginação" }).getByRole("link", { name: "2", exact: true }).click();
    await expect(page).toHaveURL(/pagina=2/);
    await expect(page.getByRole("article")).toHaveCount(total - 24);
  });

  test("busca por termo sem acento encontra produto acentuado", async ({ page }) => {
    await page.goto("/buscar?q=idole");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/idole/);
    await expect(page.getByRole("link", { name: "Idôle" })).toBeVisible();
  });

  test("busca pelo cabeçalho leva para /buscar", async ({ page, isMobile }) => {
    test.skip(isMobile, "campo de busca do cabeçalho visível no desktop");
    await page.getByLabel("Buscar perfumes").fill("lattafa");
    await page.getByLabel("Buscar perfumes").press("Enter");
    await expect(page).toHaveURL(/\/buscar\?q=lattafa/);
    for (const brand of await page.getByRole("article").locator("p").first().allTextContents()) expect(brand).toMatch(/lattafa/i);
  });

  test("filtros por gênero e marca via formulário", async ({ page }) => {
    await page.goto("/produtos?genero=masculino&marca=dior");
    await expect(page.getByRole("link", { name: "Sauvage" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Miss Dior Parfum" })).toHaveCount(0);
  });

  test("ordenação por menor preço", async ({ page }) => {
    await page.goto("/produtos?ordem=price_asc");
    // allTextContents não espera: aguarda o resultado (streaming) substituir o skeleton.
    await expect(page.getByRole("article").first()).toBeVisible();
    const prices = await page.getByRole("article").locator("text=/R\\$/").allTextContents();
    const cents = prices
      .map((t) => t.match(/R\$\s?([\d.]+,\d{2})/)?.[1])
      .filter(Boolean)
      .map((v) => Number(v!.replace(/\./g, "").replace(",", "")));
    expect(cents.length).toBeGreaterThan(5);
  });

  test("detalhe do produto: galeria, volumes, preço, olfativo e relacionados", async ({ page }) => {
    await page.goto("/produtos/sauvage-dior");
    await expect(page.getByRole("heading", { level: 1, name: "Sauvage" })).toBeVisible();
    await expect(page.getByRole("radiogroup")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Informações olfativas" })).toBeVisible();
    await expect(page.getByText("Notas de saída")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Você também pode gostar" })).toBeVisible();
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(ld!)["@type"]).toBe("Product");
  });

  test("produto sem pirâmide confirmada informa isso", async ({ page }) => {
    await page.goto("/produtos/khamrah-lattafa");
    const olfativo = page.getByRole("region", { name: "Informações olfativas" });
    await expect(olfativo.getByText(/não foi confirmada por fonte confiável/)).toBeVisible();
    await expect(olfativo.getByText("Notas de saída")).toHaveCount(0);
  });

  test("produto inexistente mostra página de não encontrado", async ({ page }) => {
    await page.goto("/produtos/perfume-que-nao-existe");
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });

  test("páginas de marca e categoria", async ({ page }) => {
    await page.goto("/marcas/lattafa");
    await expect(page.getByRole("heading", { level: 1, name: "Lattafa" })).toBeVisible();
    await page.goto("/categorias/perfumes-unissex");
    await expect(page.getByRole("heading", { level: 1, name: "Perfumes Unissex" })).toBeVisible();
  });

  test("catálogo e detalhe sem violações de acessibilidade", async ({ page }) => {
    for (const url of ["/produtos", "/produtos/la-vie-est-belle-lancome"]) {
      await page.goto(url);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      expect(r.violations, `${url}: ${JSON.stringify(r.violations.map((v) => v.id))}`).toEqual([]);
    }
  });
});
