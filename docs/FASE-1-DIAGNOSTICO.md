# Sally Perfumaria — Fase 1: Diagnóstico, engenharia reversa e proposta técnica

Data da pesquisa: 08/11/2026. Nenhuma alteração estrutural, instalação de dependência ou operação remota foi feita nesta fase.

---

## 1. Inventário do projeto

| Item | Estado real encontrado |
|---|---|
| Arquivos de código | **Nenhum.** O diretório contém apenas `.git/`. |
| README / CLAUDE.md / AGENTS.md | Inexistentes. |
| package.json / lockfile | Inexistentes. |
| Git | Repositório inicializado na branch `main`, **sem nenhum commit**. Remote `origin` = `https://github.com/leonarLon/sally-perfum.git`, que também está **vazio** (`git ls-remote` sem refs). |
| Testes | Nenhum. |
| Ferramentas na máquina | Node v24.22.1, npm 11.19.1, git 2.44. **Ausentes:** pnpm, Supabase CLI, Docker. |

**Conclusão:** é um projeto greenfield. Não há padrões a preservar nem funcionalidades a migrar.

**Risco imediato:** o Supabase local (`supabase start`) depende de Docker, que não está instalado. As opções estão na seção 18 (decisão D2).

---

## 2. Engenharia reversa das referências

### 2.1. O que foi efetivamente acessado

| Referência | Acesso | O que foi verificado |
|---|---|---|
| Sephora Brasil | ✅ Listagem `/perfumes/` | Cards, preços, parcelamento, selos, paginação, conteúdo SEO |
| Época Cosméticos | ✅ Home e página de produto (La Vie Est Belle) | Menu, facetas, PDP completa, confiança, FAQ |
| O Boticário | ⚠️ Somente a home (a página de categoria bloqueou bots) | Cards da home, selos, vantagens, retirada na loja |
| Notino (UK) | ⚠️ Somente uma página de acessório e o menu | Menu, serviços, comportamento de produto esgotado |
| Beleza na Web | ❌ Bloqueado (bot_blocked / timeout) | — |
| FragranceNet | ❌ Bloqueado (403 / bot_blocked) | — |
| Sephora internacional | ❌ Bloqueado (bot_blocked) | — |

Os itens marcados com ❌ não foram analisados. **Nenhuma funcionalidade desses sites é descrita abaixo**, para não apresentar suposição como fato. Se quiser incluí-los, a análise pode ser feita manualmente, por navegador, numa etapa futura.

### 2.2. Matriz de referências (somente elementos observados)

| Referência | Elementos positivos | Funcionalidades relevantes | Oportunidades para a Sally |
|---|---|---|---|
| **Sephora BR** | Marca acima do nome no card; preço "a partir de" quando há várias variantes; parcelamento "ou 10x de R$ X" exibido no card; % de desconto em destaque | Selos "SÓ NA SEPHORA", "NOVIDADE!", "Produto Patrocinado", "Indisponível"; contador "(N opções)"; "15 produtos de 1826" + botão "ver mais"; bloco educativo de SEO abaixo da listagem (concentrações, notas de topo/corpo/fundo, famílias olfativas) | Mesma hierarquia no card; guia olfativo próprio como conteúdo de SEO e também como fonte do RAG |
| **Época Cosméticos** | PDP com seletor de volume, cada variante com preço, desconto e disponibilidade próprios; preço no Pix separado do preço no cartão; pirâmide olfativa (topo/coração/fundo) e família olfativa na descrição; FAQ dentro da PDP ("é muito doce?", "serve para o trabalho?") | Facetas por família olfativa (Chipre, Floral, Oriental, Gourmand…) e por concentração; "+ Brinde" (amostra); "Vendido e entregue por" com CNPJ; EAN por variante; FAQ de autenticidade (lote, ANVISA, selo de importação); sacola vazia com CTA; página de cupons; clube de fidelidade | Variantes como SKU independente (confirma a decisão da seção 6); desconto no Pix; FAQ na PDP alimentada pelo RAG; bloco de autenticidade e confiança |
| **O Boticário** | Card com nota de avaliação, preço "de/por", parcelas e uma frase curta de descrição; botão "Adicionar à sacola" direto no card | Selos "MENOR PREÇO NO APP", "RETIRE EM ATÉ 3HRS", "Frete Grátis"; kits e combos; conteúdo "Qual a diferença entre as fragrâncias de Clash? Compare"; desconto de primeira compra; compra por WhatsApp; retirada na loja | Compra rápida pelo card; comparador de fragrâncias (feito pelo Consultor de IA); kits para presente |
| **Notino** | "Help Me Choose → Fragrance Finder"; "Discovery Box" de amostras; embrulho para presente e gravação | Produto esgotado com "Get notified when available" e "Alternatives"; código do produto visível | "Avise-me quando chegar" e alternativas para produto esgotado, sugeridas pela IA com base no catálogo |

