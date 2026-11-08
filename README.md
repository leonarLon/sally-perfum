# Sally Perfumaria

E-commerce de perfumes com identidade rosa e branca, painel administrativo e Consultor de Fragrâncias com IA.

> **Projeto de estudo e demonstração.** Não é uma loja oficial e não realiza vendas reais. Pagamentos são simulados, e preços, estoques e imagens servem apenas para demonstração. O que muda numa operação real está em [docs/PENDENCIAS_COMERCIAIS.md](docs/PENDENCIAS_COMERCIAIS.md).

## Status por fase

| Fase | Situação |
|---|---|
| 1. Diagnóstico e engenharia reversa | ✅ [docs/FASE-1-DIAGNOSTICO.md](docs/FASE-1-DIAGNOSTICO.md) |
| 2. Design system e fundação | ✅ Tokens, componentes base, layouts da loja e do admin, mapa de rotas, testes configurados |
| 3. Catálogo público | ⏳ Próxima |
| 4. Supabase: modelo, migrations e seed de 40+ produtos | ⏳ Depende do projeto Supabase (ver abaixo) |
| 5 a 11 | ⏳ Planejadas |

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
| `ANTHROPIC_API_KEY` / `VOYAGE_API_KEY` | Consultor de IA (Fase 9); opcionais | **Sim** |
| `PAYMENT_PROVIDER` | `fake` (simulado) | Não |

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
- ARCHITECTURE.md, DATA_MODEL.md, SECURITY.md, AI_ARCHITECTURE.md, PRODUCT_CATALOG.md e COST_ESTIMATE.md serão criados nas fases correspondentes.

## Limitações atuais
- Nenhum dado de catálogo ainda: o banco e o seed entram nas Fases 3 e 4.
- A checagem de papel administrativo no servidor entra na Fase 5. Hoje o painel não tem nenhuma operação real.
- A CSP completa entra na Fase 10.
