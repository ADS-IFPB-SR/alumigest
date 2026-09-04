# 📌 Issues de Implementação — Sprint 07 — Otimização de Corte, Fichas Técnicas de Montagem e Romaneio

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

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

## 📦 US-20: Gerar Ficha Técnica de Montagem por Item do Pedido

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-20.1](US-20.1-implementar-metodo-gerarfichamontagem-long-or/issue.md) | Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService` | `backlog` | 🔲 Aberta |
| [US-20.2](US-20.2-adicionar-endpoint-get-api-order-i/issue.md) | Adicionar endpoint GET /api/production/production-orders/{id}/assembly-sheet no `ProductionReportController` | `backlog` | 🔲 Aberta |
| [US-20.3](US-20.3-criar-componente-assemblysheetview-no-fronten/issue.md) | Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx` | `backlog` | 🔲 Aberta |
| [US-20.4](US-20.4-integrar-a-visualizacao-da-ficha-tecnica-na-t/issue.md) | Integrar a visualização da Ficha Técnica na página de detalhes do Item (`OrderDetailPage.tsx`) e após leitura no scanner | `backlog` | 🔲 Aberta |

## 📦 US-21: Emitir Romaneio de Oficina em PDF com Checklist de Conferência

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-21.1](US-21.1-criar-servico-workshoppdfservice-gerando-pdf-/issue.md) | Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte com colunas de checklist físico em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/WorkshopPdfService.java` | `backlog` | 🔲 Aberta |
| [US-21.2](US-21.2-adicionar-metodo-para-gerar-pdf-individual-da/issue.md) | Adicionar método para gerar PDF individual da Ficha Técnica do Item no `WorkshopPdfService` | `backlog` | 🔲 Aberta |
| [US-21.3](US-21.3-adicionar-endpoints-get-api-production-orders/issue.md) | Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController` | `backlog` | 🔲 Aberta |
| [US-21.4](US-21.4-criar-teste-unitario-do-workshoppdfservicetes/issue.md) | Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios | `backlog` | 🔲 Aberta |
| [US-21.5](US-21.5-adicionar-botoes-de-download-do-pdf-na-interf/issue.md) | Adicionar botões de download do PDF na interface do frontend | `backlog` | 🔲 Aberta |
| [US-21.6](US-21.6-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `backlog` | 🔲 Aberta |
| [US-21.7](US-21.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 7 | `backlog` | 🔲 Aberta |
