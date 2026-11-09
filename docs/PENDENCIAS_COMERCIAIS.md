# Pendências para transformar a Sally em uma loja real

Hoje a Sally é um **projeto de estudo e demonstração**: não é uma loja oficial, não vende de verdade e roda inteiramente em planos gratuitos. Este arquivo lista **tudo o que precisa mudar quando o projeto for vendido a uma loja real**.

Mantenha a lista atualizada a cada fase. Os itens novos entram na seção correspondente.

---

## 1. Legal, marca e dados do negócio
- [ ] Definir a razão social, o CNPJ, o endereço e os contatos da loja real e exibi-los no rodapé (exigência do CDC e do Decreto 7.962/2013 para comércio eletrônico).
- [ ] Remover o aviso "Projeto de estudo — loja de demonstração" do topo (`src/components/layout/site-header.tsx`) e do rodapé (`site-footer.tsx`).
- [ ] Redigir as políticas reais de troca e devolução (direito de arrependimento de 7 dias), de entrega, de privacidade (LGPD) e os termos de uso. A página `/privacidade` atual é um texto de demonstração. Elas também alimentam o RAG do Consultor.
- [ ] Nomear o encarregado de dados (DPO) e definir o canal para os titulares exercerem seus direitos.
- [ ] Revisar o banner de cookies e o consentimento conforme as ferramentas de analytics/marketing escolhidas.
- [ ] Registrar o domínio e configurar o e-mail remetente (SPF, DKIM, DMARC).

## 2. Catálogo, fotos e preços
- [ ] **Substituir todas as imagens de produtos obtidas na internet.** Neste projeto de estudo foram usadas imagens públicas, com a origem anotada em `docs/PRODUCT_CATALOG.md`, **sem licença comercial**. Para operar, use fotos próprias do estoque, fotos fornecidas ou autorizadas pelo distribuidor ou fabricante (kit de imprensa), ou um banco de imagens licenciado.
- [ ] Confirmar se a loja tem autorização para revender cada marca (em especial marcas de venda direta, como O Boticário e Natura) e remover as que não puder vender.
- [ ] Trocar os **preços de referência** pelos preços comerciais da loja (painel admin → Revisão comercial).
- [ ] Trocar o **estoque de demonstração** pelas quantidades reais e desligar o selo "quantidade de demonstração" item a item.
- [ ] Revisar descrições, notas olfativas e concentrações com a loja; marcar como "verificado".
- [ ] Revisar os códigos de barras (EAN) reais de cada SKU.
- [ ] Remover a URL externa das imagens do seed (`product_images.external_url`) e o domínio `epocacosmeticos.vteximg.com.br` de `images.remotePatterns` em `next.config.ts`.
- [ ] Completar as pirâmides olfativas marcadas como "não confirmadas" (16 produtos), com fonte oficial.
- [ ] Revisar a pirâmide do Floratta Red Passion e as notas do Bad Boy: a fonte de referência trazia dados inconsistentes, por isso ficaram como "destaques".
- [ ] Revisar a regra de parcelamento exibida (demonstração: até 10x, parcela mínima de R$ 50) conforme o gateway contratado.

## 3. Pagamentos
- [ ] Implementar um provedor real na interface `PaymentProvider` (`src/lib/payments/types.ts`), com o SDK de tokenização do próprio gateway no navegador, e ajustar `verifySignature` ao formato de assinatura dele. O provedor `fake` e o botão "Simular pagamento recebido" devem sair do build de produção.
- [ ] Estorno real no gateway ao cancelar pedido pago (hoje só muda o status para "Estornado") e rotina para cobranças marcadas "Estornar" (pagas depois de a reserva expirar).
- [ ] Trocar `PAYMENT_WEBHOOK_SECRET` pelo segredo fornecido pelo gateway e cadastrar a URL `/api/webhooks/payments` no painel dele.
- [ ] Escolher o gateway (recomendação em `FASE-1-DIAGNOSTICO.md` §11) e **confirmar as taxas atuais** com ele.
- [ ] Criar a conta da loja no gateway, fazer a homologação e cadastrar a chave Pix.
- [ ] Configurar as credenciais de produção **somente** nas variáveis de ambiente do servidor (`PAYMENT_PROVIDER` e chaves do gateway), nunca no código.
- [ ] Configurar a URL do webhook de produção e o segredo de assinatura.
- [ ] Testar no sandbox: aprovado, recusado, pendente, estorno total e parcial, webhook duplicado.
- [ ] Definir `STORE_MODE=commercial` em produção: o build já falha se `PAYMENT_PROVIDER=fake` (trava implementada na Fase 10).
- [ ] Definir regras comerciais: desconto no Pix, parcelamento máximo e parcela mínima.

