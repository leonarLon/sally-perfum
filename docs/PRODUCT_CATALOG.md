# Catálogo inicial — Sally Perfumaria

> Gerado por `scripts/catalog/generate-catalog-doc.mjs`. Não edite à mão.

| Item | Situação |
|---|---|
| Produtos no seed | 45 |
| Variantes (SKUs) | 105 |
| Status da carga | **Seed preparado — NÃO executado no Supabase remoto** (aguardando autorização) |
| Publicação | Serão publicados ao executar o seed (status `published`) |
| Revisão comercial | **Pendente para todos**: preços são de referência e o estoque é de DEMONSTRAÇÃO |

## Fontes e critérios
- **Dados de referência** (variantes, volumes, EAN, preços, imagens): API pública de catálogo da Época Cosméticos (VTEX), consultada em 2026-11-08. Os IDs consultados estão em `supabase/seed/catalog.sources.json`.
- **Notas olfativas:** preenchidas **somente** quando a descrição da fonte as lista explicitamente (`supabase/seed/catalog.facts.json`). Quando a fonte não confirma a pirâmide, ou ela parece inconsistente, os campos ficam vazios e a loja mostra "não confirmado".
- **Descrições:** textos próprios da Sally, gerados a partir dos fatos curados (`scripts/catalog/description.mjs`). Nenhum texto da fonte foi copiado.
- **Preços:** "preço" = preço de venda observado na fonte; "de" = preço de lista quando havia promoção. São **referências** e podem ser alterados no painel admin.
- **Estoque:** quantidades de **demonstração**, geradas de forma determinística por SKU (incluem esgotados e estoque baixo para exercitar a interface). Todas marcadas `is_demo_quantity = true`.
- **Imagens:** imagens públicas da fonte, usadas apenas neste projeto de estudo e **sem licença comercial** (decisão D5). Cada imagem tem a URL de origem registrada em `product_images.source_url`. A substituição é obrigatória antes de uso comercial (ver `PENDENCIAS_COMERCIAIS.md` §2).
- **Excluídos:** `olympea`: Imagem principal da fonte mostrava frasco não confirmado como Olympéa Parfum (verificação visual em 08/11/2026).

## Produtos

