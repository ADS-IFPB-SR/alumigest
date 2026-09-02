# Feature Specification: Sprint 5 — Aprovação de Orçamentos e Conversão em Pedidos de Venda (Lock de Preços)

**Feature**: `002-pedidos-lock-precos`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

No fluxo comercial da Alumiportas, após o cliente aprovar formalmente uma proposta orçamentária, a negociação deixa de ser uma estimativa e se torna um **contrato de venda vinculante (Pedido de Venda)**.

Atualmente, se os preços dos materiais base (perfis de alumínio, chapas de vidro, ferragens) sofrem reajuste na distribuidora ou no catálogo durante o período entre a aprovação e a fabricação, o sistema não pode alterar os valores contratados com o cliente. O pedido deve manter um **snapshot imutável (Lock de Preços)** de todos os valores financeiros, medidas e especificações técnicas acordadas.

Esta sprint entrega:
1. **Formalização da Aprovação do Orçamento**: Registro da aprovação com seleção de canal (WhatsApp, Presencial, Telefone, E-mail) e observações comerciais.
2. **Conversão Automatizada em Pedido de Venda**: Geração instantânea do pedido (`PED-YYYY-NNNN`) a partir do orçamento aprovado, mantendo rastreabilidade total.
3. **Mecanismo de Lock de Preços & Snapshot Técnico**: Congelamento de preços unitários, descontos, totais e configurações dos itens para proteger a margem e o contrato comercial.
4. **Gestão de Ciclo de Vida do Pedido**: Controle de status do pedido (`CRIADO`, `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`, `CANCELADO`) com sugestão automática de data de entrega (+15 dias corridos editáveis).
5. **Política de Cancelamento**: Cancelamento com justificativa obrigatória; o orçamento de origem permanece no histórico com opção explícita de reabertura para renegociação.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-13: Aprovar Orçamento e Converter em Pedido de Venda

