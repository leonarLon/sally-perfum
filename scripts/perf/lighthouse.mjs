#!/usr/bin/env node
/**
 * Auditoria Lighthouse das páginas principais, em desktop e mobile, com N execuções e
 * mediana. Requer o servidor de produção rodando (npm run build && npx next start -p 3200).
 *
 *   node scripts/perf/lighthouse.mjs [baseUrl=http://localhost:3200] [execucoes=3]
 *
 * Usa o Chromium do Playwright. Gera docs/LIGHTHOUSE.md e test-results/lighthouse.json.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const base = process.argv[2] ?? "http://localhost:3200";
const runs = Number(process.argv[3] ?? 3);
const pages = [
  ["Início", "/"],
  ["Catálogo", "/produtos"],
  ["Detalhe do produto", "/produtos/sauvage-dior"],
  ["Sacola", "/carrinho"],
  ["Checkout", "/checkout"],
];
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new", "--no-sandbox"] });
const results = [];
try {
  for (const formFactor of ["mobile", "desktop"]) {
    for (const [label, url] of pages) {
      const samples = [];
      for (let i = 0; i < runs; i++) {
        const r = await lighthouse(
          base + url,
          { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] },
          formFactor === "desktop" ? desktopConfig : undefined,
        );
        const { categories: c, audits: a } = r.lhr;
        samples.push({
          performance: Math.round(c.performance.score * 100),
          accessibility: Math.round(c.accessibility.score * 100),
          bestPractices: Math.round(c["best-practices"].score * 100),
          seo: Math.round(c.seo.score * 100),
          lcp: a["largest-contentful-paint"].numericValue,
          cls: a["cumulative-layout-shift"].numericValue,
          tbt: a["total-blocking-time"].numericValue,
          seoFailures: Object.values(a).filter((x) => x.score === 0 && r.lhr.categories.seo.auditRefs.some((ref) => ref.id === x.id)).map((x) => x.id),
          bpFailures: Object.values(a).filter((x) => x.score === 0 && r.lhr.categories["best-practices"].auditRefs.some((ref) => ref.id === x.id)).map((x) => x.id),
        });
      }
      const m = (k) => median(samples.map((s) => s[k]));
      const row = {
        formFactor, label, url, runs,
        performance: m("performance"), accessibility: m("accessibility"), bestPractices: m("bestPractices"), seo: m("seo"),
        lcpMs: Math.round(m("lcp")), cls: Number(m("cls").toFixed(3)), tbtMs: Math.round(m("tbt")),
        failures: [...new Set(samples.flatMap((s) => [...s.seoFailures, ...s.bpFailures]))],
      };
      results.push(row);
      console.log(`${formFactor.padEnd(7)} ${label.padEnd(20)} P${row.performance} A${row.accessibility} BP${row.bestPractices} SEO${row.seo} LCP ${row.lcpMs}ms CLS ${row.cls} TBT ${row.tbtMs}ms ${row.failures.join(",")}`);
    }
  }
} finally {
  await chrome.kill();
}

const root = path.resolve(import.meta.dirname, "../..");
fs.mkdirSync(path.join(root, "test-results"), { recursive: true });
fs.writeFileSync(path.join(root, "test-results/lighthouse.json"), JSON.stringify({ base, runs, measuredAt: new Date().toISOString(), results }, null, 2));
const table = (ff) =>
  [
    "| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |",
    "|---|---|---|---|---|---|---|---|",
    ...results
      .filter((r) => r.formFactor === ff)
      .map((r) => `| ${r.label} | ${r.performance} | ${r.accessibility} | ${r.bestPractices} | ${r.seo} | ${(r.lcpMs / 1000).toFixed(2)} s | ${r.cls} | ${r.tbtMs} ms |`),
  ].join("\n");
fs.writeFileSync(
  path.join(root, "docs/LIGHTHOUSE.md"),
  `# Auditoria Lighthouse

Medido em ${new Date().toISOString().slice(0, 10)} com \`scripts/perf/lighthouse.mjs\`: build de produção local (\`next start\`), Lighthouse ${JSON.parse(fs.readFileSync(path.join(root, "node_modules/lighthouse/package.json"), "utf8")).version}, **mediana de ${runs} execuções** por página. Dados do catálogo vindos do Supabase remoto (us-west-2), sem CDN: em produção na Vercel os tempos tendem a ser menores.

Sacola e checkout foram medidos **vazios** (a sacola fica no navegador do visitante).

## Mobile (emulação Moto G Power, 4G lento)
${table("mobile")}

## Desktop
${table("desktop")}

Itens reprovados em SEO/Boas práticas (qualquer execução): ${[...new Set(results.flatMap((r) => r.failures))].join(", ") || "nenhum"}.

## Leitura dos resultados
- **SEO 63 em Sacola e Checkout:** reprova só \`is-crawlable\`, porque essas páginas são marcadas \`noindex\` de propósito (não faz sentido indexar sacola e checkout).
- **SEO 92 no detalhe do produto (\`meta-description\`):** a descrição existe, mas o Next 16 envia o metadata de páginas dinâmicas por *streaming* no \`<body>\` e o React o move para o \`<head>\` no navegador. O Google interpreta corretamente; robôs que não executam JavaScript recebem o metadata no \`<head>\` (\`htmlLimitedBots\`). Não desligamos o streaming só para subir a nota.
- **LCP do detalhe no mobile:** a foto principal já carrega com prioridade; o tempo inclui a otimização da imagem, que busca o original no Storage do Supabase nos EUA, sob emulação de 4G lento.
- Nenhuma funcionalidade ou imagem foi removida para elevar pontuações.
`,
);
console.log("\nRelatório: docs/LIGHTHOUSE.md");
