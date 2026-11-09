import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

/**
 * Área do cliente (Fase 7). Os testes de acesso e validação não gravam nada.
 * O fluxo completo cria um cliente de teste no Supabase Auth (service role), usa a conta
 * e a EXCLUI pela própria tela de exclusão: só roda com E2E_ACCOUNT_WRITE=1.
 */
const axe = (page: Page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
const violations = (r: Awaited<ReturnType<typeof axe>>) => r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);

test.describe("Conta: acesso e validação", () => {
  test("área do cliente exige login e volta ao destino", async ({ page }) => {
    await page.goto("/minha-conta/enderecos");
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fminha-conta%2Fenderecos|\/login\?returnTo=\/minha-conta\/enderecos/);
    await expect(page.getByRole("heading", { level: 1, name: "Entrar" })).toBeVisible();
    expect(violations(await axe(page))).toEqual([]);
  });

  test("login inválido mostra mensagem genérica", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail", { exact: true }).fill("ninguem@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha-errada-1");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /incorretos|tentativas/ })).toBeVisible();
  });

  test("cadastro valida senha fraca, confirmação e privacidade sem criar conta", async ({ page }) => {
    await page.goto("/cadastro");
    await page.getByLabel("Nome completo", { exact: true }).fill("Teste");
    await page.getByLabel("E-mail", { exact: true }).fill("teste@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("fraca");
    await page.getByLabel("Confirme a senha", { exact: true }).fill("outra");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeVisible();
    await expect(page.getByText("As senhas não conferem.")).toBeVisible();
    await expect(page.getByText(/aceitar a política de privacidade/)).toBeVisible();
    expect(violations(await axe(page))).toEqual([]);
  });

  test("favoritar sem login leva para entrar com retorno ao produto", async ({ page }) => {
    await page.goto("/produtos/sauvage-dior");
    await page.getByRole("button", { name: /Adicionar Sauvage aos favoritos/ }).click();
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fprodutos%2Fsauvage-dior/);
  });

  test("exportação de dados exige sessão", async ({ request }) => {
    const res = await request.get("/minha-conta/dados", { maxRedirects: 0 });
    expect([302, 307, 401]).toContain(res.status());
  });
});