## 4. Frete e operação
- [ ] Trocar a **tabela fixa de frete por região** (adotada neste projeto) por cotação real (ex.: Melhor Envio, Correios ou transportadora contratada).
- [ ] Os valores da tabela `shipping_zones` e o frete grátis acima de R$ 299 são **fictícios** (marcados `is_demo`). Definir os reais.
- [ ] Pedir CPF no checkout quando houver emissão de nota fiscal (hoje não é coletado, por minimização de dados).
- [ ] Enviar e-mails de confirmação e de mudança de status do pedido (hoje o cliente acompanha só pelo link).
- [ ] Cupom de demonstração `BEMVINDA10` (10% a partir de R$ 150, teto R$ 100), marcado `is_demo`: desativar ou substituir pelas campanhas reais.
- [ ] Cupons: definir se haverá limite por cliente logado (hoje é por e-mail), cupom de frete grátis e cupom restrito a marca/categoria (não implementados).
- [ ] Cadastrar o peso e as dimensões reais de cada SKU.
- [ ] Definir prazos de despacho, a política de frete grátis e as regiões atendidas.
- [ ] Emitir nota fiscal (NF-e) com integração a um ERP ou emissor: **não implementado** neste projeto.

## 5. Infraestrutura (sai do plano gratuito)
Custos detalhados em [COST_ESTIMATE.md](COST_ESTIMATE.md).

- [ ] **Vercel:** migrar de Hobby para Pro (o Hobby proíbe uso comercial). Valor de referência: US$ 20/mês (pesquisa de 08/11/2026).
- [ ] **Supabase:** migrar de Free para Pro (o Free pausa o projeto após 1 semana de inatividade). Valor de referência: US$ 25/mês. Ativar backups e point-in-time recovery, se o volume justificar.
- [ ] **E-mail transacional:** conta própria (ex.: Resend) com domínio verificado.
- [ ] **Limite de tentativas** do checkout em armazenamento compartilhado (ex.: Upstash Redis ou firewall da Vercel). O atual é em memória, por instância.
- [ ] Agendar a expiração de reservas com `pg_cron` (hoje é feita sob demanda, a cada pedido e a cada acesso ao painel).
- [ ] **Monitoramento:** erros (ex.: Sentry), uptime e alertas de pagamento e estoque.
- [ ] Criar um projeto Supabase **separado** para produção (não reaproveitar o de estudo) e aplicar as migrations do zero.
- [ ] Trocar todas as chaves usadas no estudo (Supabase service role, IA, etc.).
- [ ] Revisar a CSP para os domínios finais (gateway, analytics) e avaliar CSP com hash/SRI quando o Next suportar com pré-renderização parcial.
- [ ] Atualizar `eslint-config-next`/`typescript-eslint` quando houver versão sem a vulnerabilidade moderada do `minimatch` (só ferramenta de desenvolvimento).
- [ ] Publicar `/.well-known/security.txt` com um contato de segurança.

## 6. Inteligência artificial: implementar após a venda
**Situação atual:** o Consultor de Fragrâncias e qualquer recurso de IA foram **retirados do site** em 08/11/2026, porque a API do Claude é paga. Não existe rota `/assistente`, link no menu nem código de IA no projeto. O desenho completo continua em `FASE-1-DIAGNOSTICO.md` §12 e deve ser seguido na implementação.

