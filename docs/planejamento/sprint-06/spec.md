# Feature Specification: Sprint 6 — Gestão de Pedidos de Venda, Lock de Preços e Comprovante Oficial

**Feature**: `002-pedidos-lock-precos`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Período da Sprint 06**: 29/09/2026 a 12/10/2026  
**Created**: 2026-08-27  
**Updated**: 2026-09-28  
**Status**: APPROVED (Reestruturada como Sprint Ativa — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

A **Sprint 06** marca a transição oficial do AlumiGest da esteira comercial para a esteira fabril e de execução. Após o encerramento da Sprint 05 (onde foram consolidados descontos, PDFs de orçamentos e a homologação da Release 1), a aprovação do cliente transforma uma proposta comercial em um **Pedido de Venda vinculante (`Order`)**.

O objetivo primordial desta sprint é garantir a formalização contratual da venda através de:
1. **Conversão Automatizada (1-para-1)**: Transformação de orçamento aprovado em pedido com geração de código oficial sequencial anual (`PED-YYYY-NNNN`) e vínculo unívoco com o orçamento de origem.
2. **Snapshot Imutável e Lock de Preços**: Clonagem profunda (*deep copy*) de itens, dimensões, preços unitários e custos calculados, blindando o pedido contra reajustes futuros no catálogo de materiais ou tabelas de preços.
3. **Máquina de Estados e Cancelamento Controlado**: Ciclo de vida estrito (`CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO` ou `CANCELADO`), com justificativa obrigatória e possibilidade de reabertura do orçamento de origem para novas negociações.
4. **Emissão de Comprovante Oficial em PDF**: Geração de documento institucional A4 com OpenPDF contendo todas as especificações das esquadrias, cronograma de entrega e condições de pagamento acertadas.

---

## 2. 👥 Histórias de Usuário da Sprint 06

### 📌 US-13: Aprovar Orçamento e Converter em Pedido de Venda (Priority: P1) 🎯 MVP
**Issue GitHub**: [#137](https://github.com/ADS-IFPB-SR/alumigest/issues/137)

#### 🎯 Objetivo de Negócio
> **Como** vendedor ou gerente comercial da Alumiportas,  
> **Desejo** aprovar formalmente uma proposta orçamentária e convertê-la automaticamente em um Pedido de Venda oficial (`PED-YYYY-NNNN`), registrando o canal de aprovação (WhatsApp, Presencial, Telefone, E-mail), observações e a data de entrega acordada,  
> **Para que** seja firmado o contrato de venda e liberado o pedido para o fluxo fabril com rastreabilidade completa.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Conversão Bem-Sucedida de Orçamento em Pedido de Venda**
  - **Dado que** o vendedor visualiza um orçamento com status `DRAFT` ou `SENT` na página `BudgetDetailPage`
  - **Quando** clica no botão "Aprovar e Gerar Pedido", preenche o canal de aprovação (ex: `WHATSAPP`), confirma a data de previsão de entrega e submete o formulário
  - **Então** o sistema cria um novo Pedido de Venda com código sequencial anual no padrão `PED-YYYY-NNNN`
  - **E** o status do orçamento de origem é atualizado automaticamente para `APPROVED`, vinculando-se de forma unívoca ao pedido gerado
  - **E** o usuário é redirecionado para a página de detalhes do novo pedido (`/pedidos/:id`) com notificação toast de sucesso.

- [ ] **Cenário 2: Sugestão Automática de Data de Entrega (+15 Dias Corridos)**
  - **Dado que** o modal de aprovação de orçamento é aberto
  - **Quando** o formulário é inicializado
  - **Então** o campo `dataPrevisaoEntrega` é pré-preenchido automaticamente com a data atual $+15$ dias corridos
  - **E** o vendedor pode editar essa data manualmente antes da confirmação final caso acorde prazo diferenciado com o cliente.

- [ ] **Cenário 3: Bloqueio de Conversão Duplicada (Invariante 1-para-1)**
  - **Dado que** um orçamento já foi convertido previamente em um pedido ativo
  - **Quando** qualquer usuário tenta disparar uma nova conversão para o mesmo `orcamentoId`
  - **Então** o backend rejeita a solicitação retornando status HTTP `409 Conflict` (ou `422 Unprocessable Entity`)
  - **E** a interface desabilita o botão de aprovação, indicando que o pedido já foi emitido com link direto para navegação.

- [ ] **Cenário 4: Bloqueio de Conversão para Orçamentos em Status Inválido**
  - **Dado que** um orçamento possui status `CANCELLED`, `REJECTED` ou já está `APPROVED`
  - **Quando** o endpoint `POST /api/orders/from-budget/{budgetId}` for invocado
  - **Então** o backend bloqueia a operação lançando `BusinessException` com mensagem em português ("Apenas orçamentos em rascunho ou enviados podem ser convertidos em pedido").

- [ ] **Cenário 5: Validação de Dados Obrigatórios na Aprovação**
  - **Dado que** o modal de aprovação está aberto
  - **Quando** o usuário tenta submeter o formulário sem selecionar o canal de aprovação ou informando data no passado
  - **Então** o schema Zod bloqueia a submissão e exibe mensagens de erro claras abaixo dos respectivos campos.

---

### 📌 US-14: Snapshot Imutável e Lock de Preços do Pedido (Priority: P1)
**Issue GitHub**: [#138](https://github.com/ADS-IFPB-SR/alumigest/issues/138)

#### 🎯 Objetivo de Negócio
> **Como** gestor financeiro e responsável pela produção da Alumiportas,  
> **Desejo** que o Pedido de Venda congele integralmente todos os valores financeiros, custos de matéria-prima, margens, descontos e especificações das esquadrias através de uma clonagem profunda (*deep copy*),  
> **Para que** alterações posteriores no catálogo de materiais ou tabelas de preços não modifiquem os valores e configurações acordados com o cliente.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Clonagem Profunda dos Itens do Orçamento (Deep Copy)**
  - **Dado que** um orçamento com itens compostos de esquadria e itens avulsos é aprovado
  - **Quando** o pedido é gerado no banco de dados
  - **Então** cada `BudgetItem` gera um registro independente em `OrderItem`
  - **E** todas as medidas (largura, altura em mm), modelo/tipologia, cores, especificações de vidro, ferragens, preços unitários e subtotais são replicados em colunas próprias da tabela `order_items`.

- [x] **Cenário 2: Blindagem contra Reajuste Futuro de Preços no Catálogo**
  - **Dado que** um pedido de venda foi criado no dia $D$ com valor total de R$ 3.500,00
  - **Quando** no dia $D + 5$ os preços dos perfis de alumínio e vidros forem reajustados em 20% no módulo de catálogo
  - **Então** o valor unitário e o valor total do pedido e de seus itens permanecem rigorosamente inalterados em R$ 3.500,00
  - **E** consultas e relatórios continuam exibindo o snapshot financeiro contratado.

- [x] **Cenário 3: Imutabilidade Cadastral das Esquadrias do Pedido**
  - **Dado que** o pedido foi formalizado
  - **Quando** um usuário tenta editar medidas ou excluir itens diretamente no pedido aprovado
  - **Então** o sistema não permite a alteração direta de itens contratuais, exigindo cancelamento formal e renegociação em caso de mudanças de projeto.

---

### 📌 US-15: Gestão de Status, Prazos e Cancelamento de Pedidos (Priority: P2)
**Issue GitHub**: [#139](https://github.com/ADS-IFPB-SR/alumigest/issues/139)

#### 🎯 Objetivo de Negócio
> **Como** encarregado de fábrica e equipe de atendimento,  
> **Desejo** gerenciar o ciclo de vida do pedido de venda através de status bem definidos (`CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO` ou `CANCELADO`), com registro obrigatório de justificativa em cancelamentos e possibilidade de reabertura do orçamento de origem,  
> **Para que** seja mantido o controle operacional e comercial da fábrica com auditoria clara.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Transição Regular do Fluxo de Produção**
  - **Dado que** um pedido está com status `CRIADO`
  - **Quando** o encarregado envia o pedido para a fábrica
  - **Então** o status avança para `AGUARDANDO_PRODUCAO`, e posteriormente para `EM_PRODUCAO` e `CONCLUIDO`
  - **E** a data de conclusão real é registrada automaticamente quando o pedido atinge o status `CONCLUIDO`.

- [ ] **Cenário 2: Cancelamento de Pedido com Justificativa Obrigatória**
  - **Dado que** um pedido ainda não entrou em produção física (`CRIADO` ou `AGUARDANDO_PRODUCAO`)
  - **Quando** o usuário aciona a ação de cancelamento
  - **Então** o sistema exige o preenchimento de justificativa formal com no mínimo 10 caracteres (`orderCancelSchema`)
  - **E** o pedido tem seu status atualizado para `CANCELADO`, persistindo a justificativa e o autor da ação para fins de auditoria.

- [ ] **Cenário 3: Bloqueio de Cancelamento de Pedidos em Produção**
  - **Dado que** um pedido já se encontra no status `EM_PRODUCAO` ou `CONCLUIDO`
  - **Quando** o usuário tenta cancelar o pedido
  - **Então** o sistema bloqueia a ação informando que pedidos em fase de corte ou concluídos não podem ser cancelados diretamente via sistema sem autorização da gerência de fábrica.

- [ ] **Cenário 4: Reabertura do Orçamento após Cancelamento**
  - **Dado que** um pedido de venda foi cancelado por desistência do modelo pelo cliente
  - **Quando** o vendedor acessa o orçamento de origem vinculado
  - **Então** o botão "Reabrir Orçamento para Edição" torna-se disponível
  - **E** ao acioná-lo, o status do orçamento retorna para `DRAFT` (Rascunho), liberando itens e descontos para novos ajustes comerciais.

---

### 📌 US-16: Emissão do Comprovante do Pedido de Venda em PDF (Priority: P2)
**Issue GitHub**: [#140](https://github.com/ADS-IFPB-SR/alumigest/issues/140)

#### 🎯 Objetivo de Negócio
> **Como** vendedor da Alumiportas,  
> **Desejo** emitir e baixar o Comprovante Oficial do Pedido de Venda em PDF com layout profissional e elegante, contendo resumo financeiro dos itens contratados, condições de pagamento, endereço de entrega e cronograma prometido,  
> **Para que** eu possa entregar uma via formal impressa ou digital ao cliente.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Emissão do Comprovante Oficial em PDF com Sucesso**
  - **Dado que** o usuário visualiza um pedido ativo na página `OrderDetailPage`
  - **Quando** clica no botão "Emitir Comprovante do Pedido"
  - **Então** o sistema gera o arquivo `application/pdf` em menos de 2 segundos
  - **E** o documento exibe cabeçalho oficial com dados da Alumiportas, número do pedido (`PED-YYYY-NNNN`), dados do cliente, cronograma (data de emissão e previsão de entrega), tabela detalhada dos itens com valores congelados, descontos e total líquido contratado.

- [ ] **Cenário 2: Exibição das Condições Comerciais e Informações Legais**
  - **Dado que** o comprovante do pedido é gerado
  - **Quando** a seção de fechamento é inspecionada
  - **Então** constam a forma de pagamento acertada, observações contratuais e campos para assinaturas do cliente e da empresa.

- [ ] **Cenário 3: Paginação e Rodapé Institucional**
  - **Dado que** um pedido com muitas esquadrias ultrapassa uma página A4
  - **Quando** o motor OpenPDF renderiza o documento
  - **Então** o documento realiza a quebra de página fluida com rodapé numerado "Página X de Y" e código do pedido em todas as páginas.

- [ ] **Cenário 4: Tratamento de Erro para Pedido Inexistente**
  - **Dado que** é realizada uma requisição com identificador de pedido inexistente
  - **Quando** o endpoint `GET /api/orders/{id}/pdf/comprovante` for invocado
  - **Então** o backend responde com status HTTP `404 Not Found` no formato padronizado `ErrorResponse`.

---

## 3. Requisitos Funcionais do Módulo de Pedidos

1. **RF01 - Conversão 1-para-1**: Cada orçamento só pode gerar **um único** Pedido de Venda ativo. Orçamentos já convertidos não podem ser convertidos novamente (bloqueio por constraint UNIQUE `orcamento_id` e validação na camada de serviço).
2. **RF02 - Cópia Profunda (Deep Copy) dos Itens**: No momento da conversão, todos os itens do orçamento (`BudgetItem`) devem ser clonados para itens do pedido (`OrderItem`), preservando dimensões, cores, orientações, ferragens, preços unitários e subtotais.
3. **RF03 - Código Sequencial Anual**: O código do pedido deve seguir o padrão `PED-YYYY-NNNN` (ex: `PED-2026-0001`), reiniciando a numeração anualmente.
4. **RF04 - Prazos e Previsão**: O sistema sugere automaticamente `dataPrevisaoEntrega = dataAprovacao + 15 dias corridos`, permitindo alteração manual pelo vendedor.
5. **RF05 - Canais de Aprovação**: O sistema deve suportar os canais `WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL` com campo texto complementar para observações.
6. **RF06 - Máquina de Estados do Pedido**:
   - `CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO`
   - Estados `CRIADO` e `AGUARDANDO_PRODUCAO` podem transicionar para `CANCELADO` com justificativa obrigatória ($\ge 10$ caracteres).
7. **RF07 - Listagem e Filtros**: Permitir listar pedidos paginados com filtros por status, período de entrega e busca por cliente ou código.
8. **RF08 - Emissão de Comprovante**: Gerar documento de confirmação do pedido em PDF via OpenPDF com identidade visual da Alumiportas.

---

## 4. Entidades Principais e Modelo de Dados

```text
Order (Pedido de Venda)
├── id (UUID PK)
├── codigo (VARCHAR(20) - ex: PED-2026-0001, UNIQUE)
├── orcamento_id (UUID FK -> tb_budgets, UNIQUE, NOT NULL)
├── cliente_id (UUID FK -> tb_clients, NULLABLE)
├── cliente_nome, cliente_telefone, cliente_endereco (VARCHAR / TEXT)
├── status (Enum: CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO)
├── canal_aprovacao (Enum: WHATSAPP, PRESENCIAL, TELEFONE, EMAIL)
├── data_aprovacao (DATE NOT NULL)
├── data_previsao_entrega (DATE NOT NULL)
├── data_conclusao (DATE NULLABLE)
├── valor_bruto, valor_desconto, taxa_instalacao, taxa_frete, valor_liquido (NUMERIC(12,2))
├── condicao_pagamento, observacoes_pagamento, observacoes (VARCHAR / TEXT)
├── justificativa_cancelamento (TEXT NULLABLE)
├── ativo (BOOLEAN DEFAULT TRUE) -- Soft Delete
├── created_at, updated_at (TIMESTAMP)
└── items (1:N -> OrderItem)

OrderItem (Item do Pedido de Venda - Snapshot Imutável)
├── id (UUID PK)
├── order_id (UUID FK -> tb_orders, NOT NULL)
├── product_id (UUID FK -> tb_products, NULLABLE)
├── descricao (VARCHAR(300) NOT NULL)
├── largura_mm, altura_mm (INTEGER NOT NULL)
├── quantidade (INTEGER NOT NULL)
├── cor_aluminio, tipo_vidro, orientacao_abertura, ferragens (VARCHAR / TEXT)
├── template_config, handle_config, drilling_config (JSONB NULLABLE)
├── valor_unitario, valor_total (NUMERIC(12,2) NOT NULL)
└── ordem (INTEGER NOT NULL)
```

---

## 5. Critérios de Sucesso e Desempenho

1. **Eficiência na Conversão**: Conversão de orçamento em pedido em **menos de 1 segundo** via transação atômica `@Transactional`.
2. **Integridade Financeira (Zero Divergência)**: 100% dos pedidos gerados devem apresentar exata paridade com os valores aprovados no orçamento de origem.
3. **Imutabilidade Auditável**: Reajustes cadastrais em materiais nunca alteram pedidos já convertidos.
4. **Agilidade no PDF**: Comprovante oficial do pedido gerado em menos de 2 segundos.