### 2.3. Padrões que serão reutilizados
- Card: imagem → marca → nome → volume / "N opções" → preço "de/por" → parcelas → selo de desconto → botão de adicionar.
- PDP: galeria, seletor de volume por variante, preço no Pix e no cartão, pirâmide olfativa, FAQ, produtos relacionados e bloco de autenticidade.
- Facetas: família olfativa, concentração, gênero, marca, volume, faixa de preço e disponibilidade.
- Paginação com "ver mais" e contador de resultados, sempre com URL paginável para SEO.
- Esgotado: "avise-me" e alternativas.

### 2.4. Padrões que **não** serão adotados
- "Produto Patrocinado" misturado na listagem orgânica, porque reduz a confiança.
- Banners promocionais em excesso e selos com emoji ("🔥", "🚨"), que destoam de uma identidade sofisticada.
- Preço "menor no app": a Sally não terá app nativo nesta fase.

### 2.5. Diferenciais da Sally
1. **Consultor de Fragrâncias Sally:** um "Fragrance Finder" conversacional, baseado somente no catálogo real.
2. **Honestidade de dados:** quando uma nota olfativa não foi confirmada por fonte confiável, a loja informa isso em vez de inventar.
3. **Comparador de fragrâncias** gerado a partir dos dados do catálogo.
4. **Modo presente:** recomendações por perfil de quem vai receber o perfume, com embalagem para presente como opção futura.
5. **Avise-me + alternativas** para produtos esgotados.

---

## 3. Identidade visual e design tokens

Proposta: rosa profundo como cor de ação, branco predominante e neutros com leve tom ameixa. Os contrastes abaixo foram calculados contra o branco, e a meta é WCAG AA.

| Token | Valor | Uso | Contraste em #FFF |
|---|---|---|---|
| `primary` | `#B0306A` | Botões, links, foco | ≈ 6,0 : 1 ✅ |
| `primary-hover` | `#8E2253` | Hover / ativo | > 8 : 1 |
| `secondary` | `#F8D7E3` | Faixas, chips, fundo de destaque | decorativo |
| `background` | `#FFFFFF` | Fundo predominante | — |
| `surface` | `#FFF7FA` | Cards, painéis | — |
| `text` | `#2B1D24` | Texto principal | > 14 : 1 |
| `muted` | `#6E5A64` | Texto secundário | ≈ 6,4 : 1 ✅ |
| `border` | `#EBDDE3` | Divisórias | decorativo |
| `success` | `#1E7F4F` | Em estoque, aprovado | AA |
| `warning` | `#A15C00` | Estoque baixo, pendente | AA |
| `error` | `#B3261E` | Erros, recusado | AA |

- **Tipografia:** Cormorant Garamond (títulos) + Inter (texto e interface), ambas com licença OFL, carregadas via `next/font`.
- **Espaçamento:** escala de 4 px; raio de 12 px em cards e de 999 px em chips.
- **Movimento:** transições curtas, respeitando `prefers-reduced-motion`.
- Os tokens ficam em CSS variables e são consumidos pelo Tailwind e pelo shadcn/ui. **Nenhum componente usa cor literal.**

---

## 4. Arquitetura recomendada

| Camada | Escolha | Justificativa |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | SSR/ISR para SEO de catálogo; Route Handlers e Server Actions como backend; um único deploy |
| UI | Tailwind CSS + shadcn/ui | Design system com tokens; componentes acessíveis (Radix) |
| Dados | **Supabase:** Postgres, Auth, Storage, RLS e pgvector | Fonte única de verdade; RLS como segunda barreira; vetores no mesmo banco |
| Estado no cliente | TanStack Query | Cache, invalidação e update otimista com rollback (carrinho e favoritos) |
| Validação | Zod (compartilhado entre cliente e servidor) | Os mesmos schemas validam formulários e APIs |
| Hospedagem | Vercel **Pro** | O plano Hobby proíbe uso comercial (consta no FAQ da Vercel) |
| Testes | Vitest + MSW + Playwright + axe-core + Lighthouse CI | Ver seção 14 |

**Estrutura:** `app/(loja)/…`, `app/admin/…` (layout próprio), `app/api/…` (webhooks e APIs), `lib/domain/*` (regras de catálogo, carrinho, estoque, pedido e pagamento, independentes de framework), `lib/payments/` (adapter por gateway), `lib/ai/` (consultor e RAG), `supabase/migrations/`, `supabase/seed/`.

