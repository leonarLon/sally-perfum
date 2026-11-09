# Auditoria Lighthouse

Medido em 2026-11-09 com `scripts/perf/lighthouse.mjs`: site publicado na Vercel (https://sally-perfum.vercel.app), medido a partir do Brasil, Lighthouse 13.6.0, **mediana de 3 execuções** por página. Dados do catálogo vindos do Supabase (us-west-2).

Sacola e checkout foram medidos **vazios** (a sacola fica no navegador do visitante).

## Mobile (emulação Moto G Power, 4G lento)
| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Início | 99 | 100 | 100 | 100 | 0.92 s | 0 | 96 ms |
| Catálogo | 100 | 100 | 100 | 100 | 0.94 s | 0 | 49 ms |
| Detalhe do produto | 98 | 100 | 100 | 92 | 2.42 s | 0 | 0 ms |
| Sacola | 100 | 100 | 100 | 63 | 0.81 s | 0.032 | 87 ms |
| Checkout | 97 | 100 | 100 | 63 | 2.58 s | 0 | 32 ms |

## Desktop
| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Início | 100 | 100 | 100 | 100 | 0.27 s | 0 | 0 ms |
| Catálogo | 100 | 100 | 100 | 100 | 0.58 s | 0 | 0 ms |
| Detalhe do produto | 93 | 100 | 100 | 92 | 0.51 s | 0.164 | 0 ms |
| Sacola | 100 | 100 | 100 | 63 | 0.24 s | 0 | 0 ms |
| Checkout | 100 | 100 | 100 | 63 | 0.27 s | 0 | 0 ms |

Itens reprovados em SEO/Boas práticas (qualquer execução): meta-description, is-crawlable.

## Leitura dos resultados
- **SEO 63 em Sacola e Checkout:** reprova só `is-crawlable`, porque essas páginas são marcadas `noindex` de propósito (não faz sentido indexar sacola e checkout).
- **SEO 92 no detalhe do produto (`meta-description`):** a descrição existe, mas o Next 16 envia o metadata de páginas dinâmicas por *streaming* no `<body>` e o React o move para o `<head>` no navegador. O Google interpreta corretamente; robôs que não executam JavaScript recebem o metadata no `<head>` (`htmlLimitedBots`). Não desligamos o streaming só para subir a nota.
- **LCP do detalhe no mobile:** a foto principal já carrega com prioridade; o tempo inclui a otimização da imagem, que busca o original no Storage do Supabase nos EUA, sob emulação de 4G lento.
- Nenhuma funcionalidade ou imagem foi removida para elevar pontuações.
