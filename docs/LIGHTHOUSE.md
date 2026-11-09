# Auditoria Lighthouse

Medido em 2026-11-09 com `scripts/perf/lighthouse.mjs`: build de produção local (`next start`), Lighthouse 13.6.0, **mediana de 3 execuções** por página. Dados do catálogo vindos do Supabase remoto (us-west-2), sem CDN: em produção na Vercel os tempos tendem a ser menores.

Sacola e checkout foram medidos **vazios** (a sacola fica no navegador do visitante).

## Mobile (emulação Moto G Power, 4G lento)
| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Início | 100 | 100 | 100 | 100 | 0.76 s | 0 | 51 ms |
| Catálogo | 100 | 100 | 100 | 100 | 0.91 s | 0 | 64 ms |
| Detalhe do produto | 97 | 100 | 100 | 92 | 2.56 s | 0 | 49 ms |
| Sacola | 100 | 100 | 100 | 63 | 0.76 s | 0.032 | 44 ms |
| Checkout | 98 | 100 | 100 | 63 | 0.76 s | 0.079 | 70 ms |

## Desktop
| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Início | 100 | 100 | 100 | 100 | 0.21 s | 0 | 0 ms |
| Catálogo | 100 | 100 | 100 | 100 | 0.80 s | 0 | 0 ms |
| Detalhe do produto | 100 | 100 | 100 | 92 | 0.53 s | 0 | 0 ms |
| Sacola | 100 | 100 | 100 | 63 | 0.21 s | 0 | 0 ms |
| Checkout | 100 | 100 | 100 | 63 | 0.21 s | 0 | 0 ms |

Itens reprovados em SEO/Boas práticas (qualquer execução): meta-description, is-crawlable.

## Leitura dos resultados
- **SEO 63 em Sacola e Checkout:** reprova só `is-crawlable`, porque essas páginas são marcadas `noindex` de propósito (não faz sentido indexar sacola e checkout).
- **SEO 92 no detalhe do produto (`meta-description`):** a descrição existe, mas o Next 16 envia o metadata de páginas dinâmicas por *streaming* no `<body>` e o React o move para o `<head>` no navegador. O Google interpreta corretamente; robôs que não executam JavaScript recebem o metadata no `<head>` (`htmlLimitedBots`). Não desligamos o streaming só para subir a nota.
- **LCP do detalhe no mobile:** a foto principal já carrega com prioridade; o tempo inclui a otimização da imagem, que busca o original no Storage do Supabase nos EUA, sob emulação de 4G lento.
- Nenhuma funcionalidade ou imagem foi removida para elevar pontuações.