**Cache e sincronização:** as páginas de catálogo usam ISR com `revalidateTag('product:<id>')` e `revalidateTag('catalog')`, disparados pelas mutações do admin. Preço e estoque são sempre lidos no servidor no carrinho e no checkout, sem cache.

As rotas da loja e do admin seguem exatamente as listas das seções 4.1 e 4.2 do briefing, mais `/pedido/[token]` para o acompanhamento de pedidos de visitante.

---

## 5. Modelo de dados (proposta para revisão)

Valores monetários são guardados como `integer` em **centavos**. As chaves são `uuid`. Todas as tabelas têm `created_at` / `updated_at`.

| Tabela | Campos principais | Observações |
|---|---|---|
| `profiles` | id (= auth.users), full_name, phone, marketing_opt_in | RLS: só o próprio usuário |
| `user_roles` | user_id, role (`customer`/`admin`/`owner`) | **Somente o service role escreve.** A função `has_role()` é `security definer` |
| `addresses` | user_id, recipient, cep, street, number, complement, district, city, uf, is_default | RLS por dono |
| `brands`, `categories` | name, slug (unique), is_active | Leitura pública |
| `products` | brand_id, category_id, name, slug (unique), short_description, description, gender, concentration, olfactory_family, top/heart/base_notes (`text[]`), origin, manufacturer, status (`draft`/`published`/`archived`), featured, data_verification (jsonb: fonte por campo) | Os campos olfativos são opcionais |
| `product_variants` | product_id, sku (**unique, estável**), barcode, volume_ml, price_cents, compare_at_cents, weight_g, dimensions, is_active | **Cada volume é um SKU** |
| `product_images` | product_id, storage_path, alt, position, is_primary, source, license_note | Índice único parcial: uma imagem principal por produto |
| `inventory` | variant_id (PK), on_hand, reserved, min_stock, is_demo_quantity | `CHECK (reserved <= on_hand AND on_hand >= 0)` |
| `inventory_movements` | variant_id, type (in/adjust/reserve/release/sale/return), qty, reason, actor_id, order_id | Somente inserção (auditoria) |
| `inventory_reservations` | variant_id, cart/order_id, qty, expires_at, status | Liberadas pelo `pg_cron` |
| `carts`, `cart_items` | cart: user_id **ou** guest_token_hash; item: variant_id, qty | `UNIQUE(cart_id, variant_id)` impede itens duplicados no merge |
| `favorites` | user_id, product_id | PK composta |
| `coupons`, `coupon_redemptions` | code, type, value, min_subtotal, starts/ends_at, max_uses, per_user_limit | Validados no servidor |
| `shipping_methods` | name, rule (tabela fixa/faixa de CEP), price_cents, eta | A cotação por API fica para uma decisão posterior (D7) |
| `orders` | number (sequencial, **não é credencial**), user_id nulo, email, guest_access_token_hash, status, subtotal/discount/shipping/total_cents, idempotency_key | Snapshot imutável |
| `order_items` | order_id, variant_id, **snapshot**: product_name, brand, volume, sku, unit_price_cents, qty | Não usa FK para leitura de preço |
| `order_addresses` | snapshot do endereço | |
| `payments` | order_id, provider, provider_payment_id (unique), method, status, amount_cents | Status: pending → processing → approved/rejected/canceled/refunded/partially_refunded |
| `payment_events` | provider, provider_event_id (**unique**), payload, signature_valid, processed_at | Idempotência do webhook |
| `idempotency_keys` | key, scope, request_hash, response, status | Mesma chave e payload diferente → 409 |
| `knowledge_documents`, `document_chunks` | source_type (product/policy/guide/faq), source_id, content_hash, chunk text, `embedding vector`, metadata | Índice HNSW; reindexa só quando o `content_hash` muda |
| `ai_conversations`, `ai_messages` | session/user, role, content, tool_calls, cited_sources | Retenção curta (LGPD) |
| `audit_logs` | actor_id, action, entity, before/after | Toda ação administrativa |
| `reviews` | **Fora do escopo inicial** | Só faz sentido depois de haver compras reais; avaliações falsas são proibidas |

**RLS:** catálogo publicado tem leitura anônima. Escrita no catálogo exige `has_role('admin')`. Pedidos, endereços, carrinhos e favoritos são acessíveis apenas pelo dono. Visitantes nunca leem tabelas diretamente: o acesso passa por Route Handlers, que validam o token.

**Imagens:** bucket `product-images`, com leitura pública e escrita somente pelo servidor. O upload passa por um Route Handler admin que valida magic bytes, MIME, extensão, tamanho (≤ 5 MB), dimensões (≥ 800 px) e quantidade (≤ 8), e depois gera WebP. No banco fica apenas o `storage_path`.

---

## 6. Variantes de volume: decisão

