# 📌 Issues de Implementação — Sprint 07 — Emitir Etiqueta de Identificação, Painel Kanban e Lista Linear e Plana de Corte de Pedido

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-17.1](US-17.1-criar-servico-labelpdfservice-usando-openpdf/issue.md) | Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça | `backlog` | 🔲 Aberta |
| [US-17.2](US-17.2-adicionar-endpoint-get-api-orders-orderid-labels-pdf/issue.md) | Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no backend retornando documento `application/pdf` | `backlog` | 🔲 Aberta |
| [US-17.3](US-17.3-criar-teste-unitario-do-labelpdfservice/issue.md) | Criar teste unitário do `LabelPdfService` validando geração de bytes e paginação exata por quantidade de peças | `backlog` | 🔲 Aberta |
| [US-17.4](US-17.4-adicionar-botao-imprimir-etiquetas-no-frontend/issue.md) | Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) | `backlog` | 🔲 Aberta |

## 📦 US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-18.1](US-18.1-implementar-endpoint-patch-api-orders-id-production-status/issue.md) | Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com validação de transição e data de conclusão | `backlog` | 🔲 Aberta |
| [US-18.2](US-18.2-criar-hook-react-query-useproductionkanban/issue.md) | Criar hook React Query `useProductionKanban` e serviços Axios de produção no frontend | `backlog` | 🔲 Aberta |
| [US-18.3](US-18.3-criar-componente-orderproductioncard-no-frontend/issue.md) | Criar componente `OrderProductionCard` no frontend exibindo dados do pedido, cliente, alerta de prazo e total de peças | `backlog` | 🔲 Aberta |
| [US-18.4](US-18.4-criar-componente-productionkanbanboard-com-colunas-de-status/issue.md) | Criar componente `ProductionKanbanBoard` com colunas (`AGUARDANDO_PRODUCAO`EM_PRODUCAO`CONCLUIDO`) | `backlog` | 🔲 Aberta |
| [US-18.5](US-18.5-criar-pagina-productionkanbanpage-com-filtros-de-busca/issue.md) | Criar página `ProductionKanbanPage` com filtros de busca por cliente, período de entrega e código do pedido | `backlog` | 🔲 Aberta |
| [US-18.6](US-18.6-configurar-rota-producao-e-menu-lateral-no-frontend/issue.md) | Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend | `backlog` | 🔲 Aberta |
| [US-18.7](US-18.7-documentar-endpoints-no-openapi-swagger-e-testes-unitarios/issue.md) | Documentar endpoints no OpenAPI/Swagger e criar testes unitários para a transição de status no backend | `backlog` | 🔲 Aberta |

## 📦 US-19: Consolidar Lista Linear e Plana de Corte do Pedido

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-19.1](US-19.1-criar-record-cuttingitemdto-orderitemid-numer/issue.md) | Criar record `CuttingItemDTO` (codigoOP, numeroPeca, totalPecas, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens, status) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java` | `backlog` | 🔲 Aberta |
| [US-19.2](US-19.2-criar-record-cuttinglistresponse-orderid-orde/issue.md) | Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java` | `backlog` | 🔲 Aberta |
| [US-19.3](US-19.3-criar-record-assemblysheetresponse-em-backend/issue.md) | Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java` | `backlog` | 🔲 Aberta |
| [US-19.4](US-19.4-implementar-servico-cuttinglistservice-gerarr/issue.md) | Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java` | `backlog` | 🔲 Aberta |
| [US-19.5](US-19.5-criar-endpoint-get-api-production-orders-orde/issue.md) | Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java` | `backlog` | 🔲 Aberta |
| [US-19.6](US-19.6-criar-testes-unitarios-do-cuttinglistservice-/issue.md) | Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java` | `backlog` | 🔲 Aberta |
| [US-19.7](US-19.7-criar-modal-cuttinglistmodal-no-frontend-exib/issue.md) | Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx` | `backlog` | 🔲 Aberta |
| [US-19.8](US-19.8-adicionar-botao-lista-de-corte-na-tela-de-det/issue.md) | Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`) | `backlog` | 🔲 Aberta |

