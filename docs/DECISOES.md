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
| 08/11/2026 | D4 (revisada) | **Consultor de IA retirado do site** até a venda do projeto (a API é paga). Implementação descrita em `PENDENCIAS_COMERCIAIS.md` §6. A Fase 9 fica suspensa | Usuário |
| 08/11/2026 | Técnica | Catálogo de 45 produtos com dados de referência da API pública de catálogo da Época Cosméticos (VTEX). Notas olfativas só quando explícitas na fonte; descrições próprias; imagem conferida visualmente (Olympéa excluída por imagem não confirmada) | Engenharia |
| 08/11/2026 | Técnica | Cada volume é um SKU (`product_variants`); estoque 1:1 por variante; o público vê só o `stock_status` (privilégio de coluna) | Engenharia |
| 08/11/2026 | Técnica | Busca, filtros e paginação em RPCs SQL `SECURITY INVOKER`, testáveis em PGlite e protegidas pela RLS | Engenharia |
| 08/11/2026 | Técnica | Imagens: `external_url` como fallback até o upload ao Storage (`upload-images.mjs`, com validação por magic bytes) | Engenharia |
| 08/11/2026 | D2 | Projeto Supabase Free criado pelo usuário; chaves no `.env.local` (conexão verificada) | Usuário |
| 08/11/2026 | D10 | **Autorizado** pelo usuário: migrations, seed de 45 produtos e upload de 128 imagens aplicados no Supabase e verificados (10/10 checagens, testes de RLS no banco real e 32 E2E) | Usuário |
| 08/11/2026 | Técnica | Tokens `success` (#1A6B43) e `warning` (#8A4F00) escurecidos após a auditoria axe apontar contraste insuficiente nos selos de estoque | Engenharia |