**Cada volume é uma `product_variant` com SKU, preço e estoque próprios.** O `product` agrupa conteúdo (nome, notas, imagens).

**Motivo:** o estoque e o preço são diferentes por volume. O carrinho e o pedido referenciam a variante, o snapshot do pedido registra o volume e o SKU estável torna o seed idempotente. Esse é o padrão observado na Época (EAN por volume).

---

## 7. Autenticação e sessão

- Supabase Auth via `@supabase/ssr`: a sessão fica em **cookies httpOnly, Secure e SameSite=Lax**, sem token em `localStorage`. O refresh é feito no middleware.
- **Cliente:** cadastro, login, logout, recuperação de senha (link por e-mail) e verificação de e-mail.
- **Admin:** a mesma base de identidade, mas com papel em `user_roles` gravado só pelo service role. O primeiro `owner` é criado por um script local controlado. O papel **nunca** vem do JWT editável pelo usuário nem de `user_metadata`.
- **Proteção em três camadas:** (1) o middleware redireciona `/admin/*` sem papel; (2) cada Server Action ou Route Handler admin chama `requireRole('admin')`; (3) a RLS no banco. A camada 1 é apenas UX; a segurança real está nas camadas 2 e 3.
- **Sessão expirada:** os erros 401 são interceptados e o usuário é mandado para o login com `returnTo`.
- **CSRF:** Server Actions já verificam Origin. Os Route Handlers mutáveis verificam Origin/Host. O cookie SameSite=Lax reforça a proteção.
- **Brute force:** rate limit por IP + e-mail no login, na recuperação de senha, no checkout e no consultor, além do rate limit nativo do Supabase Auth.

---

## 8. Checkout como visitante

1. O carrinho de visitante é identificado por um cookie httpOnly com token aleatório (o banco guarda só o hash).
2. No checkout, o visitante informa e-mail, telefone e endereço. **Não há cadastro obrigatório.**
3. O servidor recalcula preço, estoque, cupom e frete. Se algo mudou, devolve a diferença e pede nova confirmação.
4. O pedido é criado com uma `Idempotency-Key` gerada pelo cliente por tentativa de checkout.
5. O estoque é reservado de forma transacional (seção 10), por 30 minutos (valor a confirmar).
6. O cliente é redirecionado ao checkout hospedado do gateway.
7. A página `/checkout/sucesso` **apenas consulta** o status. A confirmação vem do webhook validado.
8. É gerado um token de 256 bits, enviado por e-mail no link `/pedido/<token>`. O banco guarda só o hash SHA-256. **O número do pedido nunca dá acesso a nada.**
9. Merge após login: soma as quantidades por variante, limitadas ao estoque disponível, sem duplicar itens (`UNIQUE`) e informando ajustes ao cliente.

---

## 9. Painel administrativo

O painel tem layout próprio, com sidebar de ícones (lucide): Dashboard, Produtos, Estoque, Pedidos, Categorias, Marcas, Cupons, Clientes, Relatórios e Configurações.

- **Produtos:** formulário com variantes inline, upload com preview, reordenação por drag and drop e imagem principal; rascunho, publicação e arquivamento (soft delete, para preservar o histórico dos pedidos).
- **Estoque:** tabela editável por SKU com entrada, ajuste e motivo; filtro "estoque baixo"; selo **"quantidade de demonstração"** até o proprietário confirmar os números; botão "confirmar estoque real".
- **Revisão comercial:** fila de produtos do seed com preço de referência não confirmado.
- Toda mutação grava em `audit_logs` e chama `revalidateTag`.

---

## 10. Estoque e integridade

- **Reserva atômica** via função Postgres:
  ```sql
  UPDATE inventory SET reserved = reserved + $qty
  WHERE variant_id = $id AND on_hand - reserved >= $qty
  RETURNING ...
  ```
  Se nenhuma linha for afetada, o resultado é "indisponível". Isso evita vender a mesma última unidade duas vezes sem depender de uma leitura prévia.
- **Pagamento aprovado:** dentro de uma transação, `on_hand -= qty`, `reserved -= qty`, movimento `sale` e reserva marcada como consumida.
- **Expiração:** um job do `pg_cron` libera as reservas vencidas a cada minuto. Pagamento aprovado depois da expiração tenta a baixa direta; se falhar, o pedido vai para "exceção", com alerta ao admin e estorno.
- **Cancelamento ou estorno:** movimento `return`, conforme a regra do status do pedido.
- Teste de concorrência: N requisições paralelas disputando a última unidade, e só uma pode vencer.

---

## 11. Pagamentos

### 11.1. Comparação (taxas pesquisadas em 08/11/2026, **a confirmar com cada gateway antes de contratar**)