O que implementar:
- [ ] **Consultor de Fragrâncias Sally** (rota `/assistente` + atalho no cabeçalho e na home): conversa que identifica ocasião, orçamento e família olfativa, consulta o catálogo por ferramentas somente leitura (`search_catalog`, `get_product`, `compare_products`, `search_knowledge`, `propose_cart_items`) e mostra cards com imagem, nome, marca, volume, preço e justificativa, todos vindos do banco. Adicionar ao carrinho só depois da confirmação do cliente.
- [ ] **Regras anti-alucinação:** só citar produtos retornados pelas ferramentas daquela conversa; preço, estoque e volume nunca saem do texto do modelo; quando faltar informação, responder que ela não está confirmada.
- [ ] **RAG:** tabelas `knowledge_documents` / `document_chunks` com pgvector; fontes = produtos, políticas, FAQ e guia olfativo; reindexar só quando o `content_hash` mudar; arquivar o produto remove os chunks.
- [ ] **Proteção contra prompt injection:** conteúdo recuperado entra como dado delimitado; nenhuma ferramenta de escrita; validação da saída; testes com documentos maliciosos.
- [ ] **IA no admin:** sugestões de descrição, título e notas e resumo de vendas e de estoque baixo, sempre como rascunho que o proprietário aprova. Sem ações automáticas.
- [ ] **Privacidade:** não enviar nome, e-mail ou endereço ao provedor de LLM; retenção curta das conversas; citar o uso de IA na política de privacidade.
- [ ] **Contas e custos:** criar a conta na Anthropic com limite de gastos e configurar `ANTHROPIC_API_KEY` no servidor. Modelo decidido: **`claude-opus-5-5`** (US$ 4 / US$ 20 por milhão de tokens de entrada/saída; estimativa por volume em `FASE-1-DIAGNOSTICO.md` §15). Embeddings: Voyage AI (`VOYAGE_API_KEY`; plano gratuito de 200 milhões de tokens), validando a qualidade em português.
- [ ] **Testes:** grupos 38 a 41 do briefing (assistente, RAG, respostas sem dados suficientes, prompt injection) e "LLM tentando realizar ação administrativa", com LLM fake determinístico via MSW.
- [ ] **Preparação já existente que ajuda:** os campos olfativos estruturados em `products` (família, notas de topo/coração/fundo, concentração) e o `data_verification` por campo, criados nas Fases 3 e 4, são a base do RAG.

## 7. Contas e acessos
- [ ] Criar o usuário `owner` da loja real pelo script controlado. Remover usuários de teste e de estudo.
- [ ] Ativar 2FA (MFA do Supabase Auth) para as contas administrativas e exigi-lo no `requireRole`.
- [ ] Configurar SMTP próprio no Supabase Auth (o padrão do plano Free tem limite baixo) e liberar a recuperação de senha do painel.
- [ ] **Religar a confirmação de e-mail no cadastro** (Authentication → Email → Confirm email), desligada para a demonstração. O código já trata os dois casos.
- [ ] Configurar em Authentication → URL Configuration o Site URL e as Redirect URLs do domínio real (`/auth/callback`).
- [ ] Ativar a proteção contra senhas vazadas (recurso do plano Pro do Supabase Auth) e um CAPTCHA no cadastro e no login.
- [ ] Definir o prazo de retenção dos pedidos de contas excluídas (hoje ficam sem vínculo, por obrigação legal) e revisar com o jurídico.
- [ ] Mostrar o e-mail do autor no histórico do painel (hoje aparece o id curto) e definir a retenção da tabela `audit_logs`.
- [ ] Apagar `ADMIN_PASSWORD` do `.env.local` depois de criar a conta, e trocar a senha de estudo.
- [ ] Definir quem terá papel `admin` além do proprietário.

## 8. Qualidade antes de abrir
- [ ] Rodar a suíte completa (unitário, integração, E2E e segurança) contra o ambiente de produção (staging).
- [ ] Rodar o Lighthouse em mobile e desktop nas páginas principais.
- [ ] Fazer um pentest leve ou revisão de segurança independente.
- [ ] Fazer um teste de carga no checkout e na reserva de estoque.

## 9. Telas do painel fora desta versão
- [ ] Clientes: lista de clientes com pedidos (respeitando a LGPD; hoje o admin busca pedidos por e-mail).
- [ ] Relatórios: vendas por período, produtos mais vendidos, uso de cupons.
- [ ] Configurações: editar frete por região, frete grátis e tempo de reserva (hoje só no banco).
