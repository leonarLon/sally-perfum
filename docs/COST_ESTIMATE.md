# Estimativa de custos — Sally Perfumaria

Preços consultados em 09/11/2026 nas páginas oficiais ([Supabase](https://supabase.com/pricing), [Vercel](https://vercel.com/pricing)), em dólares. Mudam com frequência: confira antes de decidir. Para reais, multiplique pela cotação do dia e some o IOF da compra internacional no cartão.

## Uso medido hoje
| Recurso | Uso atual | Observação |
|---|---|---|
| Banco (Postgres) | 13 MB | Quase tudo é estrutura do próprio Postgres; as tabelas da loja somam menos de 1 MB |
| Storage (imagens) | 7,2 MB em 128 arquivos | Média de 56 KB por imagem |
| Usuários (Auth) | Só contas de teste | — |
| Hospedagem | Local | Ainda não publicado |

## Cenário 1 — Demonstração (situação atual): US$ 0/mês
| Serviço | Plano | Limites relevantes |
|---|---|---|
| Supabase | Free | 500 MB de banco, 1 GB de Storage, 5 GB de tráfego, 50 mil usuários ativos/mês. **Pausa após 1 semana sem uso** e não tem backup |
| Vercel (se publicado) | Hobby | 100 GB de tráfego, 1 milhão de requisições e de execuções de função, 5 mil transformações de imagem por mês. **Uso apenas pessoal e não comercial** |
| Pagamento | Simulado | Nada é cobrado |
| E-mail | SMTP do Supabase | Limite baixo de envios; só para testes |

Cabe com folga no gratuito. Os dois pontos de atenção são a pausa do Supabase (a demonstração fica fora do ar até ser reativada no painel) e o limite de 5 mil transformações de imagem da Vercel (cada combinação de imagem × tamanho conta uma vez enquanto estiver em cache).

## Cenário 2 — Loja real pequena: cerca de US$ 45/mês + taxas
Para vender de verdade, os planos gratuitos deixam de servir: a Vercel Hobby proíbe uso comercial e o Supabase Free pausa e não tem backup.

| Item | Custo | O que inclui |
|---|---|---|
| Vercel Pro | US$ 20/mês por pessoa com acesso | 1 TB de tráfego e 10 milhões de requisições; acima disso, cobrança por uso (ex.: US$ 0,15/GB de tráfego, US$ 0,05 por mil transformações de imagem) |
| Supabase Pro | a partir de US$ 25/mês | 8 GB de banco, 100 GB de Storage, 250 GB de tráfego, 100 mil usuários ativos, backup diário (7 dias), sem pausa. Inclui US$ 10 de crédito de processamento (cobre a instância Micro) |
| Domínio `.com.br` | anual, no [registro.br](https://registro.br) | Valor a confirmar no site |
| Gateway de pagamento | percentual por venda | Varia por gateway e forma de pagamento (Pix costuma ser mais barato que cartão). **A cotar**; não estimado aqui |
| E-mail transacional | a definir | Necessário para confirmação de pedido e recuperação de senha em volume (ver `PENDENCIAS_COMERCIAIS.md`) |

**Fixo estimado: US$ 45/mês** (uma pessoa na Vercel) + domínio + taxas do gateway sobre as vendas.

## Cenário 3 — Crescimento
Com o uso medido, os limites do Cenário 2 só pesam com volume grande. Referências de cobrança extra no Supabase Pro:

| Recurso | Preço extra | Quando chega lá |
|---|---|---|
| Banco | US$ 0,125/GB acima de 8 GB | Centenas de milhares de pedidos |
| Storage | US$ 0,0213/GB acima de 100 GB | Com fotos de 56 KB, mais de 1 milhão de imagens |
| Tráfego | US$ 0,09/GB acima de 250 GB | As imagens são servidas pelo cache da Vercel, então o Supabase entrega cada original poucas vezes |
| Usuários ativos | US$ 0,00325 por usuário acima de 100 mil | — |

O que tende a crescer primeiro é a instância de banco (processamento), conforme o número de pessoas comprando ao mesmo tempo. A troca de instância é paga à parte no Supabase.

## Itens fora da conta
- **Consultor de IA:** suspenso até a venda do projeto (`PENDENCIAS_COMERCIAIS.md` §6). Quando voltar, o custo depende do modelo e do volume de conversas e precisa de estimativa própria.
- **Fotos e textos licenciados**, contabilidade, emissão de nota fiscal e frete real: dependem do negócio.
- **Limite de tentativas distribuído** (Redis/Upstash) e **agendador** de liberação de reservas: há opções gratuitas, mas podem gerar custo com volume.

## Resumo
| Cenário | Custo fixo mensal |
|---|---|
| Demonstração | US$ 0 |
| Loja real pequena | ≈ US$ 45 + domínio + taxas do gateway + e-mail |
| Crescimento | US$ 45 + uso excedente (ver tabela) |