| Gateway | Pix | Cartão de crédito | Checkout hospedado | Fonte e confiabilidade |
|---|---|---|---|---|
| **Mercado Pago** | 0,99% | 3,98% a 4,98% conforme o prazo de recebimento; sem mensalidade | Sim (Checkout Pro: cartão, Pix, saldo MP, boleto) | Página oficial de checkout do MP, via busca. A página de custos retornou 403 |
| **Stripe BR** | 1,19% (**somente por convite**) | 3,99% + R$ 0,39 (nacional) | Sim (Checkout) | Calculadora de terceiros (Sellfy), que cita a página da Stripe de 12/10/2026. Não verificado na fonte |
| **Pagar.me** | Não encontrado | 3,99% + R$ 0,40 (plano básico) | Sim | Blog da Shopify, sem data. **Baixa confiabilidade** |
| **Asaas** | Valor não encontrado | Valor não encontrado | Sim | Não foi possível verificar |

### 11.2. Recomendação
**Mercado Pago Checkout Pro** como primeiro adapter. Motivos: Pix com a menor taxa verificada, checkout hospedado (o PCI fica com o gateway e a Sally não toca em dados de cartão), suporte a compra de visitante, webhooks e API de estornos.

A camada `PaymentProvider` (createCheckout, parseWebhook, verifySignature, getPayment, refund) permite trocar ou adicionar gateways sem mexer no domínio.

**Webhook:** verifica a assinatura (HMAC do MP), deduplica por `provider_event_id` único, **reconsulta o pagamento na API** em vez de confiar no corpo, aplica a transição de estado com `SELECT … FOR UPDATE` no pedido e registra o evento. Um job de reconciliação revisa pagamentos `pending` há mais de X minutos.

**Não haverá credenciais, sandbox ou cobranças sem a sua autorização.** Até lá, o adapter roda com um provider *fake* nos testes (MSW).

---

## 12. LLM e RAG

### 12.1. Consultor de Fragrâncias Sally
- **Provedor:** Claude, via SDK oficial `@anthropic-ai/sdk`. Modelo padrão proposto: **`claude-opus-5-5`** (US$ 4 / US$ 20 por milhão de tokens de entrada/saída). Alternativa de menor custo: `claude-haiku-5-5` (US$ 0,10 / US$ 0,50). **A escolha final é sua (D4)**; a seção 15 mostra o impacto no custo.
- **Ferramentas (tool use), somente leitura:** `search_catalog(filtros: família, gênero, faixa de preço, ocasião, notas, disponibilidade)`, `get_product(slug)`, `compare_products(slugs)`, `search_knowledge(query)` (RAG de políticas e guia) e `propose_cart_items(variant_ids)`. Esta última **apenas devolve uma proposta**: o cliente clica em "Adicionar" e o carrinho usa a API normal.
- Os cards de recomendação são montados pelo servidor a partir dos IDs retornados pelas ferramentas. **Preço, volume e estoque nunca saem do texto gerado pela IA**; vêm sempre do banco.
- **Validação de saída:** qualquer produto citado precisa estar entre os resultados das ferramentas daquela conversa; caso contrário, é removido.

### 12.2. IA no admin
A IA gera sugestões de descrição, título e organização de notas, além de resumos de vendas e de estoque baixo. Tudo aparece como **rascunho**, que o proprietário aceita ou recusa. A IA não tem nenhuma ferramenta de escrita.

### 12.3. Pipeline RAG
- **Fontes:** produtos (gerados do banco), políticas (entrega, troca, devolução, privacidade), FAQ e guia olfativo próprio. As fontes ficam em `knowledge_documents`.
- **Etapas:** normalização, chunking (~500 tokens), `content_hash`, embedding **somente quando o hash muda**, armazenamento em pgvector (HNSW), busca híbrida (vetor + filtro por metadata + full-text em português), top-k, contexto com IDs de fonte e citações.
- **Embeddings:** Voyage AI (parceiro recomendado pela Anthropic). `voyage-4-lite` custa US$ 0,02 e `voyage-4` US$ 0,06 por milhão de tokens, com 200 milhões de tokens gratuitos (página oficial). **Falta validar a qualidade em português** com um conjunto de teste antes de fixar o modelo.
- **Atualização:** salvar um produto no admin enfileira a reindexação. Arquivar o produto remove os chunks do índice.
- **Prompt injection:** conteúdo recuperado entra delimitado como *dados*, nunca como instrução; o system prompt diz isso explicitamente; não existem ferramentas de escrita; a saída é validada; há testes com documentos maliciosos.
- **Informação insuficiente:** a IA responde "não tenho essa informação confirmada" e não inventa.
- **Privacidade:** nenhum dado pessoal vai para o LLM (sem nome, e-mail ou endereço), apenas preferências da conversa.

