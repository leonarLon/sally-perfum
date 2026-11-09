import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Segurança e responsividade sobre o build de produção que o Playwright acabou de gerar.
 */
test.describe("Segurança do build e cabeçalhos", () => {
  test("nenhum segredo do servidor aparece no código enviado ao navegador", async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "uma execução basta");
    const secrets: Record<string, string | undefined> = {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      SENHA_DO_BANCO: process.env.SUPABASE_DB_URL ? decodeURIComponent(new URL(process.env.SUPABASE_DB_URL).password) : undefined,
    };
    const present = Object.entries(secrets).filter(([, v]) => v && v.length >= 8);
    test.skip(present.length === 0, "sem segredos no ambiente para comparar");

    const dir = path.join(process.cwd(), ".next", "static");
    const files: string[] = [];
    const walk = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(js|css|json|txt|html|map)$/.test(e.name)) files.push(p);
      }
    };
    walk(dir);
    expect(files.length).toBeGreaterThan(10);

    const leaks: string[] = [];
    for (const f of files) {
      const content = fs.readFileSync(f, "utf8");
      for (const [name, value] of present) if (content.includes(value!)) leaks.push(`${name} em ${path.relative(dir, f)}`);
    }
    expect(leaks).toEqual([]);
  });

  test("páginas respondem com CSP e cabeçalhos de proteção", async ({ request }) => {
    for (const url of ["/", "/produtos", "/checkout", "/admin/login"]) {
      const h = (await request.get(url)).headers();
      expect(h["content-security-policy"], url).toContain("frame-ancestors 'none'");
      expect(h["content-security-policy"], url).toContain("object-src 'none'");
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["cross-origin-opener-policy"]).toBe("same-origin");
      expect(h["x-powered-by"]).toBeUndefined();
    }
  });

  test("a CSP não bloqueia a própria loja (sem violações no console)", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (m) => {
      if (/Content Security Policy|Refused to/.test(m.text())) violations.push(m.text().slice(0, 200));
    });
    for (const url of ["/", "/produtos", "/produtos/sauvage-dior", "/carrinho"]) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
    }
    expect(violations).toEqual([]);
  });
});

test.describe("Responsividade", () => {
  test("páginas principais sem rolagem horizontal", async ({ page }) => {
    for (const url of ["/", "/produtos", "/produtos/sauvage-dior", "/carrinho", "/checkout", "/login", "/cadastro"]) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${url} tem ${overflow}px de rolagem horizontal`).toBeLessThanOrEqual(1);
    }
  });
});
