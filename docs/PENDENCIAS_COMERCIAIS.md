# Pendências para transformar a Sally em uma loja real

Hoje a Sally é um **projeto de estudo e demonstração**: não é uma loja oficial, não vende de verdade e roda inteiramente em planos gratuitos. Este arquivo lista **tudo o que precisa mudar quando o projeto for vendido a uma loja real**.

Mantenha a lista atualizada a cada fase. Os itens novos entram na seção correspondente.

---

## 1. Legal, marca e dados do negócio
- [ ] Definir a razão social, o CNPJ, o endereço e os contatos da loja real e exibi-los no rodapé (exigência do CDC e do Decreto 7.962/2013 para comércio eletrônico).
- [ ] Remover o aviso "Projeto de estudo — loja de demonstração" do topo (`src/components/layout/site-header.tsx`) e do rodapé (`site-footer.tsx`).
- [ ] Redigir as políticas reais de troca e devolução (direito de arrependimento de 7 dias), de entrega, de privacidade (LGPD) e os termos de uso. Elas também alimentam o RAG do Consultor.
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

## 3. Pagamentos
- [ ] Escolher o gateway (recomendação em `FASE-1-DIAGNOSTICO.md` §11) e **confirmar as taxas atuais** com ele.
- [ ] Criar a conta da loja no gateway, fazer a homologação e cadastrar a chave Pix.
- [ ] Configurar as credenciais de produção **somente** nas variáveis de ambiente do servidor (`PAYMENT_PROVIDER` e chaves do gateway), nunca no código.
- [ ] Configurar a URL do webhook de produção e o segredo de assinatura.
- [ ] Testar no sandbox: aprovado, recusado, pendente, estorno total e parcial, webhook duplicado.
- [ ] Desligar o provedor simulado (`PAYMENT_PROVIDER=fake`) em produção. O build deve falhar se ele estiver ativo em produção (implementar junto com a Fase 8).
- [ ] Definir regras comerciais: desconto no Pix, parcelamento máximo e parcela mínima.

## 4. Frete e operação
- [ ] Trocar a **tabela fixa de frete por região** (adotada neste projeto) por cotação real (ex.: Melhor Envio, Correios ou transportadora contratada).
- [ ] Cadastrar o peso e as dimensões reais de cada SKU.
- [ ] Definir prazos de despacho, a política de frete grátis e as regiões atendidas.
- [ ] Emitir nota fiscal (NF-e) com integração a um ERP ou emissor: **não implementado** neste projeto.

## 5. Infraestrutura (sai do plano gratuito)
- [ ] **Vercel:** migrar de Hobby para Pro (o Hobby proíbe uso comercial). Valor de referência: US$ 20/mês (pesquisa de 08/11/2026).
- [ ] **Supabase:** migrar de Free para Pro (o Free pausa o projeto após 1 semana de inatividade). Valor de referência: US$ 25/mês. Ativar backups e point-in-time recovery, se o volume justificar.
- [ ] **E-mail transacional:** conta própria (ex.: Resend) com domínio verificado.
- [ ] **Monitoramento:** erros (ex.: Sentry), uptime e alertas de pagamento e estoque.
- [ ] Criar um projeto Supabase **separado** para produção (não reaproveitar o de estudo) e aplicar as migrations do zero.
- [ ] Trocar todas as chaves usadas no estudo (Supabase service role, IA, etc.).
- [ ] Ativar a CSP completa e revisar os headers de segurança para os domínios finais.

## 6. Inteligência artificial
- [ ] **A API da Anthropic (Claude) é paga e não tem plano gratuito.** Sem `ANTHROPIC_API_KEY`, o Consultor roda em modo demonstração, sem LLM. Para a loja real: criar a conta, definir um limite de gastos e configurar a chave no servidor.
- [ ] Modelo escolhido: **`claude-opus-5-5`** (decisão de 08/11/2026). Reavaliar o custo com volume real (estimativa em `FASE-1-DIAGNOSTICO.md` §15).
- [ ] Embeddings (Voyage AI): o plano gratuito inclui 200 milhões de tokens. Validar a qualidade em português com dados reais.
- [ ] Revisar os prompts e as respostas do Consultor com a loja; definir o tom de voz da marca.
- [ ] Informar na política de privacidade o uso de IA e a retenção das conversas.

## 7. Contas e acessos
- [ ] Criar o usuário `owner` da loja real pelo script controlado. Remover usuários de teste e de estudo.
- [ ] Ativar 2FA para as contas administrativas.
- [ ] Definir quem terá papel `admin` além do proprietário.

## 8. Qualidade antes de abrir
- [ ] Rodar a suíte completa (unitário, integração, E2E e segurança) contra o ambiente de produção (staging).
- [ ] Rodar o Lighthouse em mobile e desktop nas páginas principais.
- [ ] Fazer um pentest leve ou revisão de segurança independente.
- [ ] Fazer um teste de carga no checkout e na reserva de estoque.
