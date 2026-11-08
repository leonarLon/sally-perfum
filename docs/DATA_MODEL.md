# Modelo de dados — Sally Perfumaria

Banco: Supabase (Postgres 17). As migrations ficam em `supabase/migrations/` e são testadas localmente em PGlite (`tests/db/`).
Valores monetários: **inteiros em centavos**. Chaves: `uuid` (`gen_random_uuid()`).

> Situação: as migrations do catálogo estão **preparadas e testadas localmente**, mas **ainda não foram aplicadas** no Supabase remoto. Carrinho, pedidos, pagamentos, endereços e favoritos entram nas Fases 6 a 8.

## Diagrama (catálogo)

```
auth.users ─┬─< user_roles (admin | owner)
            └─< inventory_movements.actor_id

brands ─┐
        ├─< products ─┬─< product_variants ── inventory (1:1) ─< inventory_movements
categories ┘          └─< product_images
```

## Tabelas

### `user_roles`: RBAC
| Campo | Tipo | Regras |
|---|---|---|
| user_id | uuid | FK `auth.users`, on delete cascade |
| role | text | `admin` \| `owner` (customer = sem linha) |
| PK | (user_id, role) | |

Somente o **service role** grava (sem policy de escrita; `insert/update/delete` revogados de `authenticated`). O cliente lê apenas os próprios papéis. A função `has_role(r)` (`security definer`, `search_path = ''`) considera que `owner` engloba `admin`.

### `brands`, `categories`
`name`, `slug` (único, kebab-case validado por CHECK), `is_active`. Categorias têm `position` e `description`.

### `products`: conteúdo
| Campo | Observações |
|---|---|
| seed_key | Único; identificador estável da carga inicial (idempotência) |
| brand_id, category_id | FKs obrigatórias |
| name, slug | Slug único (URL) |
| short_description (≤ 280), description | Textos próprios |
| gender | `feminino` \| `masculino` \| `unissex` |
| origin | `nacional` \| `importado` |
| concentration, olfactory_family | Opcionais |
| family_group | **Gerada**: agrupa a família (Floral, Oriental, Chipre…) para filtro |
| top_notes, heart_notes, base_notes, highlights | `text[]`, opcionais; `null` = **não confirmado** |
| status | `draft` \| `published` \| `archived` |
| commercial_review | `pending` \| `approved`: revisão comercial do proprietário |
| data_sources | jsonb com a origem das informações |
| search_text | Mantido por trigger: nome + marca + família + notas, sem acentos |

### `product_variants`: SKU (cada volume é uma variante)
| Campo | Regras |
|---|---|
| sku | Único, `^[A-Z0-9][A-Z0-9-]{2,63}$` |
| barcode | 8 a 14 dígitos (EAN), opcional |
| volume_ml | 1 a 5000 |
| price_cents | > 0 |
| compare_at_cents | null ou > price_cents (preço "de") |
| price_is_reference | true = preço de referência ainda não confirmado pelo proprietário |

**Motivo:** estoque, preço, carrinho e pedido referenciam o volume específico; o snapshot do pedido guarda SKU e volume.

### `product_images`
`storage_path` (bucket `product-images`) **ou** `external_url` (CHECK exige um dos dois), `alt`, `position` (único por produto), `is_primary` (índice único parcial: uma principal por produto), `source_url`, `license_note`.

### `inventory`: estoque (1:1 com variante)
| Campo | Regras |
|---|---|
| on_hand | ≥ 0 |
| reserved | ≥ 0 e ≤ on_hand |
| min_stock | Limiar de "estoque baixo" |
| is_demo_quantity | true até o proprietário confirmar a contagem |
| stock_status | **Gerada**: `in_stock` \| `low_stock` \| `out_of_stock` |

Por **privilégio de coluna**, o público só lê `variant_id` e `stock_status`, nunca as quantidades. A escrita passa por funções transacionais executadas no servidor (Fases 5 e 6).

### `inventory_movements`
Somente inserção: `type` (`seed`, `in`, `adjust`, `reserve`, `release`, `sale`, `return`), `quantity` (delta assinado ≠ 0), `reason`, `actor_id`. Visível só para admin.

### `audit_logs`: auditoria (Fase 5)
Preenchida **só por trigger** (`audit_row_change`, `SECURITY DEFINER`) em `brands`, `categories`, `products`, `product_variants`, `product_images`, `inventory` e `user_roles`. Guarda `actor_id` (`auth.uid()`; `null` = sistema/seed), `action`, `entity`, `entity_id` e `changes` (no update, só os campos alterados como `{campo: {de, para}}`; updates sem mudança real não geram registro). Leitura só para admin; ninguém insere, altera ou apaga pela API.

