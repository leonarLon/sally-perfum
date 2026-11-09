# Testes: rastreabilidade com o briefing

Mapa de cada grupo de testes do briefing (seção "Testes automatizados") e de cada teste de segurança (seção 20) para os arquivos que o cobrem. Atualizado em 09/11/2026.

## Como rodar
| Comando | O que roda |
|---|---|
| `npm run check` | Lint, tipos e Vitest: unitários, componentes e **banco** (Postgres real em PGlite, com todas as migrations e o seed) |
| `npm run e2e` | Playwright em desktop e mobile sobre o build de produção, contra o Supabase do `.env.local`. Não grava nada |
| `E2E_CHECKOUT_WRITE=1 E2E_ACCOUNT_WRITE=1 E2E_ADMIN_WRITE=1 npm run e2e` | Inclui os fluxos que **gravam** no Supabase e desfazem o que criam (exige autorização) |
| `node --env-file=.env.local scripts/catalog/verify-remote.mjs` | Conferência do Supabase real como visitante (28 checagens) |
| `node scripts/perf/lighthouse.mjs` | Lighthouse com mediana ([LIGHTHOUSE.md](LIGHTHOUSE.md)) |

Relatórios: JUnit em `test-results/vitest-junit.xml`, HTML do Playwright em `playwright-report/`, traces de falhas em `test-results/`. A suíte não chama serviços pagos.

Legenda: ✅ coberto · ◐ parcial (motivo ao lado) · ⏸️ não se aplica no momento · ❌ não implementado.

## Os 50 grupos

| # | Grupo | Situação | Onde |
|---|---|---|---|
| 1 | Catálogo | ✅ | `tests/db/catalog-rpc.db.test.ts`, `e2e/catalogo.spec.ts` |
| 2 | Busca | ✅ | `catalog-rpc.db` (multitermo, sem acento, sem curingas), `e2e/catalogo` (busca sem acento e pelo cabeçalho) |
| 3 | Filtros | ✅ | `catalog-rpc.db`, `src/lib/catalog/params.test.ts`, `e2e/catalogo` (gênero, marca, páginas de marca e categoria) |
| 4 | Ordenação | ✅ | `catalog-rpc.db`, `e2e/catalogo` |
| 5 | Paginação | ✅ | `catalog-rpc.db`, `e2e/catalogo` |
| 6 | Detalhe de produto | ✅ | `catalog-rpc.db` (`get_product`), `catalog-components.test.tsx`, `e2e/catalogo` (galeria, volumes, JSON-LD, relacionados) |
| 7 | Produto inexistente | ✅ | `catalog-rpc.db`, `e2e/catalogo` (404) |
| 8 | Cadastro | ◐ | `src/lib/auth/schemas.test.ts`, `e2e/conta` (validações). O cadastro com sucesso não é automatizado porque depende da configuração de confirmação de e-mail do Supabase; os testes criam o cliente pelo Admin API |
| 9 | Login | ✅ | `e2e/conta` (inválido e válido), `e2e/admin` |
| 10 | Logout | ✅ | `e2e/conta`, `e2e/admin` |
| 11 | Sessão persistente | ✅ | `e2e/conta` (recarregar e navegar mantém a sessão; cookie `httpOnly`) |
| 12 | Compra como visitante | ✅ | `tests/db/orders.db.test.ts`, `e2e/checkout` (fluxo completo, opt-in) |
| 13 | Compra autenticada | ✅ | `orders.db` (pedido vinculado ao usuário), `e2e/conta` (checkout preenchido, pedido em "Meus pedidos", opt-in) |
| 14 | Carrinho | ✅ | `src/lib/cart/store.test.ts`, `e2e/checkout` (sacola, frete, remoção, adulteração) |
| 15 | Merge de carrinho | ⏸️ | Não há sacola no servidor: ela fica no navegador e continua a mesma ao entrar na conta (decisão em `DECISOES.md`) |
| 16 | Favoritos | ✅ | `tests/db/customers.db.test.ts`, `e2e/conta` |
| 17 | Endereços | ✅ | `customers.db`, `auth/schemas.test`, `e2e/conta` |
| 18 | Upload de imagens | ✅ | `src/lib/admin/schemas.test.ts` (assinatura do arquivo), `scripts/catalog/upload-images.test.ts`, `e2e/admin-escrita` (opt-in) |
| 19 | Cadastro de produtos | ◐ | `admin/schemas.test` (validação), `admin.db` (RLS de escrita, rascunho oculto). Sem E2E de criação para não deixar produtos de teste no banco (não há exclusão, só arquivamento) |
| 20 | Atualização de produtos | ✅ | `admin.db` (auditoria do que mudou), `e2e/admin-escrita` (opt-in) |
| 21 | Atualização de estoque | ✅ | `tests/db/admin.db.test.ts` (contagem, entrada, mínimo, reservado, permissões) |
| 22 | Preço alterado | ✅ | `orders.db` (preço do banco, nunca o enviado), `e2e/admin-escrita` (loja reflete), `e2e/checkout` (sacola adulterada) |
| 23 | Produto esgotado | ✅ | `orders.db` (`ESTOQUE_INSUFICIENTE`), `catalog-components.test` (botão esgotado), `quote_cart` |
| 24 | Cupom inválido | ❌ | Cupons não implementados (`PENDENCIAS_COMERCIAIS.md` §4) |
| 25 | Cupom expirado | ❌ | Idem |
| 26 | Checkout | ✅ | `src/lib/checkout/schemas.test.ts`, `e2e/checkout` |
| 27 | Pagamento pendente | ✅ | `tests/db/payments.db.test.ts`, `e2e/checkout` |
| 28 | Pagamento aprovado | ✅ | `payments.db`, `e2e/checkout` |
| 29 | Pagamento recusado | ✅ | `payments.db`, `e2e/checkout` |
| 30 | Timeout | ✅ | `orders.db` (reserva expirada), `payments.db` (pagamento depois da expiração vai para estorno), `src/lib/payments/payments.test.ts` (falha no banco → 500 para o provedor repetir) |
| 31 | Idempotência | ✅ | `orders.db` (mesma chave, mesmo pedido), `payments.db` (mesmo evento) |
| 32 | Concorrência de estoque | ◐ | `orders.db`: reservas de outros pedidos contam, pedido é tudo ou nada, travas `FOR UPDATE` em ordem fixa. O PGlite tem uma conexão só, então não há execução realmente paralela no teste |
| 33 | Webhooks duplicados | ✅ | `payments.db`, `payments.test` |
| 34 | Pedidos de visitantes | ✅ | `orders.db` (`get_order_public`), `e2e/checkout` (token inválido) |
| 35 | Autorização administrativa | ✅ | `admin.db`, `orders.db`, `e2e/admin` |
| 36 | Cliente tentando acessar o admin | ✅ | `e2e/conta` (barrado no servidor), `admin.db`, `catalog.db` |
| 37 | Isolamento de dados | ✅ | `customers.db`, `orders.db` |
| 38 | Assistente de compras | ⏸️ | IA suspensa até a venda do projeto (`PENDENCIAS_COMERCIAIS.md` §6) |
| 39 | RAG | ⏸️ | Idem |
| 40 | Respostas sem dados suficientes | ⏸️ | Idem |
| 41 | Prompt injection | ⏸️ | Idem |
| 42 | Responsividade | ✅ | Toda a suíte E2E roda também em mobile (Pixel 7); `e2e/seguranca` (sem rolagem horizontal) |
| 43 | Acessibilidade | ✅ | axe (WCAG A/AA) em `e2e/fundacao`, `catalogo`, `checkout`, `conta`, `admin`; Lighthouse 100 |
| 44 | Recuperação de falhas | ✅ | `src/app/(loja)/error.test.tsx`, `payments.test` (retry), catálogo com `searchCatalogSafe` |
| 45 | Carga inicial de produtos | ✅ | `tests/db/catalog.db.test.ts`, `tests/catalog/seed-data.test.ts`, `verify-remote.mjs` |
| 46 | Produtos do Supabase no catálogo | ✅ | `e2e/catalogo` (dados reais), `verify-remote.mjs` |
| 47 | Atualização refletida na loja | ✅ | `e2e/admin-escrita` (opt-in) |
| 48 | Imagens indisponíveis | ✅ | `catalog-components.test` (placeholder identificado) |
| 49 | Sem informações olfativas completas | ✅ | `e2e/catalogo`, `catalog-components.test` |
| 50 | Estoque demo × confirmado | ✅ | `catalog.db` (seed demo), `admin.db` (contagem conferida tira a marca) |

