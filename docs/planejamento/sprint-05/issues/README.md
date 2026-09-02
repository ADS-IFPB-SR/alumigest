# 📌 Issues de Implementação — Sprint 05 — Gestão de Pedidos de Venda (Orders)

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-13: Aprovar Orçamento e Converter em Pedido de Venda

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-13.1](US-13.1-criar-package-br-edu-ifpb-alumigest-orders-e-/issue.md) | Criar package `br.edu.ifpb.alumigest.orders` e diretório `frontend/src/features/orders` | `sprint-05` | 🔲 Aberta |
| [US-13.2](US-13.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V9__create_orders_schema.sql` com tabelas `orders` e `order_items`, constraints UNIQUE e índices | `sprint-05` | 🔲 Aberta |
| [US-13.3](US-13.3-criar-enum-orderstatus-criado-aguardando-prod/issue.md) | Criar enum `OrderStatus` (CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderStatus.java` | `sprint-05` | 🔲 Aberta |
| [US-13.4](US-13.4-criar-enum-approvalchannel-com-labels-em-port/issue.md) | Criar enum `ApprovalChannel` com labels em português (WHATSAPP, PRESENCIAL, TELEFONE, EMAIL) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/ApprovalChannel.java` | `sprint-05` | 🔲 Aberta |
| [US-13.5](US-13.5-criar-entidade-jpa-order-com-mapeamento-de-to/issue.md) | Criar entidade JPA `Order` com mapeamento de todos os campos financeiros, cliente, orcamentoId (UNIQUE) e soft delete em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/Order.java` | `sprint-05` | 🔲 Aberta |
| [US-13.6](US-13.6-criar-entidade-jpa-orderitem-com-snapshot-imu/issue.md) | Criar entidade JPA `OrderItem` com snapshot imutável de itens em `backend/src/main/java/br/edu/ifpb/alumigest/orders/domain/OrderItem.java` | `sprint-05` | 🔲 Aberta |
| [US-13.7](US-13.7-criar-repositorio-orderrepository-com-busca-p/issue.md) | Criar repositório `OrderRepository` com busca por código, status e cliente em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderRepository.java` | `sprint-05` | 🔲 Aberta |
| [US-13.8](US-13.8-criar-repositorio-orderitemrepository-em-back/issue.md) | Criar repositório `OrderItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/repository/OrderItemRepository.java` | `sprint-05` | 🔲 Aberta |
| [US-13.9](US-13.9-criar-gerador-de-codigo-sequencial-ordercodeg/issue.md) | Criar gerador de código sequencial `OrderCodeGenerator` (padrão PED-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderCodeGenerator.java` | `sprint-05` | 🔲 Aberta |
| [US-13.10](US-13.10-criar-record-orderconvertrequest-canalaprovac/issue.md) | Criar record `OrderConvertRequest` (canalAprovacao, dataPrevisaoEntrega, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderConvertRequest.java` | `sprint-05` | 🔲 Aberta |
| [US-13.11](US-13.11-criar-record-orderresponse-resposta-completa-/issue.md) | Criar record `OrderResponse` (resposta completa com lista de itens e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderResponse.java` | `sprint-05` | 🔲 Aberta |
| [US-13.12](US-13.12-criar-record-ordersummaryresponse-para-listag/issue.md) | Criar record `OrderSummaryResponse` para listagem paginada em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderSummaryResponse.java` | `sprint-05` | 🔲 Aberta |
| [US-13.13](US-13.13-criar-record-orderitemresponse-em-backend-src/issue.md) | Criar record `OrderItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderItemResponse.java` | `sprint-05` | 🔲 Aberta |
| [US-13.14](US-13.14-criar-mapper-mapstruct-ordermapper-em-backend/issue.md) | Criar mapper MapStruct `OrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/orders/mapper/OrderMapper.java` | `sprint-05` | 🔲 Aberta |
| [US-13.15](US-13.15-implementar-metodo-converterorcamentoempedido/issue.md) | Implementar método `converterOrcamentoEmPedido(Long orcamentoId, OrderConvertRequest request)` no `OrderService` com validação de status de orçamento e atualização para APROVADO em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderService.java` | `sprint-05` | 🔲 Aberta |
| [US-13.16](US-13.16-implementar-clonagem-profunda-deep-copy-dos-i/issue.md) | Implementar clonagem profunda (deep copy) dos itens do orçamento para `OrderItem` no `OrderService` garantindo lock de preços | `sprint-05` | 🔲 Aberta |
| [US-13.17](US-13.17-implementar-metodos-buscarporid-e-listar-com-/issue.md) | Implementar métodos `buscarPorId()` e `listar()` com paginação e filtros no `OrderService` | `sprint-05` | 🔲 Aberta |
| [US-13.18](US-13.18-criar-ordercontroller-com-endpoints-post-api-/issue.md) | Criar `OrderController` com endpoints POST /api/orders/from-budget/{budgetId}, GET /api/orders/{id}, GET /api/orders em `backend/src/main/java/br/edu/ifpb/alumigest/orders/controller/OrderController.java` | `sprint-05` | 🔲 Aberta |
| [US-13.19](US-13.19-criar-testes-unitarios-do-orderservice-cobrin/issue.md) | Criar testes unitários do `OrderService` cobrindo conversão bem-sucedida, bloqueio de conversão duplicada e teste de imutabilidade de itens em `backend/src/test/java/br/edu/ifpb/alumigest/orders/service/OrderServiceTest.java` | `sprint-05` | 🔲 Aberta |
| [US-13.20](US-13.20-criar-testes-de-integracao-dos-endpoints-rest/issue.md) | Criar testes de integração dos endpoints REST do `OrderController` com base H2 em `backend/src/test/java/br/edu/ifpb/alumigest/orders/controller/OrderControllerIntegrationTest.java` | `sprint-05` | 🔲 Aberta |
| [US-13.21](US-13.21-criar-interfaces-typescript-order-orderitem-o/issue.md) | Criar interfaces TypeScript (Order, OrderItem, OrderConvertRequest, etc.) em `frontend/src/features/orders/types/order.ts` | `sprint-05` | 🔲 Aberta |
| [US-13.22](US-13.22-criar-schemas-zod-de-validacao-orderconvertsc/issue.md) | Criar schemas Zod de validação (orderConvertSchema) em `frontend/src/features/orders/schemas/orderSchema.ts` | `sprint-05` | 🔲 Aberta |
| [US-13.23](US-13.23-criar-servico-de-api-axios-em-frontend-src-fe/issue.md) | Criar serviço de API Axios em `frontend/src/features/orders/services/orderApi.ts` | `sprint-05` | 🔲 Aberta |
| [US-13.24](US-13.24-criar-custom-hooks-react-query-useorders-useo/issue.md) | Criar custom hooks React Query (useOrders, useOrder, useConvertBudget) em `frontend/src/features/orders/hooks/useOrders.ts` | `sprint-05` | 🔲 Aberta |
| [US-13.25](US-13.25-criar-modal-orderapprovalmodal-selecao-de-can/issue.md) | Criar modal `OrderApprovalModal` (seleção de canal de aprovação, sugestão automática de data +15 dias e confirmação) em `frontend/src/features/orders/components/OrderApprovalModal.tsx` | `sprint-05` | 🔲 Aberta |
| [US-13.26](US-13.26-integrar-o-botao-aprovar-e-gerar-pedido-na-te/issue.md) | Integrar o botão "Aprovar e Gerar Pedido" na tela de detalhes do orçamento (`BudgetDetailPage.tsx`) abrindo o modal de aprovação | `sprint-05` | 🔲 Aberta |
| [US-13.27](US-13.27-criar-componente-orderstatusbadge-em-frontend/issue.md) | Criar componente `OrderStatusBadge` em `frontend/src/features/orders/components/OrderStatusBadge.tsx` | `sprint-05` | 🔲 Aberta |
| [US-13.28](US-13.28-criar-componente-orderitemstable-exibindo-a-t/issue.md) | Criar componente `OrderItemsTable` exibindo a tabela dos itens contratados com valores congelados em `frontend/src/features/orders/components/OrderItemsTable.tsx` | `sprint-05` | 🔲 Aberta |
| [US-13.29](US-13.29-criar-pagina-orderlistpage-com-listagem-pagin/issue.md) | Criar página `OrderListPage` com listagem paginada, busca e filtros em `frontend/src/pages/OrderListPage.tsx` | `sprint-05` | 🔲 Aberta |
| [US-13.30](US-13.30-criar-pagina-orderdetailpage-com-visualizacao/issue.md) | Criar página `OrderDetailPage` com visualização detalhada do pedido em `frontend/src/pages/OrderDetailPage.tsx` | `sprint-05` | 🔲 Aberta |
| [US-13.31](US-13.31-configurar-rotas-pedidos-e-pedidos-id-no-reac/issue.md) | Configurar rotas `/pedidos` e `/pedidos/:id` no React Router em `frontend/src/App.tsx` | `sprint-05` | 🔲 Aberta |

## 📦 US-14: Snapshot Imutável e Lock de Preços do Pedido

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|

## 📦 US-15: Gestão de Status, Prazos e Cancelamento de Pedidos

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-15.1](US-15.1-criar-record-ordercancelrequest-justificativa/issue.md) | Criar record `OrderCancelRequest` (justificativa obrigatória com min 10 caracteres) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/orders/dto/OrderCancelRequest.java` | `sprint-05` | 🔲 Aberta |
| [US-15.2](US-15.2-implementar-metodo-cancelarpedido-long-id-ord/issue.md) | Implementar método `cancelarPedido(Long id, OrderCancelRequest request)` no `OrderService` validando que o pedido não está em produção | `sprint-05` | 🔲 Aberta |
| [US-15.3](US-15.3-adicionar-endpoint-patch-api-orders-id-cancel/issue.md) | Adicionar endpoint PATCH /api/orders/{id}/cancel no `OrderController` | `sprint-05` | 🔲 Aberta |
| [US-15.4](US-15.4-criar-modal-ordercancelmodal-com-campo-de-jus/issue.md) | Criar modal `OrderCancelModal` com campo de justificativa no frontend em `frontend/src/features/orders/components/OrderCancelModal.tsx` | `sprint-05` | 🔲 Aberta |
| [US-15.5](US-15.5-adicionar-botao-reabrir-orcamento-para-edicao/issue.md) | Adicionar botão "Reabrir Orçamento para Edição" na tela do orçamento quando o pedido vinculado estiver cancelado | `sprint-05` | 🔲 Aberta |

## 📦 US-16: Emissão do Comprovante do Pedido de Venda

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-16.1](US-16.1-criar-orderpdfservice-com-layout-instituciona/issue.md) | Criar `OrderPdfService` com layout institucional para comprovante do pedido usando OpenPDF em `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/OrderPdfService.java` | `sprint-05` | 🔲 Aberta |
| [US-16.2](US-16.2-adicionar-endpoint-get-api-orders-id-pdf-comp/issue.md) | Adicionar endpoint GET /api/orders/{id}/pdf/comprovante no `OrderController` | `sprint-05` | 🔲 Aberta |
| [US-16.3](US-16.3-criar-teste-unitario-de-geracao-do-pdf-do-com/issue.md) | Criar teste unitário de geração do PDF do comprovante no `OrderPdfServiceTest` | `sprint-05` | 🔲 Aberta |
| [US-16.4](US-16.4-adicionar-botao-emitir-comprovante-do-pedido-/issue.md) | Adicionar botão "Emitir Comprovante do Pedido" e integração de download na `OrderDetailPage` | `sprint-05` | 🔲 Aberta |
| [US-16.5](US-16.5-adicionar-documentacao-openapi-swagger-nos-en/issue.md) | Adicionar documentação OpenAPI/Swagger nos endpoints do `OrderController` | `sprint-05` | 🔲 Aberta |
| [US-16.6](US-16.6-adicionar-item-pedidos-de-venda-no-menu-de-na/issue.md) | Adicionar item "Pedidos de Venda" no menu de navegação do frontend | `sprint-05` | 🔲 Aberta |
| [US-16.7](US-16.7-executar-validacao-completa-do-quickstart-md-/issue.md) | Executar validação completa do `quickstart.md` da Sprint 5 e documentar checklist | `sprint-05` | 🔲 Aberta |

