# Feature Specification: Sprint 5 — Descontos Comerciais (Parte 2), Emissão de PDFs (Comercial e Técnico de Oficina) e Transição para Pedidos

**Feature**: `001-orcamento-descontos-pdf` & `002-pedidos-lock-precos`  
**Release**: Release 1 (Homologação Final v0.5.0) & Transição para Release 2 (v2.0.0)  
**Created**: 2026-08-27  
**Last Updated**: 2026-09-23  
**Status**: 🟢 Concluída / Em Homologação (US-09 Parte 2, US-10 e US-11 entregues)

---

## 1. Visão Geral & Contexto de Negócio

A **Sprint 05** representa o marco de consolidação comercial e fabril do AlumiGest, finalizando a esteira de orçamentos e viabilizando a emissão documental oficial em duas vias:

1. **Conclusão de Descontos e Condições Comerciais (US-09 Parte 2)**:
   - Implementação da regra de negócio de validade padrão de 15 dias corridos (PR #275).
   - Integração da condição de pagamento ao resumo financeiro do orçamento (PR #292).
   - Listagem paginada e filtros dinâmicos de orçamentos (PR #280 / PR #293).
2. **Emissão de Orçamento em PDF - Via Comercial e WhatsApp (US-10)**:
   - Geração de documento PDF oficial com OpenPDF contendo dados do cliente, cabeçalho institucional, discriminação de itens e totais líquidos.
   - Formatação e cópia de resumo para WhatsApp via Clipboard API.
3. **Emissão de Orçamento em PDF - Via Técnica de Oficina (US-11)**:
   - Geração de documento PDF voltado para o chão de fábrica com **estrito sigilo comercial** (zero menções a valores monetários em R$), detalhando dimensões nominais (L x A mm), modelos, perfis, vidros, ferragens e opções construtivas (PR #322 mergeado em 23/09/2026).
4. **Transição para Gestão de Pedidos de Venda (US-13 a US-16)**:
   - Especificação e alinhamento do mecanismo de conversão 1-para-1, snapshot imutável (Lock de Preços) e máquina de estados de produção para a Release 2.

---

## 2. 👥 Histórias de Usuário da Sprint 05

### 📌 US-09 (Parte 2): Conclusão de Descontos Comerciais, Validade e Listagem Paginada (Priority: P1)
**Status**: 🟢 Concluída na Sprint 05 ([Issue #133](https://github.com/ADS-IFPB-SR/alumigest/issues/133) / PRs #275, #292, #293)

#### 🎯 Objetivo de Negócio
> **Como** vendedor da Alumiportas,  
> **Desejo** visualizar o resumo financeiro atualizado instantaneamente ao selecionar condições de pagamento e descontos, contar com prazo de validade de 15 dias corridos preenchido automaticamente e consultar orçamentos através de listagem paginada com filtros por status e cliente,  
> **Para que** a negociação comercial seja ágil, organizada e livre de erros manuais de cálculo.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Definição automática de validade padrão de 15 dias corridos e indicador de expiração**
  - **Dado que** um novo orçamento é criado no sistema
  - **Quando** a data de emissão é registrada
  - **Então** o campo `dataValidade` é preenchido automaticamente com a data de emissão $+ 15$ dias corridos
  - **E** caso a data atual ultrapasse a validade, a listagem e o detalhe exibem o badge visual `EXPIRED`.
- [x] **Cenário 2: Sincronização da condição de pagamento com o resumo financeiro**
  - **Dado que** o vendedor está na tela de detalhes ou edição do orçamento
  - **Quando** seleciona a condição de pagamento (ex: "50% Entrada + 50% na Entrega")
  - **Então** o resumo financeiro computa os valores das parcelas e reflete as condições em tempo real na interface.
- [x] **Cenário 3: Listagem paginada e filtros dinâmicos de orçamentos**
  - **Dado que** existem dezenas de propostas salvas no banco de dados
  - **Quando** o usuário navega pela tela `/orcamentos` e pesquisa por nome do cliente ou filtra por status (`DRAFT`, `APPROVED`)
  - **Então** a API `GET /api/budgets` retorna a página de resultados ordenada por data de criação com metadados de paginação.

---

### 📌 US-10: Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp (Priority: P1)
**Status**: 🟢 Concluída na Sprint 05 ([Issue #134](https://github.com/ADS-IFPB-SR/alumigest/issues/134) / PRs #294 a #313)

#### 🎯 Objetivo de Negócio
> **Como** vendedor ou cliente da Alumiportas,  
> **Desejo** emitir e baixar o orçamento em formato PDF oficial com layout profissional e responsivo, contendo cabeçalho institucional, dados do cliente, especificações completas dos itens com valores discriminados, descontos, totais e condições comerciais, além de poder copiar o resumo para o WhatsApp,  
> **Para que** a proposta formal seja entregue com clareza, transparência e agilidade ao cliente.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Emissão e Download do PDF Comercial com Sucesso**
  - **Dado que** o usuário visualiza um orçamento válido e calculado
  - **Quando** aciona o botão "Emitir PDF Comercial" na página `BudgetDetailPage`
  - **Então** o sistema gera o arquivo `application/pdf` em menos de 2 segundos com download direto do documento
  - **E** o documento exibe cabeçalho oficial com logotipo da Alumiportas, número do orçamento, datas de emissão e validade, dados do cliente, itens com medidas nominais (L x A mm), cor do alumínio, vidro, valor unitário, desconto, valor total e condição de pagamento.
- [x] **Cenário 2: Paginação e Rodapé Padronizado para Múltiplas Páginas**
  - **Dado que** um orçamento possui muitos itens ultrapassando uma página A4
  - **Quando** o PDF comercial é renderizado pelo motor OpenPDF
  - **Então** o documento realiza a quebra automática de páginas com rodapé numerado "Página X de Y" e repetição do cabeçalho simplificado.
- [x] **Cenário 3: Cópia do Resumo Formatado para WhatsApp**
  - **Dado que** o vendedor está na página de detalhes do orçamento
  - **Quando** clica no botão "Copiar Resumo Comercial"
  - **Então** o texto formatado para WhatsApp com emojis e destaques em negrito é copiado para a área de transferência (Clipboard API)
  - **E** uma notificação visual (*toast* de sucesso) é exibida na interface.
- [x] **Cenário 4: Tratamento de Dados Incompletos do Cliente**
  - **Dado que** o cliente vinculado ao orçamento não possui CPF/CNPJ ou endereço completo informado
  - **Quando** o PDF comercial é emitido
  - **Então** o documento é renderizado normalmente exibindo "Não informado" nos campos ausentes sem falhas de layout.
- [x] **Cenário 5: Tratamento de Erro para Orçamento Inexistente**
  - **Dado que** uma requisição informa um identificador inexistente
  - **Quando** o endpoint `GET /api/budgets/{id}/pdf` for invocado
  - **Então** o backend responde com status HTTP `404 Not Found` no formato padronizado `ErrorResponse`.
- [x] **Cenário 6: Preservação de Sigilo na Via Comercial**
  - **Dado que** o documento emitido é a via comercial
  - **Quando** o PDF é gerado
  - **Então** os valores monetários de venda são exibidos, mas quaisquer custos internos de matéria-prima, fórmulas de usinagem e listas de corte permanecem estritamente omitidos.

---

### 📌 US-11: Emitir Orçamento em PDF - Via Técnica de Oficina (Priority: P2)
**Status**: 🟢 Concluída na Sprint 05 ([Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) / PR #322)

#### 🎯 Objetivo de Negócio
> **Como** serralheiro, montador ou encarregado de produção da oficina da Alumiportas,  
> **Desejo** emitir e baixar uma via técnica detalhada do orçamento em formato PDF oficial com layout voltado para produção (chão de fábrica), contendo identificação da proposta, dados do cliente e especificações físicas completas das esquadrias, sob **estrito sigilo comercial** (sem exibir preços unitários, totais ou descontos),  
> **Para que** a equipe de fabricação execute o corte, usinagem e montagem de forma segura sem acesso a dados financeiros confidenciais da negociação.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Emissão e Download da Ficha Técnica com Sucesso (Chão de Fábrica)**
  - **Dado que** o operador acessa um orçamento válido na página `BudgetDetailPage`
  - **Quando** clica no botão "Via Técnica"
  - **Então** o sistema gera e disponibiliza para download o arquivo `application/pdf` em menos de 2 segundos
  - **E** o documento exibe cabeçalho oficial com logotipo da Alumiportas, badge destacado "VIA TÉCNICA - USO INTERNO / OFICINA", código do orçamento, data de emissão, dados do cliente e instruções de produção.
- [x] **Cenário 2: Sigilo Comercial Rigoroso (Zero Valores Financeiros em R$)**
  - **Dado que** o documento emitido é a Ficha Técnica de Oficina
  - **Quando** o PDF é renderizado pelo motor OpenPDF
  - **Então** nenhuma seção, linha ou tabela deve conter valores monetários (sem preço unitário, subtotal, taxa de mão de obra, percentual de desconto, valor de desconto ou valor total da proposta)
  - **E** as únicas informações numéricas exibidas devem ser dimensões físicas milimétricas (L x A mm), quantidades de peças e áreas nominais ($m^2$).
- [x] **Cenário 3: Detalhamento Técnico das Esquadrias e Opções Construtivas**
  - **Dado que** o orçamento contém esquadrias configuradas (janelas, portas, basculantes)
  - **Quando** a tabela técnica é gerada
  - **Então** cada item discrimina: tipologia/modelo, dimensões nominais (Largura x Altura em mm), quantidade, cor do perfil de alumínio, especificação do vidro (tipo e espessura em mm), lado/sentido de abertura, puxadores e ferragens previstas.
- [x] **Cenário 4: Paginação, Rodapé de Oficina e Campo de Visto Técnico**
  - **Dado que** uma ordem técnica possui muitos itens ultrapassando uma página A4
  - **Quando** o PDF é compilado
  - **Então** o documento realiza a quebra automática de página com rodapé numerado "Página X de Y" e campo para visto/assinatura do encarregado de qualidade da oficina.
- [x] **Cenário 5: Bloqueio de Emissão para Orçamentos Cancelados**
  - **Dado que** um orçamento possui status `CANCELLED`
  - **Quando** o usuário visualiza a página de detalhes
  - **Então** o botão "Via Técnica" permanece desabilitado (`disabled`) com tooltip explicativo
  - **E** caso uma requisição HTTP direta seja disparada contra `GET /api/budgets/{id}/technical-pdf`, o backend retorna status HTTP `422 Unprocessable Entity`.
- [x] **Cenário 6: Feedback Visual de Download e Prevenção de Múltiplos Cliques**
  - **Dado que** o operador clica no botão "Via Técnica"
  - **Quando** a requisição de geração do PDF estiver em processamento (`isPending`)
  - **Então** o botão entra em estado de carregamento com ícone animado de rotação e texto "Gerando..."
  - **E** novos cliques são desabilitados até a conclusão do download.
- [x] **Cenário 7: Tratamento de Erro para Orçamento Inexistente**
  - **Dado que** é solicitada a via técnica informando um identificador inválido ou não cadastrado
  - **Quando** o endpoint `GET /api/budgets/{id}/technical-pdf` for invocado
  - **Então** o backend responde com status HTTP `404 Not Found` no payload padronizado `ErrorResponse`.

---

## 3. 👥 Transição para Release 2 — Pedidos de Venda (Sprint 06 / Continuidade)

### 📌 US-13: Aprovar Orçamento e Converter em Pedido de Venda (Priority: P1) 🎯 MVP

**🎯 Objetivo de Negócio:**
Como vendedor ou gerente comercial da Alumiportas, desejo aprovar formalmente uma proposta orçamentária e convertê-la automaticamente em um Pedido de Venda oficial (`PED-YYYY-NNNN`), registrando o canal de aprovação (WhatsApp, Presencial, Telefone, E-mail), observações e a data de entrega acordada, para firmar o contrato de venda e liberar o pedido para o fluxo fabril.

**Critérios de Aceitação (Dado / Quando / Então):**

- [ ] **Cenário 1: Conversão Bem-Sucedida de Orçamento em Pedido de Venda:**
  - **Dado que** o vendedor visualiza um orçamento com status `DRAFT` ou `SENT` na página `BudgetDetailPage`,
  - **Quando** clica no botão "Aprovar e Gerar Pedido", preenche o canal de aprovação (ex: `WHATSAPP`), confirma a data de previsão de entrega e submete o formulário,
  - **Então** o sistema cria um novo Pedido de Venda com código no padrão `PED-YYYY-NNNN`,
  - **E** o status do orçamento de origem é atualizado automaticamente para `APPROVED`, vinculando-se de forma unívoca ao pedido gerado,
  - **E** o usuário é redirecionado para a página de detalhes do novo pedido (`/pedidos/:id`) com notificação de sucesso.
- [ ] **Cenário 2: Sugestão Automática de Data de Entrega (+15 Dias Corridos):**
  - **Dado que** o modal de aprovação de orçamento é aberto,
  - **Quando** o formulário é inicializado,
  - **Então** o campo `dataPrevisaoEntrega` é pré-preenchido automaticamente com a data atual $+15$ dias corridos,
  - **E** o vendedor pode editar essa data manualmente antes da confirmação final.
- [ ] **Cenário 3: Bloqueio de Conversão Duplicada (Invariante 1-para-1):**
  - **Dado que** um orçamento já foi convertido previamente em um pedido ativo,
  - **Quando** qualquer usuário tenta disparar uma nova conversão para o mesmo `orcamentoId`,
  - **Então** o backend rejeita a solicitação retornando status HTTP `409 Conflict` (ou `422 Unprocessable Entity`),
  - **E** a interface desabilita o botão de aprovação, indicando que o pedido já foi emitido com link direto para navegação.
- [ ] **Cenário 4: Bloqueio de Conversão para Orçamentos em Status Inválido:**
  - **Dado que** um orçamento possui status `CANCELLED`, `REJECTED` ou já está `APPROVED`,
  - **Quando** o endpoint `POST /api/orders/from-budget/{budgetId}` for invocado,
  - **Então** o backend bloqueia a operação lançando `BusinessException` com mensagem em português ("Apenas orçamentos em rascunho ou enviados podem ser convertidos em pedido").
- [ ] **Cenário 5: Validação de Dados Obrigatórios na Aprovação:**
  - **Dado que** o modal de aprovação está aberto,
  - **Quando** o usuário tenta submeter o formulário sem selecionar o canal de aprovação ou informando data no passado,
  - **Então** o schema Zod bloqueia a submissão e exibe mensagens de erro claras abaixo dos respectivos campos.

---

### 📌 US-14: Snapshot Imutável e Lock de Preços do Pedido (Priority: P1)

**🎯 Objetivo de Negócio:**
Como gestor financeiro e responsável pela produção da Alumiportas, desejo que o Pedido de Venda congele integralmente todos os valores financeiros, custos de matéria-prima, margens, descontos e especificações das esquadrias através de uma clonagem profunda (*deep copy*), para que alterações posteriores no catálogo de materiais ou tabelas de preços não modifiquem os valores e configurações acordados com o cliente.

**Critérios de Aceitação (Dado / Quando / Então):**

- [ ] **Cenário 1: Clonagem Profunda dos Itens do Orçamento (Deep Copy):**
  - **Dado que** um orçamento com itens compostos de esquadria e itens avulsos é aprovado,
  - **Quando** o pedido é gerado no banco de dados,
  - **Então** cada `BudgetItem` gera um registro independente em `OrderItem`,
  - **E** todas as medidas (largura, altura em mm), modelo/tipologia, cores, especificações de vidro, ferragens, preços unitários e subtotais são replicados em colunas próprias da tabela `order_items`.
- [ ] **Cenário 2: Blindagem contra Reajuste Futuro de Preços no Catálogo:**
  - **Dado que** um pedido de venda foi criado no dia $D$ com valor total de R$ 3.500,00,
  - **Quando** no dia $D + 5$ os preços dos perfis de alumínio e vidros forem reajustados em 20% no módulo de catálogo,
  - **Então** o valor unitário e o valor total do pedido e de seus itens permanecem rigorosamente inalterados em R$ 3.500,00,
  - **E** consultas e relatórios continuam exibindo o snapshot financeiro contratado.
- [ ] **Cenário 3: Imutabilidade Cadastral das Esquadrias do Pedido:**
  - **Dado que** o pedido foi formalizado,
  - **Quando** um usuário tenta editar medidas ou excluir itens diretamente no pedido aprovado,
  - **Então** o sistema não permite a alteração direta de itens contratuais, exigindo cancelamento formal e renegociação em caso de mudanças de projeto.

---

### 📌 US-15: Gestão de Status, Prazos e Cancelamento de Pedidos (Priority: P2)

**🎯 Objetivo de Negócio:**
Como encarregado de fábrica e equipe de atendimento, desejo gerenciar o ciclo de vida do pedido de venda através de status bem definidos (`CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO` ou `CANCELADO`), com registro obrigatório de justificativa em cancelamentos e possibilidade de reabertura do orçamento de origem, para manter o controle operacional e comercial da fábrica.

**Critérios de Aceitação (Dado / Quando / Então):**

- [ ] **Cenário 1: Transição Regular do Fluxo de Produção:**
  - **Dado que** um pedido está com status `CRIADO`,
  - **Quando** o encarregado envia o pedido para a fábrica,
  - **Então** o status avança para `AGUARDANDO_PRODUCAO`, e posteriormente para `EM_PRODUCAO` e `CONCLUIDO`,
  - **E** a data de conclusão real é registrada automaticamente quando o pedido atinge o status `CONCLUIDO`.
- [ ] **Cenário 2: Cancelamento de Pedido com Justificativa Obrigatória:**
  - **Dado que** um pedido ainda não entrou em produção física (`CRIADO` ou `AGUARDANDO_PRODUCAO`),
  - **Quando** o usuário aciona a ação de cancelamento,
  - **Então** o sistema exige o preenchimento de justificativa formal com no mínimo 10 caracteres (`orderCancelSchema`),
  - **E** o pedido tem seu status atualizado para `CANCELADO`, persistindo a justificativa e o autor da ação para fins de auditoria.
- [ ] **Cenário 3: Bloqueio de Cancelamento de Pedidos em Produção:**
  - **Dado que** um pedido já se encontra no status `EM_PRODUCAO` ou `CONCLUIDO`,
  - **Quando** o usuário tenta cancelar o pedido,
  - **Então** o sistema bloqueia a ação informando que pedidos em fase de corte ou concluídos não podem ser cancelados diretamente via sistema sem autorização da gerência de fábrica.
- [ ] **Cenário 4: Reabertura do Orçamento após Cancelamento:**
  - **Dado que** um pedido de venda foi cancelado por desistência do modelo pelo cliente,
  - **Quando** o vendedor acessa o orçamento de origem vinculado,
  - **Então** o botão "Reabrir Orçamento para Edição" torna-se disponível,
  - **E** ao acioná-lo, o status do orçamento retorna para `DRAFT` (Rascunho), liberando itens e descontos para novos ajustes comerciais.
- [ ] **Cenário 5: Listagem Paginada e Filtros de Pedidos:**
  - **Dado que** o usuário acessa a página `/pedidos`,
  - **Quando** aplica filtros por código, status ou cliente,
  - **Então** a listagem exibe resultados paginados em cards/tabela com badges coloridos de status (`OrderStatusBadge`) e prazos de entrega em destaque.

---

### 📌 US-16: Emissão do Comprovante do Pedido de Venda em PDF (Priority: P2)

**🎯 Objetivo de Negócio:**
Como vendedor da Alumiportas, desejo emitir e baixar o Comprovante Oficial do Pedido de Venda em PDF com layout profissional e elegante, contendo resumo financeiro dos itens contratados, condições de pagamento, endereço de entrega e cronograma prometido, para entregar uma via formal impressa ou digital ao cliente.

**Critérios de Aceitação (Dado / Quando / Então):**

- [ ] **Cenário 1: Emissão do Comprovante Oficial em PDF com Sucesso:**
  - **Dado que** o usuário visualiza um pedido ativo na página `OrderDetailPage`,
  - **Quando** clica no botão "Emitir Comprovante do Pedido",
  - **Então** o sistema gera o arquivo `application/pdf` em menos de 2 segundos,
  - **E** o documento exibe cabeçalho oficial com dados da Alumiportas, número do pedido (`PED-YYYY-NNNN`), dados do cliente, cronograma (data de emissão e previsão de entrega), tabela detalhada dos itens com valores congelados, descontos e total líquido contratado.
- [ ] **Cenário 2: Exibição das Condições Comerciais e Informações Legais:**
  - **Dado que** o comprovante do pedido é gerado,
  - **Quando** a seção de fechamento é inspecionada,
  - **Então** constam a forma de pagamento acertada, observações contratuais e campos para assinaturas do cliente e da empresa.
- [ ] **Cenário 3: Paginação e Rodapé Institucional:**
  - **Dado que** um pedido com muitas esquadrias ultrapassa uma página A4,
  - **Quando** o motor OpenPDF renderiza o documento,
  - **Então** o documento realiza a quebra de página fluida com rodapé numerado "Página X de Y" e código do pedido em todas as páginas.
- [ ] **Cenário 4: Tratamento de Erro para Pedido Inexistente:**
  - **Dado que** é realizada uma requisição com identificador de pedido inexistente,
  - **Quando** o endpoint `GET /api/orders/{id}/pdf/comprovante` for invocado,
  - **Então** o backend responde com status HTTP `404 Not Found` no formato padronizado `ErrorResponse`.

---

## 4. Requisitos Funcionais (Pedidos de Venda)

1. **RF01 - Conversão 1-para-1**: Cada orçamento só pode gerar **um único** Pedido de Venda ativo. Orçamentos já convertidos não podem ser convertidos novamente (bloqueio por chave única/regra de negócio).
2. **RF02 - Cópia Profunda (Deep Copy) dos Itens**: No momento da conversão, todos os itens do orçamento (`BudgetItem`) devem ser clonados para itens do pedido (`OrderItem`), preservando dimensões, cores, orientações, ferragens, preços unitários e subtotais.
3. **RF03 - Código Sequencial do Pedido**: O código do pedido deve seguir o padrão `PED-YYYY-NNNN` (ex: `PED-2026-0001`), reiniciando a numeração anualmente.
4. **RF04 - Prazos e Previsão**: O sistema sugere automaticamente `dataPrevisaoEntrega = dataAprovacao + 15 dias corridos`, permitindo alteração manual pelo vendedor.
5. **RF05 - Canais de Aprovação**: O sistema deve suportar os canais `WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL` com campo texto complementar para observações.
6. **RF06 - Máquina de Estados do Pedido**:
   - `CRIADO` / `AGUARDANDO_PRODUCAO` → `EM_PRODUCAO` → `CONCLUIDO`
   - Qualquer status anterior a `EM_PRODUCAO` pode transicionar para `CANCELADO` com justificativa obrigatória.
7. **RF07 - Listagem e Filtros de Pedidos**: Permitir listar pedidos paginados com filtros por status, período de entrega e busca por cliente ou código.
8. **RF08 - Emissão de Comprovante**: Gerar documento de confirmação do pedido em PDF com identidade visual da Alumiportas.

---

## 5. Critérios de Sucesso (Technology-Agnostic)

1. **Eficiência Operacional**: A conversão de um orçamento em pedido de venda deve ocorrer em **menos de 1 segundo** após o clique do usuário.
2. **Integridade Financeira (Zero Divergência)**: 100% dos pedidos gerados devem apresentar exata paridade com os valores aprovados no orçamento de origem.
3. **Rastreabilidade Bidirecional**: A partir de um pedido, deve ser possível navegar até o orçamento original, e a partir do orçamento aprovado, acessar o pedido gerado em 1 clique.
4. **Disponibilidade do Comprovante**: O comprovante do pedido em PDF deve ser gerado e disponibilizado para download em menos de 2 segundos.

---

## 6. Entidades Principais

```text
Order (Pedido de Venda)
├── id (BIGSERIAL PK)
├── codigo (VARCHAR(20) - ex: PED-2026-0001, UNIQUE)
├── orcamento_id (BIGINT FK -> budgets, UNIQUE, NOT NULL)
├── cliente_nome, cliente_telefone, cliente_endereco (VARCHAR / TEXT)
├── status (Enum: CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO)
├── canal_aprovacao (Enum: WHATSAPP, PRESENCIAL, TELEFONE, EMAIL)
├── data_aprovacao (DATE NOT NULL)
├── data_previsao_entrega (DATE NOT NULL)
├── data_conclusao (DATE NULLABLE)
├── valor_bruto, valor_desconto, taxa_instalacao, taxa_frete, valor_liquido (NUMERIC(12,2))
├── condicao_pagamento, observacoes_pagamento, observacoes (VARCHAR / TEXT)
├── justificativa_cancelamento (TEXT NULLABLE)
├── created_at, updated_at (TIMESTAMP)
└── items (1:N -> OrderItem)

OrderItem (Item do Pedido de Venda - Snapshot)
├── id (BIGSERIAL PK)
├── order_id (BIGINT FK -> orders, NOT NULL)
├── product_id (BIGINT FK -> products, NULLABLE)
├── descricao (VARCHAR(300) NOT NULL)
├── largura_mm, altura_mm (INTEGER NOT NULL)
├── quantidade (INTEGER NOT NULL)
├── cor_aluminio, tipo_vidro, orientacao_abertura, ferragens (VARCHAR / TEXT)
├── valor_unitario, valor_total (NUMERIC(12,2) NOT NULL)
└── ordem (INTEGER NOT NULL)
```

---

## 7. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Canal de Aprovação)**: Seleção simples via Enum (`WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL`) + campo de texto para observações comerciais.
- **Q2 (Cancelamento de Pedido)**: O orçamento de origem permanece no status `APROVADO`. O sistema disponibiliza ação explícita de "Reabrir Orçamento para Edição", mantendo a rastreabilidade histórica.
- **Q3 (Prazo Padrão de Entrega)**: Preenchimento automático com data de aprovação + 15 dias corridos, totalmente editável pelo vendedor.

---

## 8. Premissas do Projeto (Assumptions)

- O orçamento de origem já possui todas as validações de descontos e dados do cliente validados pela Sprint 4 e Sprint 5.
- A geração das Ordens de Produção (OP) fabris e etiquetas será tratada nas sprints de fábrica subsequentes, consumindo os dados dos pedidos gerados a partir dos orçamentos aprovados.