**Resumo:** 40 ✅, 3 ◐, 5 ⏸️ (IA e merge de carrinho por decisão), 2 ❌ (cupons).

## Testes de segurança (seção 20)

| Teste | Situação | Onde |
|---|---|---|
| Cliente acessando o painel | ✅ | `e2e/conta` (redirecionado com "sem permissão"), `admin.db` (RPCs negam) |
| Cliente alterando o próprio papel | ✅ | `catalog.db` (`user_roles` sem escrita para clientes) |
| Pedido de outra pessoa | ✅ | `orders.db` (RLS por dono, token nunca legível) |
| Pedido por identificador previsível | ✅ | `orders.db` (token de 64 hex; número sequencial não dá acesso; injeção no token) |
| Alterar preço pelo frontend | ✅ | `orders.db`, `checkout/schemas.test`, `e2e/checkout` (sacola adulterada), `verify-remote` |
| Comprar produto esgotado | ✅ | `orders.db` |
| Quantidade além do estoque | ✅ | `orders.db`, `quote_cart` |
| Upload de arquivo inválido | ✅ | `admin/schemas.test` (SVG, GIF e texto recusados pela assinatura) |
| Webhook com assinatura inválida | ✅ | `payments.test`, `e2e/checkout` (forjado → 401) |
| Webhook duplicado | ✅ | `payments.db`, `payments.test` |
| Dados administrativos | ✅ | `admin.db`, `verify-remote` (visitante bloqueado em 16 recursos) |
| Vazamento entre sessões | ✅ | `customers.db`, `orders.db`; dados de sessão nunca em `'use cache'`; cookie `httpOnly` (`e2e/conta`) |
| Prompt injection via RAG | ⏸️ | IA suspensa |
| LLM executando ação administrativa | ⏸️ | IA suspensa |
| Segredos no bundle | ✅ | `e2e/seguranca` (varre `.next/static` atrás da service role, segredo do webhook, senha do banco e do admin) |
| Seed executado mais de uma vez | ✅ | `catalog.db` |
| Produtos duplicados | ✅ | `catalog.db`, `verify-remote` |
| Preço alterado sem autorização | ✅ | `catalog.db`, `admin.db` |
| Estoque alterado sem autorização | ✅ | `catalog.db`, `admin.db` |

**Resumo:** 17 ✅, 2 ⏸️ (IA).
