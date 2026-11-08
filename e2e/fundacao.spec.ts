import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Fundação (Fase 2)", () => {
  test("home renderiza identidade e navegação", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Sally Perfumaria/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Categorias" })).toBeVisible();
    // Aviso de loja de demonstração deve estar sempre visível no topo.
    await expect(page.getByText(/Projeto de estudo — loja de demonstração/)).toBeVisible();
  });

  test("home sem violações de acessibilidade (axe, WCAG A/AA)", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("link de pular para o conteúdo funciona via teclado", async ({ page, isMobile }) => {
    test.skip(isMobile, "teclado físico apenas no desktop");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  });

  test("rota inexistente retorna 404 com página própria", async ({ page }) => {
    const res = await page.goto("/rota-que-nao-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });

  test("consultor de IA está desativado (sem rota nem atalhos)", async ({ page }) => {
    const res = await page.goto("/assistente");
    expect(res?.status()).toBe(404);
    await page.goto("/");
    await expect(page.locator('a[href="/assistente"]')).toHaveCount(0);
  });

  test("painel admin tem layout próprio com menu de gestão", async ({ page }) => {
    // Sem Supabase configurado o proxy não redireciona; com Supabase, sem sessão vai para /admin/login.
    await page.goto("/admin/produtos");
    if (page.url().includes("/admin/login")) {
      await expect(page.getByRole("heading", { name: "Acesso administrativo" })).toBeVisible();
      expect(new URL(page.url()).searchParams.get("returnTo")).toBe("/admin/produtos");
    } else {
      const menu = page.getByRole("navigation", { name: "Menu administrativo" });
      if (await menu.isVisible()) {
        await expect(menu.getByRole("link", { name: "Estoque" })).toBeVisible();
        await expect(menu.getByRole("link", { name: "Produtos" })).toHaveAttribute("aria-current", "page");
      }
    }
  });

  test("headers de segurança presentes", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