| # | Produto | Marca | Categoria | Origem | Concentração | Volumes (ml) | Preço ref. (menor) | SKUs | Pirâmide | Fonte (info e imagem) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | La Vie Est Belle | Lancôme | Feminino | Importado | Eau de Parfum | 30, 50, 100 | R$ 325,90 | `SLY-LA-VIE-EST-BELLE-030`<br>`SLY-LA-VIE-EST-BELLE-050`<br>`SLY-LA-VIE-EST-BELLE-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/lancome-la-vie-est-belle-eau-de-parfum-320071/p) · 3 imagem(ns) |
| 2 | Good Girl | Carolina Herrera | Feminino | Importado | Eau de Parfum | 30, 50, 150 | R$ 428,00 | `SLY-GOOD-GIRL-030`<br>`SLY-GOOD-GIRL-050`<br>`SLY-GOOD-GIRL-150` | Não confirmada | [página](https://www.epocacosmeticos.com.br/good-girl--eau-de-parfum-feminino--30-ml-304241/p) · 3 imagem(ns) |
| 3 | Paradoxe | Prada | Feminino | Importado | Eau de Parfum | 30, 50, 90, 100 | R$ 489,00 | `SLY-PARADOXE-030`<br>`SLY-PARADOXE-050`<br>`SLY-PARADOXE-090`<br>`SLY-PARADOXE-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/prada-paradoxe-perfume-feminino-eau-de-parfum/p) · 3 imagem(ns) |
| 4 | Chloé | Chloé | Feminino | Importado | Eau de Parfum | 30, 50, 75, 100 | R$ 340,30 | `SLY-CHLOE-EDP-030`<br>`SLY-CHLOE-EDP-050`<br>`SLY-CHLOE-EDP-075`<br>`SLY-CHLOE-EDP-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/chloe-de-chloe-eau-de-parfum-feminino-164414/p) · 3 imagem(ns) |
| 5 | Idôle | Lancôme | Feminino | Importado | Eau de Parfum | 25, 50, 100 | R$ 529,00 | `SLY-IDOLE-025`<br>`SLY-IDOLE-050`<br>`SLY-IDOLE-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/idole-lancome-feminino-eau-de-parfum-25ml-283600/p) · 3 imagem(ns) |
| 6 | Libre | Yves Saint Laurent | Feminino | Importado | Eau de Parfum | 30, 50, 90 | R$ 479,00 | `SLY-LIBRE-030`<br>`SLY-LIBRE-050`<br>`SLY-LIBRE-090` | Confirmada | [página](https://www.epocacosmeticos.com.br/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum/p) · 3 imagem(ns) |
| 7 | Miss Dior Parfum | Dior | Feminino | Importado | Parfum | 35, 50, 80 | R$ 689,00 | `SLY-MISS-DIOR-PARFUM-035`<br>`SLY-MISS-DIOR-PARFUM-050`<br>`SLY-MISS-DIOR-PARFUM-080` | Confirmada | [página](https://www.epocacosmeticos.com.br/miss-dior-perfume-feminino-parfum/p) · 3 imagem(ns) |
| 8 | Sì | Giorgio Armani | Feminino | Importado | Eau de Parfum | 30, 50, 100 | R$ 450,00 | `SLY-SI-030`<br>`SLY-SI-050`<br>`SLY-SI-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/si-eau-de-parfum-giorgio-armani-perfume-feminino/p) · 3 imagem(ns) |
| 9 | Light Blue | Dolce&Gabbana | Feminino | Importado | Eau de Toilette | 30, 50, 100 | R$ 371,47 | `SLY-LIGHT-BLUE-030`<br>`SLY-LIGHT-BLUE-050`<br>`SLY-LIGHT-BLUE-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino/p) · 3 imagem(ns) |
| 10 | Her | Burberry | Feminino | Importado | Eau de Parfum | 30, 50, 100 | R$ 483,90 | `SLY-BURBERRY-HER-030`<br>`SLY-BURBERRY-HER-050`<br>`SLY-BURBERRY-HER-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/burberry-her-eau-de-parfum-106177/p) · 3 imagem(ns) |
| 11 | Daisy | Marc Jacobs | Feminino | Importado | Eau de Toilette | 50, 100 | R$ 441,15 | `SLY-DAISY-050`<br>`SLY-DAISY-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/daisy-eau-de-toilette-marc-jacobs-perfume-feminino/p) · 3 imagem(ns) |
| 12 | Scandal | Jean Paul Gaultier | Feminino | Importado | Eau de Parfum | 30, 50, 80 | R$ 406,00 | `SLY-SCANDAL-030`<br>`SLY-SCANDAL-050`<br>`SLY-SCANDAL-080` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/scandal-jean-paul-gaultier-eau-de-parfum-feminino-30-ml-240113/p) · 3 imagem(ns) |
| 13 | 212 VIP Rosé | Carolina Herrera | Feminino | Importado | Eau de Parfum | 30, 125 | R$ 529,99 | `SLY-212-VIP-ROSE-030`<br>`SLY-212-VIP-ROSE-125` | Confirmada | [página](https://www.epocacosmeticos.com.br/perfume-212-vip-rose-edp-feminino-30ml-269518/p) · 3 imagem(ns) |
| 14 | Yara | Lattafa | Feminino | Importado | Eau de Parfum | 100 | R$ 282,20 | `SLY-YARA-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/yara-lattafa-eau-de-parfum-feminino-164510/p) · 2 imagem(ns) |
| 15 | Born in Roma Donna | Valentino | Feminino | Importado | Eau de Parfum | 30, 50, 100 | R$ 545,50 | `SLY-BORN-IN-ROMA-DONNA-030`<br>`SLY-BORN-IN-ROMA-DONNA-050`<br>`SLY-BORN-IN-ROMA-DONNA-100` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/perfume-valentino-born-in-roma-donna-feminino-eau-de-parfum/p) · 3 imagem(ns) |
| 16 | The One | Dolce&Gabbana | Feminino | Importado | Eau de Parfum | 30, 75 | R$ 489,70 | `SLY-THE-ONE-DG-030`<br>`SLY-THE-ONE-DG-075` | Confirmada | [página](https://www.epocacosmeticos.com.br/the-one-by-dolce-gabbana-eau-de-parfum-feminino-178745/p) · 3 imagem(ns) |
| 17 | Floratta Red Passion | O Boticário | Feminino | Nacional | Eau de Parfum | 75 | R$ 369,90 | `SLY-FLORATTA-RED-PASSION-075` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/floratta-red-passion-eau-de-parfum-75ml-241814/p) · 3 imagem(ns) |
| 18 | Floratta Rose Sucrée | O Boticário | Feminino | Nacional | Eau de Parfum | 75 | R$ 332,10 | `SLY-FLORATTA-ROSE-SUCREE-075` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/floratta-rose-sucree-eau-de-parfum-75ml-|-o-boticario-241811/p) · 3 imagem(ns) |
| 19 | Sauvage | Dior | Masculino | Importado | Eau de Toilette | 30, 60, 100, 200 | R$ 635,00 | `SLY-SAUVAGE-EDT-030`<br>`SLY-SAUVAGE-EDT-060`<br>`SLY-SAUVAGE-EDT-100`<br>`SLY-SAUVAGE-EDT-200` | Confirmada | [página](https://www.epocacosmeticos.com.br/sauvage-eau-de-toilette-dior-perfume-masculino/p) · 3 imagem(ns) |
| 20 | 1 Million | Rabanne | Masculino | Importado | Eau de Toilette | 50, 100, 200 | R$ 558,00 | `SLY-1-MILLION-050`<br>`SLY-1-MILLION-100`<br>`SLY-1-MILLION-200` | Confirmada | [página](https://www.epocacosmeticos.com.br/rabanne-1-million-eau-de-toilette---perfume-masculino-323995/p) · 3 imagem(ns) |
| 21 | Invictus | Rabanne | Masculino | Importado | Eau de Toilette | 50, 100, 200 | R$ 560,00 | `SLY-INVICTUS-050`<br>`SLY-INVICTUS-100`<br>`SLY-INVICTUS-200` | Confirmada | [página](https://www.epocacosmeticos.com.br/rabanne-invictus-eau-de-toilette---perfume-masculino-324291/p) · 3 imagem(ns) |
| 22 | Acqua di Giò | Giorgio Armani | Masculino | Importado | Eau de Parfum | 40, 50, 75, 100, 125, 200 | R$ 499,00 | `SLY-ACQUA-DI-GIO-EDP-040`<br>`SLY-ACQUA-DI-GIO-EDP-050`<br>`SLY-ACQUA-DI-GIO-EDP-075`<br>`SLY-ACQUA-DI-GIO-EDP-100`<br>`SLY-ACQUA-DI-GIO-EDP-125`<br>`SLY-ACQUA-DI-GIO-EDP-200` | Confirmada | [página](https://www.epocacosmeticos.com.br/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum/p) · 3 imagem(ns) |
| 23 | Wanted | Azzaro | Masculino | Importado | Eau de Toilette | 50, 100, 150 | R$ 552,49 | `SLY-WANTED-050`<br>`SLY-WANTED-100`<br>`SLY-WANTED-150` | Confirmada | [página](https://www.epocacosmeticos.com.br/wanted-eau-de-toillete-azzaro-perfume-masculino/p) · 3 imagem(ns) |
| 24 | Le Male | Jean Paul Gaultier | Masculino | Importado | Eau de Toilette | 40, 75, 125 | R$ 358,91 | `SLY-LE-MALE-040`<br>`SLY-LE-MALE-075`<br>`SLY-LE-MALE-125` | Confirmada | [página](https://www.epocacosmeticos.com.br/le-male-eau-de-toilette-jean-paul-gaultier-perfume-masculino/p) · 3 imagem(ns) |
| 25 | Explorer | Montblanc | Masculino | Importado | Eau de Parfum | 30, 60, 100, 200 | R$ 449,63 | `SLY-EXPLORER-030`<br>`SLY-EXPLORER-060`<br>`SLY-EXPLORER-100`<br>`SLY-EXPLORER-200` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/explorer-montblanc-perfume-masculino-eau-de-parfum/p) · 3 imagem(ns) |
| 26 | Eros | Versace | Masculino | Importado | Eau de Toilette | 30, 100, 200 | R$ 439,00 | `SLY-EROS-030`<br>`SLY-EROS-100`<br>`SLY-EROS-200` | Confirmada | [página](https://www.epocacosmeticos.com.br/eros-versace-edt-masculino-30ml-233464/p) · 3 imagem(ns) |
| 27 | 212 VIP Men | Carolina Herrera | Masculino | Importado | Eau de Toilette | 50, 100, 200 | R$ 484,00 | `SLY-212-VIP-MEN-050`<br>`SLY-212-VIP-MEN-100`<br>`SLY-212-VIP-MEN-200` | Confirmada | [página](https://www.epocacosmeticos.com.br/212-vip-men-eau-de-toilette-carolina-herrera-perfume-masculino/p) · 3 imagem(ns) |
| 28 | Bad Boy | Carolina Herrera | Masculino | Importado | Eau de Toilette | 100, 150 | R$ 749,00 | `SLY-BAD-BOY-100`<br>`SLY-BAD-BOY-150` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/bad-boy-carolina-herrera-masculino-eau-de-toilette-100ml-283140/p) · 2 imagem(ns) |
| 29 | Polo Blue Parfum | Ralph Lauren | Masculino | Importado | Parfum | 125 | R$ 654,04 | `SLY-POLO-BLUE-PARFUM-125` | Confirmada | [página](https://www.epocacosmeticos.com.br/polo-blue-parfum-de-ralph-lauren-masculino-264134/p) · 2 imagem(ns) |
| 30 | Boss Bottled | Hugo Boss | Masculino | Importado | Eau de Toilette | 30, 50, 100 | R$ 269,90 | `SLY-BOSS-BOTTLED-030`<br>`SLY-BOSS-BOTTLED-050`<br>`SLY-BOSS-BOTTLED-100` | Não confirmada | [página](https://www.epocacosmeticos.com.br/boss-bottled-edt-30ml-300283/p) · 3 imagem(ns) |
| 31 | Born in Roma Uomo | Valentino | Masculino | Importado | Eau de Toilette | 50, 100, 150 | R$ 483,63 | `SLY-BORN-IN-ROMA-UOMO-050`<br>`SLY-BORN-IN-ROMA-UOMO-100`<br>`SLY-BORN-IN-ROMA-UOMO-150` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/perfume-valentino-born-in-roma-uomo-masculino-eau-de-tolitte/p) · 3 imagem(ns) |
| 32 | Club de Nuit Intense Man | Armaf | Masculino | Importado | Eau de Toilette | 105 | R$ 328,00 | `SLY-CLUB-DE-NUIT-INTENSE-105` | Confirmada | [página](https://www.epocacosmeticos.com.br/club-de-nuit-intense-man-armaf-eau-de-toilette-105-ml-238917/p) · 3 imagem(ns) |
| 33 | Asad | Lattafa | Masculino | Importado | Eau de Parfum | 100 | R$ 259,90 | `SLY-ASAD-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/asad-lattafa-perfume-masculino-edp-100ml-263955/p) · 1 imagem(ns) |
| 34 | Dylan Blue Pour Homme | Versace | Masculino | Importado | Eau de Toilette | 50, 200 | R$ 684,08 | `SLY-DYLAN-BLUE-050`<br>`SLY-DYLAN-BLUE-200` | Não confirmada | [página](https://www.epocacosmeticos.com.br/perfume-masculino-pour-homme-dylan-blue-versace-50-ml-eau-de-toilette-261515/p) · 3 imagem(ns) |
| 35 | CK One | Calvin Klein | Unissex | Importado | Eau de Toilette | 100, 200 | R$ 339,00 | `SLY-CK-ONE-100`<br>`SLY-CK-ONE-200` | Confirmada | [página](https://www.epocacosmeticos.com.br/perfume-ck-one-eau-de-toilette-100ml-284491/p) · 3 imagem(ns) |
| 36 | Wood Sage & Sea Salt | Jo Malone London | Unissex | Importado | Cologne | 30, 100 | R$ 545,00 | `SLY-WOOD-SAGE-SEA-SALT-030`<br>`SLY-WOOD-SAGE-SEA-SALT-100` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/wood-sage-e-sea-salt-cologne-jo-malone-perfume-unissex/p) · 3 imagem(ns) |
| 37 | Khamrah | Lattafa | Unissex | Importado | Eau de Parfum | 100 | R$ 204,90 | `SLY-KHAMRAH-100` | Não confirmada | [página](https://www.epocacosmeticos.com.br/perfume-khamrah-lattafa-edp-unissex-100ml-193927/p) · 3 imagem(ns) |
| 38 | Liz Flora | O Boticário | Feminino | Nacional | Desodorante Colônia | 100 | R$ 119,90 | `SLY-LIZ-FLORA-100` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/perfume-feminino-o-boticario-liz-flora-100ml-303809/p) · 3 imagem(ns) |
| 39 | Egeo Choc | O Boticário | Feminino | Nacional | Desodorante Colônia | 90 | R$ 249,90 | `SLY-EGEO-CHOC-090` | Confirmada | [página](https://www.epocacosmeticos.com.br/egeo-choc-desodorante-colonia-90ml-|-original-264879/p) · 3 imagem(ns) |
| 40 | Malbec Eau de Parfum | O Boticário | Masculino | Nacional | Eau de Parfum | 90 | R$ 469,90 | `SLY-MALBEC-EDP-090` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/malbec-eau-de-parfum-90ml-|-original-264723/p) · 3 imagem(ns) |
| 41 | Malbec Gold | O Boticário | Masculino | Nacional | Desodorante Colônia | 100 | R$ 359,91 | `SLY-MALBEC-GOLD-100` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/malbec-gold-desodorante-colonia-100ml-194532/p) · 3 imagem(ns) |
| 42 | Kaiak | Natura | Masculino | Nacional | Desodorante Colônia | 100 | R$ 177,98 | `SLY-KAIAK-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/desodorante-colonia-masculino-kaiak-tradicional-natura-100ml-279402/p) · 3 imagem(ns) |
| 43 | Essencial Exclusivo Feminino | Natura | Feminino | Nacional | Deo Parfum | 100 | R$ 449,90 | `SLY-ESSENCIAL-EXCLUSIVO-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/natura-essencial-exclusivo-deo-parfum-100-ml-194521/p) · 3 imagem(ns) |
| 44 | Essencial Clássico Masculino | Natura | Masculino | Nacional | Deo Parfum | 100 | R$ 449,90 | `SLY-ESSENCIAL-CLASSICO-100` | Confirmada | [página](https://www.epocacosmeticos.com.br/natura-deo-parfum-essencial-classico-masculino-100ml-194522/p) · 3 imagem(ns) |
| 45 | Luna Clássico | Natura | Feminino | Nacional | Desodorante Colônia | 75 | R$ 119,90 | `SLY-LUNA-CLASSICO-075` | Parcial (destaques) | [página](https://www.epocacosmeticos.com.br/perfume-feminino-natura-luna-classico-75ml-298813/p) · 1 imagem(ns) |

## Como a carga é feita
1. `node scripts/catalog/build-seed-data.mjs`: consulta a fonte, verifica as imagens e gera `supabase/seed/catalog.json`.
2. `node scripts/catalog/generate-seed-sql.mjs`: gera `supabase/seed/catalog.seed.sql`, idempotente.
3. Aplicar as migrations e o seed no Supabase (**exige autorização**).
4. `node --env-file=.env.local scripts/catalog/upload-images.mjs`: envia as imagens ao Storage (**exige autorização**).
5. `node --env-file=.env.local scripts/catalog/verify-remote.mjs`: verifica a carga como visitante e gera o relatório.
6. `node scripts/catalog/generate-catalog-doc.mjs`: atualiza este documento com o status real.
