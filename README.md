# Sally Perfumaria

E-commerce de perfumes com identidade rosa e branca e painel administrativo.

> **Projeto de estudo e demonstração.** Não é uma loja oficial e não realiza vendas reais. Pagamentos são simulados, e preços, estoques e imagens servem apenas para demonstração. O que muda numa operação real está em [docs/PENDENCIAS_COMERCIAIS.md](docs/PENDENCIAS_COMERCIAIS.md).

## Status por fase

| Fase | Situação |
|---|---|
| 1. Diagnóstico e engenharia reversa | ✅ [docs/FASE-1-DIAGNOSTICO.md](docs/FASE-1-DIAGNOSTICO.md) |
| 2. Design system e fundação | ✅ Tokens, componentes base, layouts da loja e do admin, mapa de rotas, testes configurados |
| 3. Catálogo público | ✅ Listagem, busca, filtros, ordenação, paginação, marca e categoria, detalhe do produto, SEO (sitemap, robots, JSON-LD). Lê só do Supabase |
| 4. Supabase: modelo, migrations e seed de 45 produtos | ✅ Aplicado no Supabase em 08/11/2026 (autorizado): 45 produtos publicados, 105 variantes, 128 imagens no Storage. Relatório em `supabase/seed/catalog.load-report.json` |
| 5. Painel administrativo | ✅ Login de admin, `requireRole` no servidor, produtos (criar, editar, publicar, arquivar), variantes e preços, imagens (upload validado, principal, remoção), estoque (contagem e entrada com movimentação), marcas, categorias, dashboard e auditoria automática. Migration aplicada no Supabase em 08/11/2026 (autorizado) |
| 6. Sacola, checkout e pedidos | ✅ Sacola no navegador, checkout sem cadastro, pedido com reserva de estoque transacional e idempotente, expiração da reserva, link secreto de acompanhamento, pedidos no painel (pagar, enviar, entregar, cancelar). Migration aplicada no Supabase em 08/11/2026 (autorizado) |
| 7. Área do cliente | ✅ Cadastro, login, recuperação de senha, Meus pedidos, endereços, favoritos, perfil, troca de senha, exportação de dados e exclusão de conta (LGPD); checkout preenchido para quem está logado. Migration aplicada no Supabase em 08/11/2026 (autorizado) |
| 8. Pagamentos (simulado) | ✅ Pix, boleto e cartão de teste por um provedor simulado atrás de interface independente de gateway; cartão tokenizado no navegador; webhook com assinatura HMAC, idempotente e com conferência de valor; estorno no cancelamento. Migration aplicada no Supabase em 08/11/2026 (autorizado) |
| 10. Segurança e qualidade | ✅ Revisão de segurança ([SECURITY.md](docs/SECURITY.md)), CSP e cabeçalhos, cookies de sessão `httpOnly`, trava do pagamento simulado em modo comercial, varredura de segredos no bundle, matriz de testes ([TESTES.md](docs/TESTES.md)) e Lighthouse com mediana ([LIGHTHOUSE.md](docs/LIGHTHOUSE.md)) |
| 11. Documentação final e publicação | ⏳ Planejada (publicação só com autorização) |
| 9. IA (Consultor de Fragrâncias e RAG) | ⏸️ Suspensa até a venda do projeto; ver [PENDENCIAS_COMERCIAIS.md §6](docs/PENDENCIAS_COMERCIAIS.md) |

As rotas ainda não implementadas exibem um aviso explícito ("Esta área ainda não foi implementada"), com a fase prevista. Nada simula uma funcionalidade inexistente.

## Stack
- Next.js 16 (App Router, Cache Components, `proxy.ts`), React 19, TypeScript
- Tailwind CSS v4, com design tokens em `src/app/globals.css`
- Supabase (Postgres, Auth, Storage, RLS, pgvector) com `@supabase/ssr` (sessão em cookies httpOnly)
- Zod e TanStack Query
- Testes: Vitest + Testing Library + MSW (unitário e integração), Playwright + axe-core (E2E e acessibilidade), PGlite (banco em testes, sem Docker)

## Requisitos
- Node.js ≥ 20.9 (desenvolvido com Node 24)
- npm

## Instalação
```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npx playwright install chromium   # apenas para E2E
```

### Variáveis de ambiente
Ver [.env.example](.env.example). Sem as variáveis do Supabase, a aplicação sobe, mas as áreas que dependem de dados exibem um erro de configuração claro.

| Variável | Onde é usada | Segredo? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente e servidor | Não |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente e servidor (protegida pela RLS) | Não |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente servidor (`server-only`) | **Sim** |
| `NEXT_PUBLIC_SITE_URL` | URLs absolutas e SEO | Não |
| `SUPABASE_DB_URL` | Somente CLI (migrations e seed); nunca usada pela aplicação | **Sim** |
| `PAYMENT_PROVIDER` | `fake` (simulado) | Não |
| `PAYMENT_WEBHOOK_SECRET` | Somente servidor: assinatura HMAC do webhook de pagamentos | **Sim** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Somente o script `create-owner.mjs` e o E2E do painel; nunca usadas pela aplicação | **Sim** (senha) |