---

## 13. Plano de segurança (resumo)

| Ameaça | Controle |
|---|---|
| Escalonamento de privilégio | Papel só em `user_roles` (gravado pelo service role) + RLS + `requireRole` no servidor |
| IDOR em pedidos | RLS por `user_id`; visitante só acessa com token de 256 bits (hash no banco) |
| Adulteração de preço | O servidor ignora valores do cliente e recalcula tudo a partir do banco |
| Overselling | Reserva atômica + constraints `CHECK` |
| Webhook forjado ou duplicado | HMAC + reconsulta à API + `UNIQUE(provider_event_id)` |
| Upload malicioso | Magic bytes, reencode para WebP, limites, bucket sem execução |
| XSS | React escapa por padrão; descrições sanitizadas (allowlist); CSP com nonce |
| Vazamento de segredos | Service role e chaves de LLM e gateway só no servidor (`server-only`); teste que procura segredos no bundle |
| Brute force e abuso de IA | Rate limit por IP/usuário; limite de tokens por conversa |
| LGPD | Minimização de dados, política de privacidade, banner de cookies (só cookies essenciais até haver consentimento), exportação e exclusão de conta, retenção de conversas de IA por 30 dias (proposta) |

Detalhes no futuro `SECURITY.md`.

---

## 14. Plano de testes

| Nível | Ferramenta | Cobre os grupos do briefing |
|---|---|---|
| Unitário | Vitest | Cálculos em centavos, cupons, merge de carrinho, transições de status, validação de upload, idempotência, filtro anti-alucinação da IA |
| Integração / banco | Vitest + Postgres de teste com migrations aplicadas | RLS (cliente × admin × anônimo), concorrência de estoque, webhooks duplicados, seed executado 2×, reindexação do RAG |
| Componentes e API | Vitest + MSW | Gateway fake, LLM fake determinístico (fixtures de respostas e tool calls), imagens indisponíveis |
| E2E | Playwright (desktop + mobile) | Compra como visitante, compra autenticada, admin cria produto e ele aparece na loja, cliente bloqueado no admin, carrinho otimista com rollback |
| A11y | axe-core no Playwright | Todas as páginas principais |
| Performance | Lighthouse CI, 5 execuções, mediana | Início, catálogo, PDP, carrinho e checkout, em desktop e mobile |

Os 50 grupos e os 19 testes de segurança do briefing serão rastreados numa tabela grupo → arquivo de teste. **A suíte não chama serviços pagos.** Os testes de integração com banco precisam de Postgres local, o que depende da decisão D2.

---

## 15. Estimativa de custos (mensal, em USD, pesquisada em 08/11/2026)

**Infraestrutura fixa**

| Item | Plano | Custo | Fonte |
|---|---|---|---|
| Hospedagem | Vercel Pro | US$ 20/mês (inclui US$ 20 de crédito de uso) | vercel.com/pricing |
| Banco, Auth e Storage | Supabase Pro | US$ 25/mês (8 GB de banco, 100 GB de storage, 100 mil MAU, US$ 10 de crédito de compute = 1 instância Micro) | supabase.com/pricing |
| E-mail transacional | Resend | Free: 3 mil e-mails/mês (100/dia). Pro: ~US$ 20/mês para 50 mil | Fontes de terceiros; não confirmado na página oficial |
| Monitoramento | Sentry, plano gratuito (proposta) | **Preço não pesquisado** | — |

O plano Free do Supabase pausa projetos após uma semana sem atividade, o que o torna inadequado para produção.

**Variáveis**, assumindo que cada cliente faz 1 conversa de 4 turnos por mês com o consultor, com ~6 mil tokens de entrada e ~800 de saída por turno:

| Clientes/mês | Opus 5.5 (~US$ 0,04/turno) | Haiku 5.5 (~US$ 0,001/turno) | Infra fixa |
|---|---|---|---|
| 100 | ~US$ 16 | ~US$ 0,40 | ~US$ 45 |
| 500 | ~US$ 80 | ~US$ 2 | ~US$ 45 |
| 1.000 | ~US$ 160 | ~US$ 4 | ~US$ 45 a 65 |
| 5.000 | ~US$ 800 | ~US$ 20 | ~US$ 65 + excedentes |

- O prompt caching do system prompt e das ferramentas reduz o custo de entrada. Os valores acima são o teto.
- Embeddings: um catálogo de 40 a 1.000 produtos fica bem dentro dos 200 milhões de tokens gratuitos da Voyage.
- Pagamentos são percentuais sobre a venda (ex.: MP Pix 0,99%; cartão de 3,98% a 4,98%).
- **Desenvolvimento:** o esforço estimado é de 45 a 70 dias-pessoa para as 11 fases. Não informo valor em reais porque depende da taxa/hora, que não foi definida.

