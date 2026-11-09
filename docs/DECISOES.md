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
| 08/11/2026 | D11 | **Autorizado** pelo usuário: Fase 5. Migration `20261108000300_admin.sql` aplicada no Supabase (dry-run antes) e verificada como visitante (16/16 checagens) | Usuário |
| 08/11/2026 | Técnica | Painel escreve com a **sessão do admin** (RLS ativa), não com service role. `requireRole` no layout, em cada leitura (DAL) e em cada server action | Engenharia |
| 08/11/2026 | Técnica | Auditoria por **trigger** no banco (não depende do código lembrar de registrar) e somente leitura pela API | Engenharia |
| 08/11/2026 | Técnica | Estoque só por RPC transacional com motivo obrigatório; "contagem conferida" tira a marca de demonstração, "entrada" não | Engenharia |
| 08/11/2026 | Técnica | Sem trigger de estoque em variante nova: o seed usa `on conflict do nothing` e perderia o estoque demo. A linha é criada pela primeira movimentação | Engenharia |
| 08/11/2026 | Técnica | `parseBRLToCents` passou a recusar "12.5" (antes virava R$ 125): ponto só como milhar em grupos de 3 | Engenharia |
| 08/11/2026 | Técnica | Login do painel com mensagem única para senha errada e conta sem papel (não revela e-mails cadastrados); `returnTo` restrito a `/admin` | Engenharia |
| 08/11/2026 | Técnica | Sessão lida após `connection()`: a validação do token do Supabase usa `Date.now()`, proibido na pré-renderização, e decisão de acesso nunca entra em conteúdo pré-montado | Engenharia |
| 08/11/2026 | Técnica | Página de login 100% estática (`returnTo` lido no navegador): com Cache Components, o envio sem JavaScript numa página com trecho dinâmico devolvia só o trecho (tela em branco). Formulários do painel, que são dinâmicos, ainda dependem do JavaScript carregado | Engenharia |
| 08/11/2026 | Técnica | Conta `owner` criada pelo usuário com `create-owner.mjs`. Teste de gravação real com reversão (`e2e/admin-escrita.spec.ts`, só com `E2E_ADMIN_WRITE=1`) passou: preço e imagem | Usuário / Engenharia |
| 08/11/2026 | D12 | **Autorizado** pelo usuário: Fase 6. Migration `20261108000400_orders.sql` aplicada no Supabase (dry-run antes), conferência remota 22/22 e teste com pedido de demonstração real cancelado pelo painel | Usuário |
| 08/11/2026 | Técnica | Sacola no `localStorage` com só variante e quantidade; preço, disponibilidade e frete sempre recalculados no banco (`quote_cart` / `create_order`) | Engenharia |
| 08/11/2026 | Técnica | `create_order` só com service role, chamado pela server action após validação, limite de tentativas e sessão verificada | Engenharia |
| 08/11/2026 | Técnica | Reserva no pedido (não na sacola), com expiração de 30 min liberada sob demanda; sem dependência de `pg_cron` no plano Free | Engenharia |
| 08/11/2026 | Técnica | Acompanhamento sem cadastro por token de 244 bits; a resposta omite rua, `user_id` e o próprio token | Engenharia |
| 08/11/2026 | Técnica | Sem pagamento real até a Fase 8: o admin confirma o pagamento no painel, o que baixa o estoque | Engenharia |
| 08/11/2026 | D13 | **Autorizado** pelo usuário: Fase 7. Migration `20261108000500_customers.sql` aplicada (dry-run antes), conferência remota 25/25 e teste com cliente de teste criado e excluído pela tela | Usuário |
| 08/11/2026 | D14 | Confirmação de e-mail no cadastro **desligada pelo usuário** para a demonstração (SMTP gratuito limitado). Religar antes do uso comercial | Usuário |
| 08/11/2026 | Técnica | Páginas de login, cadastro e senha estáticas (parâmetros lidos no navegador), para funcionarem antes da hidratação | Engenharia |
| 08/11/2026 | Técnica | Perfil criado sob demanda, sem trigger em `auth.users`; privilégio de UPDATE por coluna (revogar coluna não anula o UPDATE da tabela no Postgres) | Engenharia |
| 08/11/2026 | Técnica | Exclusão de conta exige "EXCLUIR" + senha atual (conferida num cliente isolado, sem trocar a sessão); admins não se excluem pela loja | Engenharia |
| 08/11/2026 | Técnica | `npm run build` limpa `.next` antes (OneDrive transforma arquivos de build em atalhos de nuvem). Junction para fora do OneDrive foi testada e descartada: o Turbopack não acha o `node_modules` | Engenharia |
| 08/11/2026 | D15 | **Autorizado** pelo usuário (antecipadamente): Fase 8. Migration `20261108000600_payments.sql` aplicada, conferência remota 28/28 e compra de teste paga com cartão (recusa e aprovação), cancelada com estorno | Usuário |
| 08/11/2026 | Técnica | Confirmação de pagamento **só** por evento do provedor com assinatura HMAC (`t=…,v1=…`, tolerância de 5 min) e aplicação idempotente no banco; a tela do cliente nunca marca pedido como pago | Engenharia |
| 08/11/2026 | Técnica | Cartão tokenizado no navegador; os campos do cartão não têm `name` (nem um envio sem JavaScript manda o número) | Engenharia |
| 08/11/2026 | Técnica | O resultado do pagamento aparece na própria página do pedido; as rotas `/checkout/sucesso`, `/pendente` e `/erro` foram removidas (o §7.7 do diagnóstico foi atendido dessa forma) | Engenharia |
| 09/11/2026 | D16 | Fase 10 autorizada pelo usuário. Sem migrations; fluxos E2E com gravação rodados e desfeitos | Usuário |
| 09/11/2026 | Técnica | CSP sem nonce (`'unsafe-inline'` em scripts): nonce é incompatível com a pré-renderização parcial (guia do Next). Mitigação: cookies `httpOnly`, zero HTML de usuário, Zod `jitless` (sem `eval`) | Engenharia |
| 09/11/2026 | Técnica | Cookies de sessão do Supabase com `httpOnly` (o padrão do `@supabase/ssr` é `false`); cliente Supabase de navegador removido por não ser usado | Engenharia |
| 09/11/2026 | Técnica | Trava `STORE_MODE=commercial` + `PAYMENT_PROVIDER=fake` → build/servidor falham | Engenharia |
| 09/11/2026 | Correção | Os números de grupo nos nomes dos testes não seguiam a numeração do briefing; foram removidos e a rastreabilidade passou a viver em `docs/TESTES.md` | Engenharia |
| 09/11/2026 | Correção | Falhas intermitentes nos E2E de login: a URL do login termina com o `returnTo`, e a checagem por regex passava antes do login concluir. Trocada por comparação do caminho | Engenharia |
| 09/11/2026 | D17 | **Autorizado** pelo usuário: cupons de desconto (grupos 24 e 25). Migration `20261108000700_coupons.sql` | Usuário |
| 09/11/2026 | Técnica | Códigos de cupom não são legíveis pela API pública; a validação roda só com service role, chamada por ação com limite de 30 tentativas a cada 10 min por IP (evita descobrir códigos por força bruta) | Engenharia |
| 09/11/2026 | Técnica | Desconto só sobre os produtos; frete grátis avaliado sobre o valor com desconto; pedido nunca abaixo de R$ 1,00 em produtos. Usos contam pedidos não cancelados nem expirados | Engenharia |
| 09/11/2026 | D18 | Fase 11 autorizada pelo usuário: documentação final (ARCHITECTURE, COST_ESTIMATE, README). Sem migrations. **Publicação não autorizada**: o projeto segue só local | Usuário |
| 09/11/2026 | Técnica | Removidas dependências sem uso (`@tanstack/react-query`, `msw`) e pastas vazias das rotas antigas de checkout. As telas Clientes, Relatórios e Configurações dizem que estão fora desta versão (antes citavam fases já concluídas) | Engenharia |
| 09/11/2026 | Técnica | Pedido do usuário: o login da loja leva conta de administrador direto para `/admin` (papel conferido no banco); sem link público para o painel. "Minha conta" mostra um atalho ao painel só para administradores | Usuário / Engenharia |
| 09/11/2026 | Correção | Avisos do `next dev` ("uncached data during prerendering or a navigation") no painel e na conta: faltava um `loading.tsx` em cada seção (na navegação, o bloco de carregamento do layout compartilhado não conta). Imagem principal com `loading="eager"` + `fetchPriority="high"` (`priority` foi descontinuado no Next 16); miniaturas com qualidade 60 | Engenharia |
