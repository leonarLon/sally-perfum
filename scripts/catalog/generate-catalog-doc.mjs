#!/usr/bin/env node
/** Gera docs/PRODUCT_CATALOG.md a partir de supabase/seed/catalog.json (+ relatório de carga, se existir). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const { products } = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.json"), "utf8"));
const loadReportPath = path.join(root, "supabase/seed/catalog.load-report.json");
const load = fs.existsSync(loadReportPath) ? JSON.parse(fs.readFileSync(loadReportPath, "utf8")) : null;
const loaded = load?.checks?.every((c) => c.ok);

const brl = (c) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const cat = { feminino: "Feminino", masculino: "Masculino", unissex: "Unissex" };
const status = loaded
  ? `Executado no Supabase e verificado em ${load.verifiedAt.slice(0, 10)}`
  : "**Seed preparado — NÃO executado no Supabase remoto** (aguardando autorização)";

let md = `# Catálogo inicial — Sally Perfumaria

> Gerado por \`scripts/catalog/generate-catalog-doc.mjs\`. Não edite à mão.

| Item | Situação |
|---|---|
| Produtos no seed | ${products.length} |
| Variantes (SKUs) | ${products.reduce((n, p) => n + p.variants.length, 0)} |
| Status da carga | ${status} |
| Publicação | ${loaded ? "Publicados no catálogo público" : "Serão publicados ao executar o seed (status \`published\`)"} |
| Revisão comercial | **Pendente para todos**: preços são de referência e o estoque é de DEMONSTRAÇÃO |

## Fontes e critérios
- **Dados de referência** (variantes, volumes, EAN, preços, imagens): API pública de catálogo da Época Cosméticos (VTEX), consultada em ${products[0]?.sources.consulted_at}. Os IDs consultados estão em \`supabase/seed/catalog.sources.json\`.
- **Notas olfativas:** preenchidas **somente** quando a descrição da fonte as lista explicitamente (\`supabase/seed/catalog.facts.json\`). Quando a fonte não confirma a pirâmide, ou ela parece inconsistente, os campos ficam vazios e a loja mostra "não confirmado".
- **Descrições:** textos próprios da Sally, gerados a partir dos fatos curados (\`scripts/catalog/description.mjs\`). Nenhum texto da fonte foi copiado.
- **Preços:** "preço" = preço de venda observado na fonte; "de" = preço de lista quando havia promoção. São **referências** e podem ser alterados no painel admin.
- **Estoque:** quantidades de **demonstração**, geradas de forma determinística por SKU (incluem esgotados e estoque baixo para exercitar a interface). Todas marcadas \`is_demo_quantity = true\`.
- **Imagens:** imagens públicas da fonte, usadas apenas neste projeto de estudo e **sem licença comercial** (decisão D5). Cada imagem tem a URL de origem registrada em \`product_images.source_url\`. A substituição é obrigatória antes de uso comercial (ver \`PENDENCIAS_COMERCIAIS.md\` §2).
- **Excluídos:** ${Object.entries(JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.sources.json"), "utf8"))._excluded ?? {}).map(([k, v]) => `\`${k}\`: ${v}`).join("; ") || "nenhum"}

## Produtos

| # | Produto | Marca | Categoria | Origem | Concentração | Volumes (ml) | Preço ref. (menor) | SKUs | Pirâmide | Fonte (info e imagem) |
|---|---|---|---|---|---|---|---|---|---|---|
`;

products.forEach((p, i) => {
  const vols = p.variants.map((v) => v.volume_ml).join(", ");
  const min = Math.min(...p.variants.map((v) => v.price_cents));
  const skus = p.variants.map((v) => `\`${v.sku}\``).join("<br>");
  const pyramid = p.top_notes || p.heart_notes || p.base_notes ? "Confirmada" : p.highlights ? "Parcial (destaques)" : "Não confirmada";
  md += `| ${i + 1} | ${p.name} | ${p.brand} | ${cat[p.gender]} | ${p.origin === "nacional" ? "Nacional" : "Importado"} | ${p.concentration ?? "—"} | ${vols} | ${brl(min)} | ${skus} | ${pyramid} | [página](${p.sources.info}) · ${p.images.length} imagem(ns) |\n`;
});

md += `
## Como a carga é feita
1. \`node scripts/catalog/build-seed-data.mjs\`: consulta a fonte, verifica as imagens e gera \`supabase/seed/catalog.json\`.
2. \`node scripts/catalog/generate-seed-sql.mjs\`: gera \`supabase/seed/catalog.seed.sql\`, idempotente.
3. Aplicar as migrations e o seed no Supabase (**exige autorização**).
4. \`node --env-file=.env.local scripts/catalog/upload-images.mjs\`: envia as imagens ao Storage (**exige autorização**).
5. \`node --env-file=.env.local scripts/catalog/verify-remote.mjs\`: verifica a carga como visitante e gera o relatório.
6. \`node scripts/catalog/generate-catalog-doc.mjs\`: atualiza este documento com o status real.
`;

fs.writeFileSync(path.join(root, "docs/PRODUCT_CATALOG.md"), md);
console.log("docs/PRODUCT_CATALOG.md atualizado.");