### Pedidos (Fase 6)
- `shipping_zones`: frete fixo por 1º dígito do CEP (valores de demonstração). `store_settings`: linha única com frete grátis, minutos de reserva (30) e limites por pedido.
- `orders`: número sequencial, `public_token` (64 hex, a credencial do link de acompanhamento), `user_id` opcional, `idempotency_key` única, status (`pending_payment`, `paid`, `shipped`, `delivered`, `canceled`, `expired`), dados de contato e entrega, valores em centavos com `CHECK` do total, `reserved_until`, `privacy_accepted_at`.
- `order_items`: retrato do produto na compra (SKU, nome, marca, preço unitário). `order_events`: histórico de status com autor.
- `inventory_movements.order_id` liga as movimentações ao pedido. Sinais: `reserve` −q e `release` +q (disponível); `sale` −q e `return` +q (físico).

## View e funções (RPC)
| Objeto | Descrição |
|---|---|
| `catalog_products` (view, `security_invoker`) | Uma linha por produto visível: marca, categoria, menor e maior preço, volumes, promoção, % de desconto, disponibilidade e imagem principal |
| `search_catalog(...)` | Busca (multitermo, sem acento, sem curingas), filtros (gênero, origem, marca, categoria, família, promoção, disponível, faixa de preço), ordenação e paginação (máx. 48). Retorna `{ total, page, page_size, items }` |
| `get_product(slug)` | Produto com marca, categoria, variantes (com `stock_status`) e imagens; `null` se inexistente ou não visível |
| `catalog_facets()` | Marcas, famílias e faixa de preço para os filtros |

| `admin_update_stock(variant, mode, quantity, min_stock, reason)` | `set` = contagem conferida (deixa de ser demo), `in` = entrada. Trava a linha (`for update`), nunca abaixo do reservado, grava movimentação com autor e motivo. Cria a linha de estoque de variantes novas |
| `admin_list_inventory(q, status, product_id)` | Estoque com quantidades para o painel |
| `admin_dashboard_stats()` | Contagens do dashboard |
| `quote_cart(items, cep)` | Cotação pública: preço atual, disponibilidade (limitada ao máximo por item), subtotal e frete |
| `shipping_quote(cep, subtotal)` | Frete da região, com frete grátis acima do valor configurado |
| `create_order(...)` | **Só service role.** Trava o estoque em ordem fixa, recusa venda acima do disponível, recalcula preço e frete, reserva e é idempotente (advisory lock pela chave) |
| `get_order_public(token)` | Pedido pelo link: sem `user_id`, rua ou token; CEP mascarado |
| `admin_update_order_status(order, status)` | Transições válidas com efeito no estoque (pago baixa, cancelado libera ou devolve) |
| `admin_release_expired_reservations()` / `release_expired_reservations()` | Expira pedidos vencidos e devolve a reserva |
| `admin_set_primary_image(image)` | Troca atômica da imagem principal (`SECURITY INVOKER`, passa pela RLS) |

As RPCs do catálogo são `SECURITY INVOKER`, ou seja, respeitam a RLS de quem chama. As de estoque e indicadores são `SECURITY DEFINER` porque leem quantidades protegidas por privilégio de coluna; por isso verificam `has_role('admin')` na primeira linha e não são executáveis por `anon`.

## RLS (resumo)
| Tabela | anon / cliente | admin / owner |
|---|---|---|
| brands, categories | Leitura se ativas | Leitura e escrita |
| products | Leitura se `published` | Leitura e escrita (inclui rascunhos) |
| product_variants, product_images | Leitura se o produto está publicado | Leitura e escrita |
| inventory | Somente `stock_status` de variantes publicadas | Quantidades e alteração só pelas RPCs `admin_*` |
| inventory_movements | — | Leitura |
| user_roles | Próprios papéis (cliente) | Escrita só pelo service role |
| audit_logs | — | Leitura (escrita só por trigger) |
| orders, order_items, order_events | Cliente lê os próprios (sem token); visitante nada | Leitura; mudança só por RPC |
| shipping_zones, store_settings | Leitura pública | Escrita |
| storage `product-images` | Leitura pública pela URL | Upload, leitura via API, atualização e remoção |

## Índices
Únicos: slugs, `sku`, `seed_key`, `(product_id, position)` em imagens, imagem principal parcial. Busca: `products(status)`, `(brand_id)`, `(category_id)`, `product_variants(product_id)`, `inventory_movements(variant_id, created_at desc)`.

## Migrations
| Arquivo | Conteúdo |
|---|---|
| `20261108000100_catalog.sql` | Utilitários, RBAC, catálogo, estoque, RLS, view, bucket de imagens |
| `20261108000200_catalog_rpc.sql` | `search_catalog`, `get_product`, `catalog_facets` |
| `20261108000400_orders.sql` | Frete, configurações, pedidos, itens, histórico, RPCs de compra e de status |
| `20261108000300_admin.sql` | `audit_logs` e triggers, RPCs `admin_*`, policy de leitura do Storage para admin |

## Seed
`supabase/seed/catalog.seed.sql` (gerado) é idempotente: upsert por `seed_key` e `sku`. Ele **não sobrescreve** preço confirmado (`price_is_reference = false`), conteúdo revisado (`commercial_review = 'approved'`) nem estoque existente. Detalhes em [PRODUCT_CATALOG.md](PRODUCT_CATALOG.md).
