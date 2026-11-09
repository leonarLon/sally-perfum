import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Painel administrativo (Fase 5). Os testes com login usam ADMIN_EMAIL/ADMIN_PASSWORD do
 * .env.local e são SOMENTE LEITURA (não alteram o catálogo remoto). Sem credenciais, são pulados.
 */
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

test.describe("Painel: acesso", () => {
  test("rotas do painel exigem login e preservam o destino", async ({ page }) => {
    await page.goto("/admin/estoque?status=low_stock");
    await expect(page).toHaveURL(/\/admin\/login\?returnTo=/);
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe("/admin/estoque?status=low_stock");
    await expect(page.getByRole("heading", { name: "Acesso administrativo" })).toBeVisible();
  });

  test("credencial inválida mostra mensagem genérica, sem revelar se o e-mail existe", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("E-mail").fill("ninguem@example.com");
    await page.getByLabel("Senha").fill("senha-errada-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /incorretos|tentativas/ })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByLabel("E-mail")).toHaveValue("ninguem@example.com");
  });

  test("login sem violações de acessibilidade", async ({ page }) => {
    await page.goto("/admin/login");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe("Painel: com login de administrador", () => {
  test.skip(!email || !password, "Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env.local para rodar.");
  test.describe.configure({ mode: "serial" });

  test("entra, navega pelo painel e sai", async ({ page, isMobile }) => {
    test.skip(isMobile, "um login por execução (limite de tentativas do Supabase Auth)");
    await page.goto("/admin/login?returnTo=/admin/produtos");
    await page.getByLabel("E-mail").fill(email!);
    await page.getByLabel("Senha").fill(password!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL((u) => u.pathname === "/admin/produtos"); // compara o caminho: a URL do login termina com o returnTo

    await expect(page.getByRole("heading", { level: 1, name: "Produtos" })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: /\d+ produtos/ })).toBeVisible();
    let r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => v.id), "lista de produtos").toEqual([]);

    await page.getByLabel("Buscar produtos").fill("sauvage");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await page.getByRole("link", { name: "Sauvage", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Sauvage" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Volumes, preços e estoque" })).toBeVisible();
    await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("Sauvage");
    r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => v.id), "edição de produto").toEqual([]);

    await page.goto("/admin/estoque?status=low_stock");
    await expect(page.getByRole("heading", { level: 1, name: "Estoque" })).toBeVisible();
    // Logado como dono, a área do cliente mostra o atalho para o painel.
    await page.goto("/minha-conta");
    await page.getByRole("link", { name: "Abrir o painel da loja" }).click();
    await expect(page).toHaveURL((u) => u.pathname === "/admin");

    await page.goto("/admin/cupons");
    await expect(page.getByRole("heading", { level: 1, name: "Cupons" })).toBeVisible();
    await expect(page.getByText("BEMVINDA10", { exact: true })).toBeVisible();
    r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => v.id), "cupons").toEqual([]);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Atividade recente" })).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
