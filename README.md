# Sally Perfumaria

E-commerce de perfumes com identidade rosa e branca e painel administrativo.

> **Demonstração:** https://sally-perfum.vercel.app
>
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
| Cupons | ✅ Cupons percentuais e de valor fixo, com mínimo, validade, limite de usos e uso único por e-mail; validados só no banco; tela no painel (`/admin/cupons`) |
| 11. Documentação final | ✅ Arquitetura ([ARCHITECTURE.md](docs/ARCHITECTURE.md)), estimativa de custos ([COST_ESTIMATE.md](docs/COST_ESTIMATE.md)), README revisado. **Publicado** em https://sally-perfum.vercel.app (Vercel Hobby, demonstração) |
| 9. IA (Consultor de Fragrâncias e RAG) | ⏸️ Suspensa até a venda do projeto; ver [PENDENCIAS_COMERCIAIS.md §6](docs/PENDENCIAS_COMERCIAIS.md) |

As telas do painel fora desta versão (Clientes, Relatórios, Configurações) exibem um aviso explícito dizendo onde está a informação hoje. Nada simula uma funcionalidade inexistente.

## Stack
- Next.js 16 (App Router, Cache Components, `proxy.ts`), React 19, TypeScript
- Tailwind CSS v4, com design tokens em `src/app/globals.css`
- Supabase (Postgres, Auth, Storage, RLS) com `@supabase/ssr` (sessão em cookies httpOnly); regras de dinheiro e estoque em funções SQL transacionais
- Zod (validação no servidor), lucide-react (ícones)
- Testes: Vitest + Testing Library (unitário e componentes), PGlite (banco em testes com as migrations reais, sem Docker), Playwright + axe-core (E2E e acessibilidade), Lighthouse

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
| `PAYMENT_WEBHOOK_SECRET` | Somente servidor: assinatura HMAC do webhook de pagamentos (32+ caracteres) | **Sim** |
| `STORE_MODE` | `demo` (padrão). Com `commercial`, build e servidor se recusam a subir com o pagamento simulado | Não |
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
  app/(loja)/          loja: catálogo, sacola, checkout, pedido, conta, login e cadastro
  app/admin/(painel)/  painel: produtos, estoque, pedidos, cupons, marcas, categorias
  app/admin/login/     login administrativo (fora do layout do painel)
  app/api/webhooks/    webhook de pagamento (HMAC)
  components/          ui (design system), catalog, cart, account, admin, layout
  lib/                 domínio e dados: catalog, checkout, payments, auth, admin, account, security, supabase, money
  proxy.ts             renovação de sessão e redirecionamento por UX
supabase/migrations/   0100 catálogo … 0700 cupons
supabase/seed/         carga inicial dos 45 produtos
scripts/               carga de imagens, conferência remota, criação do owner, Lighthouse
tests/db/              testes de banco (PGlite)
e2e/                   testes Playwright
docs/                  documentação
```
Detalhes em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentação
- [Arquitetura](docs/ARCHITECTURE.md) · [Estimativa de custos](docs/COST_ESTIMATE.md)
- [Diagnóstico e plano (Fase 1)](docs/FASE-1-DIAGNOSTICO.md)
- [Registro de decisões](docs/DECISOES.md)
- [Pendências para operação comercial](docs/PENDENCIAS_COMERCIAIS.md)
- [Modelo de dados](docs/DATA_MODEL.md)
- [Catálogo inicial e fontes](docs/PRODUCT_CATALOG.md)
- [Segurança](docs/SECURITY.md) · [Matriz de testes](docs/TESTES.md) · [Lighthouse](docs/LIGHTHOUSE.md)

## Limitações atuais
- Os E2E do catálogo rodam contra o Supabase configurado no `.env.local`, não contra um banco local. A suíte de banco (PGlite) é a parte determinística.
- Os testes de banco usam PGlite com um shim de `auth`/`storage` (`tests/db/supabase-shim.sql`). Eles validam o SQL, a RLS e o seed, mas não substituem um teste no Supabase real.
- Pagamentos são **simulados** (`PAYMENT_PROVIDER=fake`): nada é cobrado. Clientes, relatórios e configurações do painel ainda não existem.
- O checkout depende de JavaScript (a sacola fica no `localStorage`).
- Com o projeto dentro do OneDrive, arquivos antigos de `.next` às vezes viram atalhos de nuvem e travam o build. Por isso o `npm run build` apaga `.next` antes (`scripts/dev/clean-next.mjs`).
- E-mails de confirmação e de recuperação de senha dependem do SMTP gratuito do Supabase, com limite baixo de envios.
- Enviar um formulário do painel antes de o JavaScript carregar mostra uma tela em branco (limitação do Next com Cache Components em páginas dinâmicas). O login não tem esse problema.
- Publicado só como demonstração (Vercel Hobby + Supabase Free). Para uso comercial, os planos gratuitos não servem (a Vercel Hobby proíbe uso comercial; o Supabase Free pausa sem uso e não tem backup): ver [COST_ESTIMATE.md](docs/COST_ESTIMATE.md).
- Limite de tentativas em memória e liberação de reservas sob demanda (sem agendador): adequados à demonstração, a trocar com tráfego real.
- O painel não tem recuperação de senha nem 2FA (ver `PENDENCIAS_COMERCIAIS.md` §7). O histórico mostra o autor pelo id curto, não pelo e-mail.
- A CSP permite scripts inline (exigência do Next com pré-renderização parcial); ver [SECURITY.md](docs/SECURITY.md).