## Comandos
| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (http://localhost:3000) |
| `npm run build` / `npm start` | Build de produção e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos de rota do Next e roda `tsc --noEmit` |
| `npm test` | Vitest (relatório JUnit em `test-results/`) |
| `npm run e2e` | Playwright em desktop e mobile (faz o build e sobe na porta 3100; relatório em `playwright-report/`, traces de falhas em `test-results/`) |
| `npm run check` | Lint + typecheck + testes unitários |
| `node scripts/perf/lighthouse.mjs [url] [execuções]` | Lighthouse em desktop e mobile com mediana (servidor de produção rodando) |
| `E2E_CHECKOUT_WRITE=1 npx playwright test e2e/checkout.spec.ts --project=desktop` | Cria um pedido de demonstração real e o cancela pelo painel (**exige autorização**) |
| `E2E_ACCOUNT_WRITE=1 npx playwright test e2e/conta.spec.ts --project=desktop` | Cria um cliente de teste, usa a conta e a exclui pela tela (**exige autorização**) |
| `E2E_ADMIN_WRITE=1 npx playwright test e2e/admin-escrita.spec.ts --project=desktop` | Grava de verdade no Supabase pelo painel (preço e imagem) e desfaz (**exige autorização**) |
| `node scripts/catalog/build-seed-data.mjs` | Recoleta os dados de referência e verifica as imagens (gera `supabase/seed/catalog.json`) |
| `node scripts/catalog/generate-seed-sql.mjs` | Gera o seed SQL idempotente |
| `npx supabase db push --remote="$SUPABASE_DB_URL" --include-seed --dry-run` | Mostra migrations e seed pendentes no Supabase (sem `--dry-run` aplica; **exige autorização**) |
| `node --env-file=.env.local scripts/catalog/upload-images.mjs` | Envia as imagens do seed ao Storage (**exige autorização**) |
| `node --env-file=.env.local scripts/catalog/verify-remote.mjs` | Verifica a carga e os bloqueios do painel no Supabase como visitante (somente leitura) |
| `node --env-file=.env.local scripts/admin/create-owner.mjs` | Cria a conta do proprietário e concede o papel `owner` (**exige autorização**) |

## Estrutura
```
src/
  app/(loja)/        loja pública (layout com header e footer)
  app/admin/(painel) painel administrativo (layout próprio com sidebar)
  app/admin/login    login administrativo (fora do layout do painel)
  components/ui      design system (Button, Input, Badge, Card…)
  components/layout  header, footer, logo
  components/admin   navegação do painel
  lib/               money (centavos), env, clientes Supabase
  proxy.ts           renovação de sessão e redirecionamento por UX
e2e/                 testes Playwright
docs/                diagnóstico, decisões e pendências comerciais
```

## Documentação
- [Diagnóstico e plano (Fase 1)](docs/FASE-1-DIAGNOSTICO.md)
- [Registro de decisões](docs/DECISOES.md)
- [Pendências para operação comercial](docs/PENDENCIAS_COMERCIAIS.md)
- [Modelo de dados](docs/DATA_MODEL.md)
- [Catálogo inicial e fontes](docs/PRODUCT_CATALOG.md)
- [Segurança](docs/SECURITY.md) · [Matriz de testes](docs/TESTES.md) · [Lighthouse](docs/LIGHTHOUSE.md)
- ARCHITECTURE.md e COST_ESTIMATE.md serão criados na Fase 11.

## Limitações atuais
- Os E2E do catálogo rodam contra o Supabase configurado no `.env.local`, não contra um banco local. A suíte de banco (PGlite) é a parte determinística.
- Os testes de banco usam PGlite com um shim de `auth`/`storage` (`tests/db/supabase-shim.sql`). Eles validam o SQL, a RLS e o seed, mas não substituem um teste no Supabase real.
- Pagamentos são **simulados** (`PAYMENT_PROVIDER=fake`): nada é cobrado. Cupons, clientes, relatórios e configurações do painel ainda não existem.
- O checkout depende de JavaScript (a sacola fica no `localStorage`).
- Com o projeto dentro do OneDrive, arquivos antigos de `.next` às vezes viram atalhos de nuvem e travam o build. Por isso o `npm run build` apaga `.next` antes (`scripts/dev/clean-next.mjs`).
- E-mails de confirmação e de recuperação de senha dependem do SMTP gratuito do Supabase, com limite baixo de envios.
- Enviar um formulário do painel antes de o JavaScript carregar mostra uma tela em branco (limitação do Next com Cache Components em páginas dinâmicas). O login não tem esse problema.
- O painel não tem recuperação de senha nem 2FA (ver `PENDENCIAS_COMERCIAIS.md` §7). O histórico mostra o autor pelo id curto, não pelo e-mail.
- A CSP permite scripts inline (exigência do Next com pré-renderização parcial); ver [SECURITY.md](docs/SECURITY.md).
