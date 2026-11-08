# Registro de decisões

| Data | # | Decisão | Origem |
|---|---|---|---|
| 08/11/2026 | Contexto | O projeto é de **estudo e demonstração**, não uma loja oficial. Tudo em planos gratuitos. Ajustes comerciais só após a venda, listados em `PENDENCIAS_COMERCIAIS.md` | Usuário |
| 08/11/2026 | D1 | Stack: Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind v4 + Supabase. Hospedagem futura na Vercel **Hobby** (permitida porque não há uso comercial) | Proposta aceita |
| 08/11/2026 | D3 | Pagamentos com **provedor simulado** (`PAYMENT_PROVIDER=fake`) atrás de uma interface independente de gateway. Sem credenciais reais | Usuário |
| 08/11/2026 | D4 | LLM do Consultor: **Claude Opus** (`claude-opus-5-5`). A API é paga; sem chave, o Consultor funciona em modo demonstração (busca determinística no catálogo, sem LLM) | Usuário |
| 08/11/2026 | D5 | Fotos: imagens da internet permitidas para o estudo, com origem documentada por produto. Substituição obrigatória antes do uso comercial | Usuário |
| 08/11/2026 | D6 | Produtos: livre escolha de marcas e perfumes reais | Usuário |
| 08/11/2026 | D7 | Frete: tabela fixa por região | Usuário |
| 08/11/2026 | D8 | Dados do negócio: fictícios e identificados como demonstração | Usuário |
| 08/11/2026 | D9 | Commits e push autorizados, **sem linha de co-autoria** | Usuário |
| 08/11/2026 | Técnica | Mantido o `cacheComponents: true` (padrão do Next 16): catálogo com `'use cache'` + `cacheTag`, invalidado pelo admin com `updateTag` / `revalidateTag(tag, 'max')`; dados de sessão em `<Suspense>` | Engenharia |
| 08/11/2026 | Técnica | Proteção de rotas com `src/proxy.ts` (antigo middleware) apenas para UX; autorização real no servidor e na RLS | Engenharia |
| 08/11/2026 | Técnica | Testes de banco sem Docker: **PGlite** (Postgres em WASM) para validar migrations, RLS, concorrência e seed localmente | Engenharia |
| — | D2 | **Pendente:** projeto Supabase Free (o usuário cria e coloca as chaves no `.env.local`) | Aguardando |
