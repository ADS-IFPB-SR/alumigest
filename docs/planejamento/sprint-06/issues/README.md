# 📋 Issues de Implementação — Sprint 06 — Pedidos de Venda, Lock de Preços e Comprovante Oficial

> Todas as tarefas seguem o padrão decimal `US-XX.Y` da Sprint 05, reestruturadas como **Fatias Verticais (*Thin Vertical Slices*)** com duração máxima de **≤ 4 horas** cada.  
> Cada issue possui checklist executável, testes unitários esperados e a Definition of Done (DoD) com 7 critérios padronizados.

---

## 📦 US-13: Aprovar Orçamento e Converter em Pedido de Venda

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-13.1](US-13.1-scaffolding-e-infraestrutura-do-modulo-orders/issue.md) | Scaffolding e Infraestrutura do Módulo de Pedidos (Migration Flyway V19, pacotes, enums e entidades base) | ~1h | Scaffolding | 🔲 Aberta |
| [US-13.2](US-13.2-conversao-de-orcamento-em-pedido-backend-core/issue.md) | Conversão de Orçamento em Pedido no Backend Core (OrderCodeGenerator, OrderService, endpoint POST) | ~4h | Backend Core | 🔲 Aberta |
| [US-13.3](US-13.3-modal-aprovacao-e-conversao-frontend/issue.md) | Modal de Aprovação e Ação de Conversão na Tela de Orçamento (OrderApprovalModal e botão na BudgetDetailPage) | ~3h | Frontend UI | 🔲 Aberta |
| [US-13.4](US-13.4-listagem-paginada-de-pedidos-fullstack/issue.md) | Listagem Paginada de Pedidos de Venda com Filtros (Full-Stack: GET /orders e OrderListPage) | ~4h | Full-Stack | 🔲 Aberta |
| [US-13.5](US-13.5-detalhamento-do-pedido-de-venda-fullstack/issue.md) | Visualização Detalhada do Pedido de Venda (Full-Stack: GET /orders/{id} e OrderDetailPage) | ~3h | Full-Stack | 🔲 Aberta |

---

## 📦 US-14: Snapshot Imutável e Lock de Preços do Pedido

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-14.1](US-14.1-snapshot-imutavel-lock-precos-deep-copy/issue.md) | Snapshot Imutável, Lock de Preços e Tabela de Itens Congelados (Full-Stack: Deep copy e OrderItemsTable) | ~4h | Full-Stack | 🔲 Aberta |

---

## 📦 US-15: Gestão de Status, Prazos e Cancelamento de Pedidos

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-15.1](US-15.1-maquina-estados-e-cancelamento-de-pedidos/issue.md) | Máquina de Estados e Cancelamento de Pedidos com Justificativa (Full-Stack: PATCH /cancel e OrderCancelModal) | ~4h | Full-Stack | 🔲 Aberta |
| [US-15.2](US-15.2-reabertura-de-orcamento-apos-cancelamento/issue.md) | Reabertura de Orçamento após Cancelamento de Pedido (Ajuste na máquina do BudgetService e botão na UI) | ~2h | Full-Stack | 🔲 Aberta |

---

## 📦 US-16: Emissão do Comprovante do Pedido de Venda em PDF

| Sub-Task | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| [US-16.1](US-16.1-comprovante-oficial-do-pedido-em-pdf-openpdf/issue.md) | Comprovante Oficial do Pedido em PDF via OpenPDF (Full-Stack: OrderPdfService e download na OrderDetailPage) | ~4h | Full-Stack | 🔲 Aberta |
| [US-16.2](US-16.2-navegacao-openapi-swagger-e-contratos/issue.md) | Navegação no Sidebar, Documentação OpenAPI/Swagger e Contratos (Menu lateral e Swagger UI) | ~2h | Frontend & Docs | 🔲 Aberta |
| [US-16.3](US-16.3-testes-de-integracao-backend-mockmvc-h2/issue.md) | Bateria de Testes de Integração do Backend (MockMvc + H2 cobrindo todos os endpoints REST) | ~3h | Testes Integração | 🔲 Aberta |
| [US-16.4](US-16.4-testes-e2e-sistema-e-validacao-quickstart/issue.md) | Testes de Sistema E2E, Validação BDD e Homologação do Quickstart (Cypress/Playwright e quickstart.md) | ~4h | Testes E2E / Sistema | 🔲 Aberta |
