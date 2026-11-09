import { expect, test } from "@playwright/test";

/**
 * Gravação REAL no Supabase pelo painel, com reversão ao final. Só roda com
 * E2E_ADMIN_WRITE=1 (operação remota: exige autorização). Deixa registros na auditoria.
 * Estoque não é testado aqui: desfazer exigiria "contagem conferida", que tira a marca
 * de demonstração (coberto pelos testes de banco em tests/db/admin.db.test.ts).
 */
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const SLUG = "sauvage-dior";

const toCents = (v: string) => Number(v.replace(/\./g, "").replace(",", ""));
const toInput = (c: number) => `${Math.trunc(c / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${String(c % 100).padStart(2, "0")}`;
const shown = (c: number) => `R$ ${toInput(c)}`;

test.describe("Painel: gravação real com reversão", () => {
  test.skip(process.env.E2E_ADMIN_WRITE !== "1" || !email || !password, "Defina E2E_ADMIN_WRITE=1 (e credenciais) para rodar.");

  test("altera preço e imagem, a loja reflete na hora, e tudo é desfeito", async ({ page, request, isMobile }) => {
    test.skip(isMobile, "uma execução basta");
    test.setTimeout(120_000);
    page.on("dialog", (d) => d.accept());

    await page.goto("/admin/login?returnTo=/admin/produtos?q=sauvage");
    await page.getByLabel("E-mail").fill(email!);
    await page.getByLabel("Senha").fill(password!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("link", { name: "Sauvage", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Sauvage" })).toBeVisible();
    const editUrl = page.url();

    // --- Preço: muda, confere na loja, restaura ---
    const variant = page.getByRole("article").first();
    const priceField = variant.getByLabel("Preço (R$)", { exact: true });
    const original = await priceField.inputValue();
    const changed = toCents(original) - 100;
    await priceField.fill(toInput(changed));
    await variant.getByRole("button", { name: "Salvar variante" }).click();
    await expect(variant.getByRole("status")).toHaveText(/Variante salva/);

    await page.goto(`/produtos/${SLUG}`);
    await expect(page.getByText(shown(changed)).first()).toBeVisible();

    await page.goto(editUrl);
    const variantAgain = page.getByRole("article").first();
    await variantAgain.getByLabel("Preço (R$)", { exact: true }).fill(original);
    await variantAgain.getByRole("button", { name: "Salvar variante" }).click();
    await expect(variantAgain.getByRole("status")).toHaveText(/Variante salva/);
    await page.goto(`/produtos/${SLUG}`);
    await expect(page.getByText(shown(toCents(original))).first()).toBeVisible();

    // --- Imagem: envia (reaproveita a foto atual do Storage), confere, remove ---
    await page.goto(editUrl);
    const images = page.getByRole("region", { name: "Imagens" }).getByRole("listitem");
    const before = await images.count();
    const src = await images.first().locator("img").getAttribute("src");
    const original_url = new URL(src!, page.url()).searchParams.get("url") ?? src!;
    const file = await (await request.get(original_url)).body();

    await page.getByLabel("Arquivo").setInputFiles({ name: "teste.jpg", mimeType: "image/jpeg", buffer: file });
    await page.getByLabel("Descrição da imagem (texto alternativo)").fill("Teste E2E — imagem temporária");
    await page.getByRole("button", { name: "Enviar imagem" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Imagem enviada." })).toBeVisible();
    await expect(images).toHaveCount(before + 1);

    await page.getByRole("button", { name: "Remover imagem: Teste E2E — imagem temporária" }).click();
    await expect(images).toHaveCount(before);
    await expect(page.getByRole("button", { name: /Teste E2E/ })).toHaveCount(0);
  });
});
