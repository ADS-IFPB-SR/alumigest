# 📋 Lista de Tarefas (Tasks) — Sprint 06 — Etiquetas de Identificação de Peças e Kanban de Produção

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido

> **Descrição**: Emitir etiquetas adesivas térmicas (100x50mm) contendo identificação física das esquadrias do pedido (código do pedido, cliente, medidas L x A mm, modelo da esquadria, cor do perfil, tipo de vidro e número do volume/peça), sem necessidade de QR Code ou scanner.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-17.1** | [US-17.1](issues/US-17.1-criar-servico-labelpdfservice-usando-openpdf/issue.md) Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça | 🔲 Pendente |
| **US-17.2** | [US-17.2](issues/US-17.2-adicionar-endpoint-get-api-orders-orderid-labels-pdf/issue.md) Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no backend retornando documento `application/pdf` | 🔲 Pendente |
| **US-17.3** | [US-17.3](issues/US-17.3-criar-teste-unitario-do-labelpdfservice/issue.md) Criar teste unitário do `LabelPdfService` validando geração de bytes e paginação exata por quantidade de peças | 🔲 Pendente |
| **US-17.4** | [US-17.4](issues/US-17.4-adicionar-botao-imprimir-etiquetas-no-frontend/issue.md) Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-17.1**: Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- [ ] **US-17.2**: Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no backend retornando documento `application/pdf`
- [ ] **US-17.3**: Criar teste unitário do `LabelPdfService` validando geração de bytes e paginação exata por quantidade de peças em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- [ ] **US-17.4**: Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`)

---

## 📦 US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda

> **Descrição**: Disponibilizar painel visual Kanban em tempo real para o encarregado e diretoria acompanharem o avanço de fabricação dos Pedidos de Venda nas etapas industriais oficiais (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-18.1** | [US-18.1](issues/US-18.1-implementar-endpoint-patch-api-orders-id-production-status/issue.md) Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com validação de transição e data de conclusão | 🔲 Pendente |
| **US-18.2** | [US-18.2](issues/US-18.2-criar-hook-react-query-useproductionkanban/issue.md) Criar hook React Query `useProductionKanban` e serviços Axios de produção no frontend | 🔲 Pendente |
| **US-18.3** | [US-18.3](issues/US-18.3-criar-componente-orderproductioncard-no-frontend/issue.md) Criar componente `OrderProductionCard` no frontend exibindo dados do pedido, cliente, alerta de prazo e total de peças | 🔲 Pendente |
| **US-18.4** | [US-18.4](issues/US-18.4-criar-componente-productionkanbanboard-com-colunas-de-status/issue.md) Criar componente `ProductionKanbanBoard` com colunas (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) | 🔲 Pendente |
| **US-18.5** | [US-18.5](issues/US-18.5-criar-pagina-productionkanbanpage-com-filtros-de-busca/issue.md) Criar página `ProductionKanbanPage` com filtros de busca por cliente, período de entrega e código do pedido | 🔲 Pendente |
| **US-18.6** | [US-18.6](issues/US-18.6-configurar-rota-producao-e-menu-lateral-no-frontend/issue.md) Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend | 🔲 Pendente |
| **US-18.7** | [US-18.7](issues/US-18.7-documentar-endpoints-no-openapi-swagger-e-testes-unitarios/issue.md) Documentar endpoints no OpenAPI/Swagger e criar testes unitários para a transição de status no backend | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-18.1**: Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com validação de transição e data de conclusão
- [ ] **US-18.2**: Criar hook React Query `useProductionKanban` e serviços Axios de produção no frontend em `frontend/src/features/production/hooks/useProductionKanban.ts`
- [ ] **US-18.3**: Criar componente `OrderProductionCard` no frontend exibindo dados do pedido, cliente, alerta de prazo e total de peças em `frontend/src/features/production/components/OrderProductionCard.tsx`
- [ ] **US-18.4**: Criar componente `ProductionKanbanBoard` com colunas (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) em `frontend/src/features/production/components/ProductionKanbanBoard.tsx`
- [ ] **US-18.5**: Criar página `ProductionKanbanPage` com filtros de busca por cliente, período de entrega e código do pedido em `frontend/src/pages/ProductionKanbanPage.tsx`
- [ ] **US-18.6**: Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend
- [ ] **US-18.7**: Documentar endpoints no OpenAPI/Swagger e criar testes unitários para a transição de status no backend em `backend/src/test/java/br/edu/ifpb/alumigest/order/OrderProductionStatusTest.java`
