# Segurança — Sally Perfumaria

Revisão da Fase 10 (09/11/2026). Projeto de estudo: o que muda antes do uso comercial está em [PENDENCIAS_COMERCIAIS.md](PENDENCIAS_COMERCIAIS.md). Testes que comprovam cada proteção: [TESTES.md](TESTES.md).

## Princípios
1. **O banco é a última barreira.** Toda tabela tem RLS; operações sensíveis (pedido, estoque, pagamento, status) são funções SQL transacionais que validam papel e dados. O servidor Next repete as verificações, mas o banco não confia nele.
2. **O navegador não decide nada que tenha valor.** Preço, frete, disponibilidade e aprovação de pagamento são sempre calculados no servidor/banco.
3. **Segredos só no servidor.** `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_WEBHOOK_SECRET` e `SUPABASE_DB_URL` vivem em módulos `server-only` e no `.env.local` (fora do git). Um teste varre o código enviado ao navegador atrás deles.
4. **Mínimo privilégio e minimização de dados.** Admin não vê endereços salvos nem favoritos; o público vê o status do estoque, nunca a quantidade; o link do pedido mostra o CEP mascarado.

## Autenticação e sessão
- Supabase Auth. O `proxy.ts` só renova a sessão e redireciona por UX; a autorização real é `requireRole`/`requireUser` (servidor) + RLS.
- `getClaims()` valida a assinatura do JWT; o papel vem de `has_role()` no banco.
- Cookies de sessão **`httpOnly`**, `SameSite=Lax`, `Secure` em HTTPS: um XSS não lê o token.
- Login e cadastro com mensagens genéricas (não revelam e-mails cadastrados) e limite de tentativas; recuperação de senha sempre responde igual.
- Destinos pós-login (`returnTo`) aceitam só caminhos internos (sem open redirect). Admin e loja têm validadores separados.
- Senha: 8+ caracteres com letras e números, até 72 (limite do bcrypt). Exclusão de conta e troca de senha pedem a senha atual.

## Autorização (RBAC)
| Papel | Pode |
|---|---|
| Visitante | Catálogo publicado, cotação da sacola, criar pedido (pelo servidor), ver o próprio pedido pelo token |
| Cliente | Tudo do visitante + próprios perfil, endereços, favoritos, pedidos e cobranças |
| Admin / Owner | Catálogo, estoque (por RPC), pedidos, auditoria. `owner` inclui `admin`. Papéis só são concedidos pelo service role |

## Dados e banco
- RLS em todas as tabelas; privilégios de coluna onde há dado sensível (quantidades de estoque, token do pedido, `user_id` imutável).
- RPCs `SECURITY DEFINER` com `search_path = ''`, verificação de papel na primeira linha e `revoke` de `public`/`anon`. As que criam pedido, cobrança ou aplicam evento de pagamento só executam com service role.
- Auditoria por trigger, somente leitura pela API; histórico de estoque e de pedidos com autor.
- Dinheiro em centavos inteiros, com `CHECK` de total no banco.

## Compra e pagamento
- `create_order`: trava o estoque em ordem fixa, nunca vende além do disponível, idempotente por chave (advisory lock), reserva por 30 min.
- Pagamento só é confirmado por **webhook com HMAC-SHA256** (`t=…,v1=…`, tolerância de 5 min contra replay), comparação em tempo constante, limite de corpo (16 KB) e de requisições.
- `apply_payment_event` é idempotente pelo id do evento e confere o valor; divergência vai para revisão; pagamento após expiração fica marcado para estorno.
- Cartão tokenizado no navegador; os campos do cartão não têm `name` (nem um envio sem JavaScript os transmite).
- Trava de configuração: com `STORE_MODE=commercial`, build e servidor se recusam a subir com o provedor simulado.

## Entrada e saída
- Toda entrada validada com zod no servidor (formulários, ações, webhook). Erros do banco viram mensagens genéricas.
- Upload: tamanho 5 KB–5 MB, tipo conferido pela **assinatura do arquivo** (JPEG/PNG/WebP; SVG recusado), nome gerado no servidor.
- JSON-LD com `<` escapado; nenhum HTML vindo de usuário é renderizado.
- Server Actions têm verificação de origem do Next (CSRF); IDs recebidos são validados como UUID.

## Cabeçalhos
| Cabeçalho | Valor |
|---|---|
| Content-Security-Policy | `default-src 'self'`; `script-src 'self' 'unsafe-inline'`; imagens e conexões só da loja e do Supabase; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests` em HTTPS |
| Strict-Transport-Security | 2 anos, em HTTPS |
| X-Frame-Options / COOP | `DENY` / `same-origin` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` (o token do pedido não vaza para outros sites) |
| Permissions-Policy | câmera, microfone, geolocalização, pagamento e USB desligados |

**Limitação conhecida da CSP:** `script-src` aceita `'unsafe-inline'`. Com Cache Components (pré-renderização parcial) a CSP com nonce é incompatível, segundo o guia oficial do Next. O impacto é mitigado pelos cookies `httpOnly`, pela ausência de HTML de usuário e pela validação de entrada. O Zod roda em modo `jitless` para não precisar de `eval`.

## LGPD
- Dados mínimos no checkout (sem CPF nem data de nascimento), consentimento explícito, política de privacidade em `/privacidade` (texto de demonstração).
- Exportação dos dados em JSON e exclusão de conta pela própria pessoa; pedidos ficam sem vínculo, por obrigação legal.

## Dependências
`npm audit` (09/11/2026): **0 vulnerabilidades nas dependências de produção**. Há 8 moderadas em ferramentas de desenvolvimento (cadeia `eslint-config-next` → `typescript-eslint` → `minimatch`, ReDoS em glob), que não vão para o servidor nem para o navegador; a correção exige atualização com quebra do ESLint.

## Riscos aceitos neste projeto de estudo
- Limite de tentativas em memória (por instância).
- Expiração de reservas sob demanda, sem agendador.
- Sem CAPTCHA, sem 2FA para admins, sem proteção contra senhas vazadas (plano Pro).
- Confirmação de e-mail desligada no cadastro (decisão D14).

## Como relatar um problema
Projeto de estudo, sem canal formal. Antes do uso comercial, definir um e-mail de segurança e publicar `/.well-known/security.txt`.