> Permitir a conversão de um orçamento aprovado em Pedido de Venda oficial, registrando o canal de aprovação e gerando código sequencial de pedido.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-13.1**: Criar package `br.edu.ifpb.alumigest.orders` e diretório `frontend/src/features/orders`
- **US-13.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V9__create_orders_schema.sql` com tabelas `orders` e `order_items`, constraints UNIQUE e índices
- **US-13.3**: Criar enum `OrderStatus` (CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderStatus.java`
- **US-13.4**: Criar enum `ApprovalChannel` com labels em português (WHATSAPP, PRESENCIAL, TELEFONE, EMAIL) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/ApprovalChannel.java`
- **US-13.5**: Criar entidade JPA `Order` com mapeamento de todos os campos financeiros, cliente, orcamentoId (UNIQUE) e soft delete em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java`
- **US-13.6**: Criar entidade JPA `OrderItem` com snapshot imutável de itens em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderItem.java`
- **US-13.7**: Criar repositório `OrderRepository` com busca por código, status e cliente em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderRepository.java`
- **US-13.8**: Criar repositório `OrderItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderItemRepository.java`
- **US-13.9**: Criar gerador de código sequencial `OrderCodeGenerator` (padrão PED-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderCodeGenerator.java`
- **US-13.10**: Criar record `OrderConvertRequest` (canalAprovacao, dataPrevisaoEntrega, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderConvertRequest.java`
- **US-13.11**: Criar record `OrderResponse` (resposta completa com lista de itens e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderResponse.java`
- **US-13.12**: Criar record `OrderSummaryResponse` para listagem paginada em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderSummaryResponse.java`
- **US-13.13**: Criar record `OrderItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderItemResponse.java`
- **US-13.14**: Criar mapper MapStruct `OrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/mapper/OrderMapper.java`
- **US-13.15**: Implementar método `converterOrcamentoEmPedido(Long orcamentoId, OrderConvertRequest request)` no `OrderService` com validação de status de orçamento e atualização para APROVADO em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderService.java`
- **US-13.16**: Implementar clonagem profunda (deep copy) dos itens do orçamento para `OrderItem` no `OrderService` garantindo lock de preços
- **US-13.17**: Implementar métodos `buscarPorId()` e `listar()` com paginação e filtros no `OrderService`
- **US-13.18**: Criar `OrderController` com endpoints POST /api/orders/from-budget/{budgetId}, GET /api/orders/{id}, GET /api/orders em `backend/src/main/java/br/edu/ifpb/alumigest/orders/controller/OrderController.java`
- **US-13.19**: Criar testes unitários do `OrderService` cobrindo conversão bem-sucedida, bloqueio de conversão duplicada e teste de imutabilidade de itens em `backend/src/test/java/br/edu/ifpb/alumigest/orders/service/OrderServiceTest.java`
- **US-13.20**: Criar testes de integração dos endpoints REST do `OrderController` com base H2 em `backend/src/test/java/br/edu/ifpb/alumigest/orders/controller/OrderControllerIntegrationTest.java`
- **US-13.21**: Criar interfaces TypeScript (Order, OrderItem, OrderConvertRequest, etc.) em `frontend/src/features/orders/types/order.ts`
- **US-13.22**: Criar schemas Zod de validação (orderConvertSchema) em `frontend/src/features/orders/schemas/orderSchema.ts`
- **US-13.23**: Criar serviço de API Axios em `frontend/src/features/orders/services/orderApi.ts`
- **US-13.24**: Criar custom hooks React Query (useOrders, useOrder, useConvertBudget) em `frontend/src/features/orders/hooks/useOrders.ts`
- **US-13.25**: Criar modal `OrderApprovalModal` (seleção de canal de aprovação, sugestão automática de data +15 dias e confirmação) em `frontend/src/features/orders/components/OrderApprovalModal.tsx`
- **US-13.26**: Integrar o botão "Aprovar e Gerar Pedido" na tela de detalhes do orçamento (`BudgetDetailPage.tsx`) abrindo o modal de aprovação
- **US-13.27**: Criar componente `OrderStatusBadge` em `frontend/src/features/orders/components/OrderStatusBadge.tsx`
- **US-13.28**: Criar componente `OrderItemsTable` exibindo a tabela dos itens contratados com valores congelados em `frontend/src/features/orders/components/OrderItemsTable.tsx`
- **US-13.29**: Criar página `OrderListPage` com listagem paginada, busca e filtros em `frontend/src/pages/OrderListPage.tsx`
- **US-13.30**: Criar página `OrderDetailPage` com visualização detalhada do pedido em `frontend/src/pages/OrderDetailPage.tsx`
- **US-13.31**: Configurar rotas `/pedidos` e `/pedidos/:id` no React Router em `frontend/src/App.tsx`

### 📌 US-14: Snapshot Imutável e Lock de Preços do Pedido

> Garantir o congelamento (snapshot imutável) dos preços dos insumos, mão de obra e especificações no momento da conversão, blindando o pedido contra reajustes futuros do catálogo.

#### Sub-tarefas Técnicas (Sub-issues):

### 📌 US-15: Gestão de Status, Prazos e Cancelamento de Pedidos

> Acompanhar o ciclo de vida do pedido (CRIADO -> AGUARDANDO_PRODUCAO -> EM_PRODUCAO -> PRONTO -> EM_INSTALACAO -> CONCLUIDO / CANCELADO), com justificativa de cancelamento e reabertura de orçamento.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-15.1**: Criar record `OrderCancelRequest` (justificativa obrigatória com min 10 caracteres) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderCancelRequest.java`
- **US-15.2**: Implementar método `cancelarPedido(Long id, OrderCancelRequest request)` no `OrderService` validando que o pedido não está em produção
- **US-15.3**: Adicionar endpoint PATCH /api/orders/{id}/cancel no `OrderController`
- **US-15.4**: Criar modal `OrderCancelModal` com campo de justificativa no frontend em `frontend/src/features/orders/components/OrderCancelModal.tsx`
- **US-15.5**: Adicionar botão "Reabrir Orçamento para Edição" na tela do orçamento quando o pedido vinculado estiver cancelado

### 📌 US-16: Emissão do Comprovante do Pedido de Venda

> Emitir comprovante institucional do pedido de venda em PDF com resumo financeiro, especificações técnicas e prazo de entrega prometido ao cliente.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-16.1**: Criar `OrderPdfService` com layout institucional para comprovante do pedido usando OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderPdfService.java`
- **US-16.2**: Adicionar endpoint GET /api/orders/{id}/pdf/comprovante no `OrderController`
- **US-16.3**: Criar teste unitário de geração do PDF do comprovante no `OrderPdfServiceTest`
- **US-16.4**: Adicionar botão "Emitir Comprovante do Pedido" e integração de download na `OrderDetailPage`
- **US-16.5**: Adicionar documentação OpenAPI/Swagger nos endpoints do `OrderController`
- **US-16.6**: Adicionar item "Pedidos de Venda" no menu de navegação do frontend
- **US-16.7**: Executar validação completa do `quickstart.md` da Sprint 5 e documentar checklist

## 3. Requisitos Funcionais

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

## 4. Critérios de Sucesso (Technology-Agnostic)

1. **Eficiência Operacional**: A conversão de um orçamento em pedido de venda deve ocorrer em **menos de 1 segundo** após o clique do usuário.
2. **Integridade Financeira (Zero Divergência)**: 100% dos pedidos gerados devem apresentar exata paridade com os valores aprovados no orçamento de origem.
3. **Rastreabilidade Bidirecional**: A partir de um pedido, deve ser possível navegar até o orçamento original, e a partir do orçamento aprovado, acessar o pedido gerado em 1 clique.
4. **Disponibilidade do Comprovante**: O comprovante do pedido em PDF deve ser gerado e disponibilizado para download em menos de 2 segundos.

---

## 5. Entidades Principais

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

## 6. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Canal de Aprovação)**: Seleção simples via Enum (`WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL`) + campo de texto para observações comerciais.
- **Q2 (Cancelamento de Pedido)**: O orçamento de origem permanece no status `APROVADO`. O sistema disponibiliza ação explícita de "Reabrir Orçamento para Edição", mantendo a rastreabilidade histórica.
- **Q3 (Prazo Padrão de Entrega)**: Preenchimento automático com data de aprovação + 15 dias corridos, totalmente editável pelo vendedor.

---

## 7. Premissas do Projeto (Assumptions)

- O orçamento de origem já possui todas as validações de descontos e dados do cliente validados pela Sprint 4.
- A geração das Ordens de Produção (OP) fabris e etiquetas QR Code será tratada na Sprint 6, consumindo os dados dos pedidos gerados nesta Sprint 5.