import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Sacola e checkout (Fase 6) contra o Supabase do .env.local.
 * Os testes de sacola e validação não gravam nada. O fluxo completo cria um pedido REAL
 * (reserva estoque) e o cancela pelo painel: só roda com E2E_CHECKOUT_WRITE=1 e credenciais.
 */
const SLUG = "sauvage-dior";
const cartLink = (page: Page) => page.getByRole("navigation", { name: "Atalhos da conta" }).getByRole("link", { name: /Sacola/ });

async function addToCart(page: Page, qty = 1) {
  await page.goto(`/produtos/${SLUG}`);
  await expect(page.getByRole("heading", { level: 1, name: "Sauvage" })).toBeVisible();
  if (qty > 1) await page.getByLabel("Quantidade").selectOption(String(qty));
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Adicionado à sacola." })).toBeVisible();
}

test.describe("Sacola", () => {
  test("adiciona do produto, atualiza o contador e calcula frete pelo CEP", async ({ page }) => {
    await addToCart(page, 2);
    await expect(cartLink(page)).toContainText("2");

    await page.goto("/carrinho");
    await expect(page.getByRole("heading", { level: 1, name: "Sacola" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sauvage/ })).toBeVisible();
    await expect(page.getByText("informe o CEP")).toBeVisible();

    await page.getByLabel("Calcular frete").fill("01310-100");
    await expect(page.getByText(/São Paulo \(capital e região\)/)).toBeVisible();

    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);

    await page.getByRole("button", { name: /Remover/ }).click();
    await expect(page.getByText("Sua sacola está vazia.")).toBeVisible();
  });

  test("sacola adulterada no navegador não altera preço: o servidor recalcula", async ({ page }) => {
    await addToCart(page);
    await page.evaluate(() => {
      const items = JSON.parse(localStorage.getItem("sally-cart-v1") ?? "[]");
      items[0].price_cents = 1; // tentativa de fraude
      localStorage.setItem("sally-cart-v1", JSON.stringify(items));
    });
    await page.goto("/carrinho");
    await expect(page.getByText("R$ 0,01")).toHaveCount(0);
    await expect(page.getByText(/R\$\s[\d.]+,\d{2} cada/)).toBeVisible();
  });
});

test.describe("Checkout", () => {
  test("valida campos obrigatórios e consentimento sem criar pedido", async ({ page }) => {
    await addToCart(page);
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { level: 1, name: "Finalizar compra" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Concluir pedido" })).toBeEnabled();
    await page.getByRole("button", { name: "Concluir pedido" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Revise os campos destacados." })).toBeVisible();
    await expect(page.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(page.getByText(/aceitar a política de privacidade/)).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);

    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });

  test("webhook de pagamento recusa chamada sem assinatura válida", async ({ request }) => {
    const body = { id: "evt_forjado123456", type: "payment.approved", created: 1, data: { provider_ref: `fake_pix_${"a".repeat(24)}`, amount_cents: 100 } };
    expect((await request.post("/api/webhooks/payments", { data: body })).status()).toBe(401);
    const forged = await request.post("/api/webhooks/payments", { data: body, headers: { "x-sally-signature": `t=${Math.floor(Date.now() / 1000)},v1=${"0".repeat(64)}` } });
    expect(forged.status()).toBe(401);
  });

  test("página de pedido com token inválido mostra não encontrado", async ({ page }) => {
    await page.goto(`/pedido/${"0".repeat(64)}`);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });
});

test.describe("Compra completa com reserva e cancelamento", () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  test.skip(process.env.E2E_CHECKOUT_WRITE !== "1" || !email || !password, "Defina E2E_CHECKOUT_WRITE=1 e as credenciais de admin para rodar.");

  test("cria pedido, paga com cartão de teste (recusa e aprovação via webhook) e o painel cancela com estorno", async ({ page, isMobile }) => {
    test.skip(isMobile, "uma execução basta");
    test.setTimeout(120_000);
    page.on("dialog", (d) => d.accept());

    await addToCart(page);
    await page.goto("/checkout");
    await page.getByLabel("Nome completo", { exact: true }).fill("Cliente Teste E2E");
    await page.getByLabel("E-mail", { exact: true }).fill("e2e@example.com");
    await page.getByLabel("CEP", { exact: true }).fill("01310-100");
    await page.getByLabel("Endereço", { exact: true }).fill("Av. Paulista");
    await page.getByLabel("Número", { exact: true }).fill("1000");
    await page.getByLabel("Bairro", { exact: true }).fill("Bela Vista");
    await page.getByLabel("Cidade", { exact: true }).fill("São Paulo");
    await page.getByLabel("Estado", { exact: true }).selectOption("SP");
    await page.getByLabel(/Li e aceito/).check();
    await expect(page.getByText(/São Paulo \(capital e região\)/)).toBeVisible();
    await page.getByRole("button", { name: "Concluir pedido" }).click();

    await expect(page).toHaveURL(/\/pedido\/[0-9a-f]{64}\?novo=1$/, { timeout: 20_000 });
    await expect(page.getByText("Pedido recebido!")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).locator("..").getByText("Aguardando pagamento")).toBeVisible();
    const number = (await page.getByRole("heading", { level: 1 }).textContent())!.match(/#(\d+)/)![1];
    await expect(cartLink(page)).not.toContainText(/\d/);

    // Pagamento simulado: cartão recusado, depois aprovado (o webhook confirma e baixa o estoque).
    const pay = page.getByRole("region", { name: "Pagamento" });
    await pay.getByRole("tab", { name: "Cartão" }).click();
    await pay.getByLabel("Número do cartão").fill("4000 0000 0000 0002");
    await pay.getByLabel("Validade").fill("12/30");
    await pay.getByLabel("CVV").fill("123");
    await pay.getByRole("button", { name: "Pagar com cartão" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /recusad/i }).first()).toBeVisible();
    await expect(page.getByText("Aguardando pagamento").first()).toBeVisible();

    await pay.getByRole("tab", { name: "Cartão" }).click();
    await pay.getByLabel("Número do cartão").fill("4242 4242 4242 4242");
    await pay.getByLabel("Validade").fill("12/30");
    await pay.getByLabel("CVV").fill("123");
    await pay.getByRole("button", { name: "Pagar com cartão" }).click();
    await expect(page.getByText(/Pagamento aprovado \(Cartão de crédito, cartão final 4242\)/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1 }).locator("..").getByText("Pagamento confirmado")).toBeVisible();

    // Painel: encontra o pedido, cancela e confere o histórico.
    await page.goto(`/admin/login?returnTo=/admin/pedidos?q=${number}`);
    await page.getByLabel("E-mail", { exact: true }).fill(email!);
    await page.getByLabel("Senha").fill(password!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("link", { name: `#${number}` }).click();
    await expect(page.getByRole("heading", { level: 1, name: `Pedido #${number}` })).toBeVisible();
    await expect(page.getByText("Recusado", { exact: true })).toBeVisible();
    await expect(page.getByText("Aprovado", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancelar e devolver ao estoque" }).click();
    await expect(page.getByText("Cancelado").first()).toBeVisible();
    await expect(page.getByText("Estornado", { exact: true })).toBeVisible();
  });
});