test.describe("Conta: fluxo completo com exclusão ao final", () => {
  test.skip(process.env.E2E_ACCOUNT_WRITE !== "1", "Defina E2E_ACCOUNT_WRITE=1 para rodar (cria e exclui um cliente de teste).");
  test.describe.configure({ mode: "serial" });

  const email = `e2e-cliente-${Date.now()}@example.com`;
  const password = `Teste${Date.now()}x`;
  const admin = () =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  let userId: string | null = null;

  test.beforeAll(async () => {
    const { data, error } = await admin().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: "Cliente E2E" } });
    if (error) throw error;
    userId = data.user.id;
  });

  test.afterAll(async () => {
    // Garantia de limpeza se o teste falhar antes da exclusão pela tela.
    if (userId) await admin().auth.admin.deleteUser(userId).catch(() => {});
  });

  test("entra, favorita, salva endereço, vê o checkout preenchido, exporta os dados e exclui a conta", async ({ page, isMobile }) => {
    test.skip(isMobile, "uma execução basta");
    test.setTimeout(120_000);
    page.on("dialog", (d) => d.accept());

    await page.goto("/login?returnTo=/produtos/sauvage-dior");
    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL((u) => u.pathname === "/produtos/sauvage-dior"); // não casa com /login?returnTo=…

    // Cookie de sessão inacessível a JavaScript (protege o token contra XSS).
    const session = (await page.context().cookies()).filter((c) => c.name.startsWith("sb-"));
    expect(session.length).toBeGreaterThan(0);
    expect(session.every((c) => c.httpOnly && c.sameSite === "Lax")).toBe(true);
    expect(await page.evaluate(() => document.cookie)).not.toContain("sb-");

    // Sessão persistente: recarregar e navegar mantém a pessoa logada.
    await page.reload();
    await page.goto("/minha-conta");
    await expect(page.getByRole("heading", { level: 1, name: /Olá, Cliente/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir o painel da loja" })).toHaveCount(0); // atalho só para admin

    // Cliente logado tentando entrar no painel: barrado no servidor.
    await page.goto("/admin/produtos");
    await expect(page).toHaveURL(/\/admin\/login\?erro=sem-permissao/);
    await expect(page.getByText("Sua conta não tem acesso ao painel.")).toBeVisible();

    // Logout: a área do cliente volta a pedir login; depois entra de novo.
    await page.goto("/minha-conta");
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL((u) => u.pathname === "/");
    await page.goto("/minha-conta");
    await expect(page).toHaveURL(/\/login\?returnTo=/);
    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL((u) => u.pathname === "/minha-conta");

    await page.goto("/produtos/sauvage-dior");
    await page.getByRole("button", { name: /Adicionar Sauvage aos favoritos/ }).click();
    await expect(page.getByRole("button", { name: /Remover Sauvage dos favoritos/ })).toHaveAttribute("aria-pressed", "true");
    await page.goto("/minha-conta/favoritos");
    await expect(page.getByRole("link", { name: "Sauvage" })).toBeVisible();

    await page.goto("/minha-conta/enderecos");
    const novo = page.getByRole("region", { name: "Novo endereço" });
    await novo.getByLabel("Quem recebe", { exact: true }).fill("Cliente E2E");
    await novo.getByLabel("CEP", { exact: true }).fill("01310-100");
    await novo.getByLabel("Endereço", { exact: true }).fill("Av. Paulista");
    await novo.getByLabel("Número", { exact: true }).fill("1000");
    await novo.getByLabel("Bairro", { exact: true }).fill("Bela Vista");
    await novo.getByLabel("Cidade", { exact: true }).fill("São Paulo");
    await novo.getByLabel("Estado", { exact: true }).selectOption("SP");
    await novo.getByRole("button", { name: "Adicionar endereço" }).click();
    await expect(page.getByText("Padrão")).toBeVisible();
    expect(violations(await axe(page)), "endereços").toEqual([]);

    await page.goto("/produtos/sauvage-dior");
    await page.getByRole("button", { name: "Adicionar à sacola" }).click();
    await page.goto("/checkout");
    await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue(email);
    await expect(page.getByLabel("Endereço", { exact: true })).toHaveValue("Av. Paulista");
    await expect(page.getByLabel("Nome completo", { exact: true })).toHaveValue("Cliente E2E");

    // Compra autenticada: o pedido fica vinculado à conta e aparece em "Meus pedidos".
    // (Fica aguardando pagamento e a reserva expira sozinha em 30 min.)
    await page.getByLabel(/Li e aceito/).check();
    await page.getByRole("button", { name: "Concluir pedido" }).click();
    await expect(page).toHaveURL(/\/pedido\/[0-9a-f]{64}\?novo=1$/, { timeout: 20_000 });
    const orderNumber = (await page.getByRole("heading", { level: 1 }).textContent())!.match(/#(\d+)/)![1];
    await page.goto("/minha-conta/pedidos");
    await expect(page.getByRole("link", { name: `Pedido #${orderNumber}` })).toBeVisible();

    await page.goto("/minha-conta/perfil");
    const download = page.waitForEvent("download");
    await page.getByRole("link", { name: /Baixar meus dados/ }).click();
    const file = await (await download).path();
    const data = JSON.parse(await (await import("node:fs/promises")).readFile(file!, "utf8"));
    expect(data.conta.email).toBe(email);
    expect(data.enderecos).toHaveLength(1);
    expect(data.favoritos).toHaveLength(1);
    expect(violations(await axe(page)), "perfil").toEqual([]);

    const excluir = page.getByRole("region", { name: "Excluir conta" });
    await excluir.getByLabel("Digite EXCLUIR para confirmar").fill("EXCLUIR");
    await excluir.getByLabel("Sua senha").fill(password);
    await excluir.getByRole("button", { name: "Excluir minha conta" }).click();
    await expect(page).toHaveURL(/\/\?conta=excluida$/);

    const { data: check } = await admin().auth.admin.getUserById(userId!);
    expect(check.user).toBeNull();
    userId = null;
  });
});