---

## 16. Plano de execução por fases

Seguem as 11 fases do briefing, em ordem. Só há ação externa nas fases 4 (carga remota), 8 (gateway), 9 (chave de LLM) e 11 (deploy), e cada uma pede aprovação. Ao fim de cada fase entrego arquivos, decisões, testes executados com resultados reais e pendências.

---

## 17. Lista inicial de produtos (42 candidatos para garantir 40)

**Status de todos: PROPOSTO.** Nenhum foi cadastrado no banco ou publicado.

- "Observado" indica que o produto foi visto numa loja durante esta pesquisa (08/11/2026). Os preços observados são **referência de varejo**, não preço da Sally.
- Notas olfativas, concentrações e volumes dos itens "a verificar" **serão conferidos na fonte oficial do fabricante na Fase 4**. Nada será preenchido de memória.
- Preços entre parênteses são promocionais, observados no mesmo dia.

| # | Produto | Marca | Categoria | Origem | Status de verificação e fonte |
|---|---|---|---|---|---|
| 1 | La Vie Est Belle Eau de Parfum | Lancôme | Feminino | Importado | **Observado** (Época): família Floral Gourmand; notas topo/coração/fundo listadas; volumes 10/30/50/75/100/150 ml; preço por volume a mapear |
| 2 | Good Girl Eau de Parfum | Carolina Herrera | Feminino | Importado | Observado como kit (Sephora BR); frasco avulso a verificar |
| 3 | Paradoxe Eau de Parfum | Prada | Feminino | Importado | **Observado** (Sephora BR): "a partir de R$ 548,26" |
| 4 | Chloé Eau de Parfum | Chloé | Feminino | Importado | **Observado** (Sephora BR): "a partir de R$ 383,00" |
| 5 | Idôle | Lancôme | Feminino | Importado | Observado como kit (Sephora BR); avulso a verificar |
| 6 | Libre Eau de Parfum | Yves Saint Laurent | Feminino | Importado | A verificar |
| 7 | Black Opium Eau de Parfum | Yves Saint Laurent | Feminino | Importado | A verificar |
| 8 | Coco Mademoiselle Eau de Parfum | Chanel | Feminino | Importado | A verificar |
| 9 | J'adore Eau de Parfum | Dior | Feminino | Importado | A verificar |
| 10 | Sì Eau de Parfum | Giorgio Armani | Feminino | Importado | A verificar |
| 11 | Olympéa Eau de Parfum | Rabanne | Feminino | Importado | A verificar |
| 12 | Light Blue Eau de Toilette | Dolce&Gabbana | Feminino | Importado | A verificar |
| 13 | Her Eau de Parfum | Burberry | Feminino | Importado | A verificar (marca observada na Sephora BR) |
| 14 | Daisy Eau de Toilette | Marc Jacobs | Feminino | Importado | A verificar |
| 15 | Sauvage Eau de Toilette | Dior | Masculino | Importado | A verificar |
| 16 | Bleu de Chanel Eau de Parfum | Chanel | Masculino | Importado | A verificar |
| 17 | 1 Million Eau de Toilette | Rabanne | Masculino | Importado | A verificar |
| 18 | Invictus Eau de Toilette | Rabanne | Masculino | Importado | A verificar |
| 19 | Acqua di Giò Eau de Toilette | Giorgio Armani | Masculino | Importado | A verificar |
| 20 | Wanted Eau de Toilette | Azzaro | Masculino | Importado | A verificar (marca observada na Sephora BR) |
| 21 | Le Male Eau de Toilette | Jean Paul Gaultier | Masculino | Importado | A verificar |
| 22 | Explorer Eau de Parfum | Montblanc | Masculino | Importado | A verificar (marca observada na Sephora BR) |
| 23 | Eros Eau de Toilette | Versace | Masculino | Importado | A verificar |
| 24 | 212 VIP Men Eau de Toilette | Carolina Herrera | Masculino | Importado | A verificar |
| 25 | CK One Eau de Toilette | Calvin Klein | Unissex | Importado | A verificar |
| 26 | Wood Sage & Sea Salt Cologne | Jo Malone London | Unissex | Importado | A verificar |
| 27 | Replica By the Fireplace Eau de Toilette | Maison Margiela | Unissex | Importado | A verificar |
| 28 | Khamrah Eau de Parfum | Lattafa | Unissex | Importado (árabe) | A verificar |
| 29 | Cheirosa 62 Perfume Mist | Sol de Janeiro | Body mist | Importado | A verificar (marca observada na Sephora BR) |
| 30 | Floratta Flores Secretas Desodorante Colônia 75 ml | O Boticário | Feminino | Nacional | **Observado** (Boticário): R$ 174,90 (R$ 103,90) |
| 31 | Floratta Red Passion Eau de Parfum 75 ml | O Boticário | Feminino | Nacional | **Observado**: R$ 229,90 (R$ 186,90) |
| 32 | Liz Flora Desodorante Colônia 100 ml | O Boticário | Feminino | Nacional | **Observado**: R$ 179,90 (R$ 88,90); descrito como "Amadeirado Floral" |
| 33 | Egeo Choc Desodorante Colônia 90 ml | O Boticário | Feminino | Nacional | **Observado**: R$ 164,90 (R$ 99,90) |
| 34 | Lily L'Or Elixir Eau de Parfum 75 ml | O Boticário | Feminino | Nacional | **Observado**: R$ 369,90 (R$ 329,90) |
| 35 | Her Code Eau de Parfum 50 ml | O Boticário | Feminino | Nacional | **Observado**: R$ 254,90 (R$ 208,90) |
| 36 | Malbec Black Desodorante Colônia 100 ml | O Boticário | Masculino | Nacional | **Observado**: R$ 259,90 (R$ 206,90) |
| 37 | Quasar Blue Desodorante Colônia 100 ml | O Boticário | Masculino | Nacional | **Observado**: R$ 189,90 (R$ 92,90); descrito como "fougère" |
| 38 | Uomini Spirit Desodorante Colônia 100 ml | O Boticário | Masculino | Nacional | **Observado**: R$ 209,90 (R$ 103,90) |
| 39 | Kaiak Masculino Desodorante Colônia | Natura | Masculino | Nacional | A verificar |
| 40 | Essencial Exclusivo Feminino Deo Parfum | Natura | Feminino | Nacional | A verificar |
| 41 | Luna Deo Parfum | Natura | Feminino | Nacional | A verificar |
| 42 | Humor Desodorante Colônia | Natura | Unissex | Nacional | A verificar (reserva) |

