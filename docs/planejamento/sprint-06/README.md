# 📌 Sprint 06 — Pedidos de Venda, Lock de Preços e Comprovante Oficial

**Período Oficial da Sprint 06**: 29/09/2026 a 12/10/2026  
**Status**: 🔵 Planejada / Pronta para Execução  
**Total de Tarefas**: 12 Fatias Verticais (*Thin Vertical Slices* ≤ 4h cada)  
**Esforço Total Estimado**: ~38 horas (31 Story Points)

Esta pasta contém o pacote completo de engenharia da **Sprint 06** do projeto **AlumiGest**, compreendendo as User Stories **US-13, US-14, US-15 e US-16**, devidamente alinhadas e construídas sobre a base consolidada da **Sprint 05** (Orçamentos, Descontos, AlumiStudio e PDFs OpenPDF).

---

## 🗺️ Mapa de Histórias e Fatias Verticais

### 📦 US-13: Aprovar Orçamento e Converter em Pedido de Venda
**Issue GitHub**: [#137](https://github.com/ADS-IFPB-SR/alumigest/issues/137) | **Prioridade**: P1 (MVP)

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-13.1](issues/US-13.1-scaffolding-e-infraestrutura-do-modulo-orders/issue.md) | Scaffolding e Infraestrutura do Módulo de Pedidos (Migration Flyway V19, pacotes, enums, entidades JPA base e repositórios) | ~1h | Scaffolding / Infra | 🔲 Aberta |
| [US-13.2](issues/US-13.2-conversao-de-orcamento-em-pedido-backend-core/issue.md) | Conversão de Orçamento em Pedido de Venda no Backend Core (OrderCodeGenerator PED-YYYY-NNNN, OrderService atômico, DTOs, mappers, endpoint POST e testes unitários) | ~4h | Backend Core / Regras | 🔲 Aberta |
| [US-13.3](issues/US-13.3-modal-aprovacao-e-conversao-frontend/issue.md) | Modal de Aprovação e Ação de Conversão na Tela de Orçamento (Tipos TS, Schema Zod, orderApi, hook useConvertBudget, OrderApprovalModal e botão na BudgetDetailPage) | ~3h | Frontend UI / API | 🔲 Aberta |
| [US-13.4](issues/US-13.4-listagem-paginada-de-pedidos-fullstack/issue.md) | Listagem Paginada de Pedidos de Venda com Filtros (Full-Stack: GET /api/orders paginado, OrderListPage, OrderStatusBadge, busca com debounce e filtros) | ~4h | Fatia Vertical Full-Stack | 🔲 Aberta |
| [US-13.5](issues/US-13.5-detalhamento-do-pedido-de-venda-fullstack/issue.md) | Visualização Detalhada do Pedido de Venda (Full-Stack: GET /api/orders/{id}, OrderDetailPage com cards informativos, resumo financeiro e vínculo do orçamento) | ~3h | Fatia Vertical Full-Stack | 🔲 Aberta |

---

### 📦 US-14: Snapshot Imutável e Lock de Preços do Pedido
**Issue GitHub**: [#138](https://github.com/ADS-IFPB-SR/alumigest/issues/138) | **Prioridade**: P1

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-14.1](issues/US-14.1-snapshot-imutavel-lock-precos-deep-copy/issue.md) | Snapshot Imutável, Lock de Preços e Tabela de Itens Congelados (Full-Stack: Deep copy em 3 níveis, snapshots JSONB, OrderItemsTable no front e testes unitários de blindagem contra reajuste do catálogo) | ~4h | Fatia Vertical Full-Stack | 🔲 Aberta |

---

### 📦 US-15: Gestão de Status, Prazos e Cancelamento de Pedidos
**Issue GitHub**: [#139](https://github.com/ADS-IFPB-SR/alumigest/issues/139) | **Prioridade**: P2

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-15.1](issues/US-15.1-maquina-estados-e-cancelamento-de-pedidos/issue.md) | Máquina de Estados e Cancelamento de Pedidos com Justificativa (Full-Stack: transições CRIADO a CONCLUIDO com dataConclusao automática, PATCH /cancel, OrderCancelModal e bloqueio estrito em produção) | ~4h | Fatia Vertical Full-Stack | 🔲 Aberta |
| [US-15.2](issues/US-15.2-reabertura-de-orcamento-apos-cancelamento/issue.md) | Reabertura de Orçamento após Cancelamento de Pedido (Ajuste na máquina de estados do BudgetService para APPROVED ➔ DRAFT condicional e botão contextual na BudgetDetailPage) | ~2h | Fatia Vertical Full-Stack | 🔲 Aberta |

---

### 📦 US-16: Emissão do Comprovante do Pedido de Venda em PDF
**Issue GitHub**: [#140](https://github.com/ADS-IFPB-SR/alumigest/issues/140) | **Prioridade**: P2

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-16.1](issues/US-16.1-comprovante-oficial-do-pedido-em-pdf-openpdf/issue.md) | Comprovante Oficial do Pedido de Venda em PDF via OpenPDF (Full-Stack: OrderPdfService layout A4 institucional, endpoint GET /pdf/comprovante e ação de download na OrderDetailPage) | ~4h | Fatia Vertical Full-Stack | 🔲 Aberta |
| [US-16.2](issues/US-16.2-navegacao-openapi-swagger-e-contratos/issue.md) | Navegação no Sidebar, Documentação OpenAPI/Swagger e Contratos (Atalho 'Pedidos de Venda' no sidebar, anotações Swagger no OrderController e atualização do contrato de API) | ~2h | Frontend & Docs | 🔲 Aberta |
| [US-16.3](issues/US-16.3-testes-de-integracao-backend-mockmvc-h2/issue.md) | Bateria de Testes de Integração do Backend (OrderControllerIntegrationTest cobrindo todos os endpoints REST, validações de erro, conflito 409 e downloads com base H2) | ~3h | Testes de Integração | 🔲 Aberta |
| [US-16.4](issues/US-16.4-testes-e2e-sistema-e-validacao-quickstart/issue.md) | Testes de Sistema E2E, Validação BDD e Homologação do Quickstart (Suite E2E Cypress/Playwright do fluxo ponta a ponta e execução completa do quickstart.md) | ~4h | Testes Sistema / E2E | 🔲 Aberta |

---

## 🔗 Documentos de Referência

- 📑 **Especificação Funcional**: [spec.md](spec.md)
- 📋 **Lista de Tarefas**: [tasks.md](tasks.md)
- 📐 **Modelo de Dados**: [data-model.md](data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](contracts/api-orders.md)
- ⏱️ **Guia de Estimativa de Horas**: [../guia-estimativa-horas.md](../guia-estimativa-horas.md#8-dimensionamento-oficial-de-tarefas--sprint-06)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](quickstart.md)
- 📜 **Constituição do Projeto**: [../constitution.md](../constitution.md)