Os SKUs terão formato estável, por exemplo `SLY-LAN-LVEB-EDP-050`, e serão gerados na Fase 4.

**Fontes das informações (Fase 4):** site oficial de cada marca. Lojas de varejo servem somente para o preço de referência, sempre com URL e data.

**Imagens: risco principal.** As fotos de fabricantes e varejistas são protegidas por direito autoral. Não é seguro usá-las sem autorização. Opções em ordem de preferência:
1. Fotos tiradas pelo proprietário do estoque real.
2. Kit de imprensa ou autorização do distribuidor.
3. Placeholder elegante, claramente identificado como "foto em breve".

Ver decisão D5. Nenhuma imagem de terceiro será usada sem autorização documentada.

**Marcas de venda direta (Boticário e Natura):** a revenda desses produtos precisa estar de acordo com a forma como a Sally os adquire (revendedor cadastrado, por exemplo). Confirme se a Sally pode comercializá-los; se não puder, substituo por importados (D6).

---

## 18. Decisões que dependem da sua aprovação

| # | Decisão | Recomendação |
|---|---|---|
| D1 | Stack: Next.js + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel Pro | Aprovar |
| D2 | Ambiente de banco para desenvolvimento e testes. Docker não está instalado, então o Supabase local não roda | (a) Você instala o Docker Desktop e eu uso o Supabase CLI local — **recomendado**; ou (b) um projeto Supabase separado só para dev, o que exige criar o projeto e me passar as credenciais |
| D3 | Gateway de pagamento | Mercado Pago Checkout Pro como primeiro adapter, confirmando as taxas com o MP |
| D4 | Modelo de LLM do consultor | `claude-opus-5-5` (qualidade) ou `claude-haiku-5-5` (cerca de 40× mais barato); ver seção 15. Embeddings: Voyage |
| D5 | Fonte das fotos dos produtos | Fotos próprias ou autorização do distribuidor; placeholder enquanto isso |
| D6 | Aprovação da lista de produtos; confirmar se Boticário e Natura podem ser revendidos | — |
| D7 | Frete: tabela fixa por região no MVP, ou integração com uma cotação (ex.: Melhor Envio) em fase posterior | Tabela fixa no MVP |
| D8 | Dados do negócio: CNPJ, endereço, políticas de troca e devolução, domínio, e-mail remetente | Necessários para as páginas legais e para o RAG |
| D9 | Git: posso fazer commits locais por fase? Push para `origin`, só com sua autorização | Commits locais por fase; push quando você autorizar |

Depois da sua resposta, começo a **Fase 2** (scaffold Next.js, design system, layouts, rotas e configuração de testes), que é toda local e não tem custo.
