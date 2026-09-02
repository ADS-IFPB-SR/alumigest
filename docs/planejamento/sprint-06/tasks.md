# 📋 Lista de Tarefas (Tasks) — Sprint 06 — Planejamento de Produção, OPs e Rastreabilidade com QR Code

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-17: Gerar Ordens de Produção (OP) Individuais por Peça

> **Descrição**: Gerar Ordens de Produção individuais para cada esquadria de um pedido de venda aprovado, permitindo o rastreamento isolado de fabricação.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-17.1** | [US-17.1](issues/US-17.1-adicionar-dependencias-com-google-zxing-core-/issue.md) Adicionar dependências `com.google.zxing:core:3.5.3` e `com.google.zxing:javase:3.5.3` no `backend/pom.xml` | 🔲 Pendente |
| **US-17.2** | [US-17.2](issues/US-17.2-adicionar-dependencia-html5-qrcode-no-fronten/issue.md) Adicionar dependência `html5-qrcode` no `frontend/package.json` | 🔲 Pendente |
| **US-17.3** | [US-17.3](issues/US-17.3-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V10__create_production_orders_schema.sql` com tabelas `production_orders` e `production_order_histories` | 🔲 Pendente |
| **US-17.4** | [US-17.4](issues/US-17.4-criar-enum-productionorderstatus-aguardando-c/issue.md) Criar enum `ProductionOrderStatus` (AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO) em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderStatus.java` | 🔲 Pendente |
| **US-17.5** | [US-17.5](issues/US-17.5-criar-entidade-jpa-productionorder-em-backend/issue.md) Criar entidade JPA `ProductionOrder` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrder.java` | 🔲 Pendente |
| **US-17.6** | [US-17.6](issues/US-17.6-criar-entidade-jpa-productionorderhistory-em-/issue.md) Criar entidade JPA `ProductionOrderHistory` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderHistory.java` | 🔲 Pendente |
| **US-17.7** | [US-17.7](issues/US-17.7-criar-repositorio-productionorderrepository-e/issue.md) Criar repositório `ProductionOrderRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderRepository.java` | 🔲 Pendente |
| **US-17.8** | [US-17.8](issues/US-17.8-criar-repositorio-productionorderhistoryrepos/issue.md) Criar repositório `ProductionOrderHistoryRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderHistoryRepository.java` | 🔲 Pendente |
| **US-17.9** | [US-17.9](issues/US-17.9-criar-servico-gerador-de-imagens-qr-code-qrco/issue.md) Criar serviço gerador de imagens QR Code `QrCodeGeneratorService` usando ZXing em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/QrCodeGeneratorService.java` | 🔲 Pendente |
| **US-17.10** | [US-17.10](issues/US-17.10-criar-record-productionorderresponse-com-todo/issue.md) Criar record `ProductionOrderResponse` com todos os dados da peça, cliente, status e datas em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderResponse.java` | 🔲 Pendente |
| **US-17.11** | [US-17.11](issues/US-17.11-criar-record-productionorderhistoryresponse-e/issue.md) Criar record `ProductionOrderHistoryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderHistoryResponse.java` | 🔲 Pendente |
| **US-17.12** | [US-17.12](issues/US-17.12-criar-mapper-mapstruct-productionordermapper-/issue.md) Criar mapper MapStruct `ProductionOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/production/mapper/ProductionOrderMapper.java` | 🔲 Pendente |
| **US-17.13** | [US-17.13](issues/US-17.13-implementar-metodo-gerarordensdeproducao-long/issue.md) Implementar método `gerarOrdensDeProducao(Long orderId)` no `ProductionOrderService` decompondo cada item em $N$ OPs físicas e atualizando o status do Pedido para `EM_PRODUCAO` em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/ProductionOrderService.java` | 🔲 Pendente |
| **US-17.14** | [US-17.14](issues/US-17.14-implementar-metodos-buscarporcodigo-string-co/issue.md) Implementar métodos `buscarPorCodigo(String codigo)` e `listar(Pageable, status, orderId, busca)` no `ProductionOrderService` | 🔲 Pendente |
| **US-17.15** | [US-17.15](issues/US-17.15-criar-productionordercontroller-com-endpoints/issue.md) Criar `ProductionOrderController` com endpoints POST /api/production-orders/generate-from-order/{orderId}, GET /api/production-orders/by-code/{codigo}, GET /api/production-orders em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java` | 🔲 Pendente |
| **US-17.16** | [US-17.16](issues/US-17.16-criar-testes-unitarios-do-productionorderserv/issue.md) Criar testes unitários do `ProductionOrderService` para decomposição de itens em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/ProductionOrderServiceTest.java` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-17.1**: Adicionar dependências `com.google.zxing:core:3.5.3` e `com.google.zxing:javase:3.5.3` no `backend/pom.xml`
- [ ] **US-17.2**: Adicionar dependência `html5-qrcode` no `frontend/package.json`
- [ ] **US-17.3**: Criar migration Flyway `backend/src/main/resources/db/migration/V10__create_production_orders_schema.sql` com tabelas `production_orders` e `production_order_histories`
- [ ] **US-17.4**: Criar enum `ProductionOrderStatus` (AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO) em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderStatus.java`
- [ ] **US-17.5**: Criar entidade JPA `ProductionOrder` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrder.java`
- [ ] **US-17.6**: Criar entidade JPA `ProductionOrderHistory` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderHistory.java`
- [ ] **US-17.7**: Criar repositório `ProductionOrderRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderRepository.java`
- [ ] **US-17.8**: Criar repositório `ProductionOrderHistoryRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderHistoryRepository.java`
- [ ] **US-17.9**: Criar serviço gerador de imagens QR Code `QrCodeGeneratorService` usando ZXing em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/QrCodeGeneratorService.java`
- [ ] **US-17.10**: Criar record `ProductionOrderResponse` com todos os dados da peça, cliente, status e datas em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderResponse.java`
- [ ] **US-17.11**: Criar record `ProductionOrderHistoryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderHistoryResponse.java`
- [ ] **US-17.12**: Criar mapper MapStruct `ProductionOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/production/mapper/ProductionOrderMapper.java`
- [ ] **US-17.13**: Implementar método `gerarOrdensDeProducao(Long orderId)` no `ProductionOrderService` decompondo cada item em $N$ OPs físicas e atualizando o status do Pedido para `EM_PRODUCAO` em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/ProductionOrderService.java`
- [ ] **US-17.14**: Implementar métodos `buscarPorCodigo(String codigo)` e `listar(Pageable, status, orderId, busca)` no `ProductionOrderService`
- [ ] **US-17.15**: Criar `ProductionOrderController` com endpoints POST /api/production-orders/generate-from-order/{orderId}, GET /api/production-orders/by-code/{codigo}, GET /api/production-orders em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`
- [ ] **US-17.16**: Criar testes unitários do `ProductionOrderService` para decomposição de itens em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/ProductionOrderServiceTest.java`

---

## 📦 US-18: Emitir Etiquetas com QR Code para Identificação de Peças

> **Descrição**: Emitir etiquetas adesivas térmicas (100x50mm) contendo QR Code exclusivo, medidas nominais, modelo da esquadria, cor do perfil e dados do pedido.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-18.1** | [US-18.1](issues/US-18.1-criar-servico-labelpdfservice-usando-openpdf-/issue.md) Criar serviço `LabelPdfService` usando OpenPDF com tamanho de página 100x50mm, embutindo imagem gerada pelo `QrCodeGeneratorService`, logo, código da OP, cliente, descrição e medidas em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java` | 🔲 Pendente |
| **US-18.2** | [US-18.2](issues/US-18.2-adicionar-endpoint-get-api-production-orders-/issue.md) Adicionar endpoint GET /api/production-orders/order/{orderId}/labels-pdf no `ProductionOrderController` (retorna application/pdf) | 🔲 Pendente |
| **US-18.3** | [US-18.3](issues/US-18.3-criar-teste-unitario-do-labelpdfservice-valid/issue.md) Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java` | 🔲 Pendente |
| **US-18.4** | [US-18.4](issues/US-18.4-adicionar-botao-imprimir-etiquetas-com-qr-cod/issue.md) Adicionar botão "Imprimir Etiquetas com QR Code" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-18.1**: Criar serviço `LabelPdfService` usando OpenPDF com tamanho de página 100x50mm, embutindo imagem gerada pelo `QrCodeGeneratorService`, logo, código da OP, cliente, descrição e medidas em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- [ ] **US-18.2**: Adicionar endpoint GET /api/production-orders/order/{orderId}/labels-pdf no `ProductionOrderController` (retorna application/pdf)
- [ ] **US-18.3**: Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- [ ] **US-18.4**: Adicionar botão "Imprimir Etiquetas com QR Code" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`)

---

## 📦 US-19: Atualizar Status de Produção via Scanner de QR Code

> **Descrição**: Permitir que operadores da fábrica leiam o QR Code na etiqueta via câmera do smartphone/tablet para registrar o avanço de etapas de fabricação (CORTE -> MONTAGEM -> VIDRO -> EMBALADO).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-19.1** | [US-19.1](issues/US-19.1-criar-record-productionordertransitionrequest/issue.md) Criar record `ProductionOrderTransitionRequest` (novoStatus, operadorNome, observacao) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderTransitionRequest.java` | 🔲 Pendente |
| **US-19.2** | [US-19.2](issues/US-19.2-implementar-metodo-transicionarstatus-long-id/issue.md) Implementar método `transicionarStatus(Long id, ProductionOrderTransitionRequest request)` no `ProductionOrderService` registrando histórico e verificando conclusão geral do pedido | 🔲 Pendente |
| **US-19.3** | [US-19.3](issues/US-19.3-adicionar-endpoint-patch-api-production-order/issue.md) Adicionar endpoint PATCH /api/production-orders/{id}/transition no `ProductionOrderController` | 🔲 Pendente |
| **US-19.4** | [US-19.4](issues/US-19.4-criar-interfaces-typescript-e-servico-de-api-/issue.md) Criar interfaces TypeScript e serviço de API Axios (`productionApi.ts`) em `frontend/src/features/production/services/productionApi.ts` | 🔲 Pendente |
| **US-19.5** | [US-19.5](issues/US-19.5-criar-hooks-react-query-useproductionorders-t/issue.md) Criar hooks React Query (`useProductionOrders.ts`) em `frontend/src/features/production/hooks/useProductionOrders.ts` | 🔲 Pendente |
| **US-19.6** | [US-19.6](issues/US-19.6-criar-componente-qrscannermodal-com-html5-qrc/issue.md) Criar componente `QrScannerModal` com `html5-qrcode` para leitura via câmera traseira do dispositivo em `frontend/src/features/production/components/QrScannerModal.tsx` | 🔲 Pendente |
| **US-19.7** | [US-19.7](issues/US-19.7-criar-pagina-productionscannerpage-para-opera/issue.md) Criar página `ProductionScannerPage` para operação rápida de chão de fábrica com bipagem e seleção de operador em `frontend/src/pages/ProductionScannerPage.tsx` | 🔲 Pendente |
| **US-19.8** | [US-19.8](issues/US-19.8-criar-pagina-productionorderdetailpage-com-fi/issue.md) Criar página `ProductionOrderDetailPage` com ficha técnica completa da peça e histórico de etapas em `frontend/src/pages/ProductionOrderDetailPage.tsx` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-19.1**: Criar record `ProductionOrderTransitionRequest` (novoStatus, operadorNome, observacao) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderTransitionRequest.java`
- [ ] **US-19.2**: Implementar método `transicionarStatus(Long id, ProductionOrderTransitionRequest request)` no `ProductionOrderService` registrando histórico e verificando conclusão geral do pedido
- [ ] **US-19.3**: Adicionar endpoint PATCH /api/production-orders/{id}/transition no `ProductionOrderController`
- [ ] **US-19.4**: Criar interfaces TypeScript e serviço de API Axios (`productionApi.ts`) em `frontend/src/features/production/services/productionApi.ts`
- [ ] **US-19.5**: Criar hooks React Query (`useProductionOrders.ts`) em `frontend/src/features/production/hooks/useProductionOrders.ts`
- [ ] **US-19.6**: Criar componente `QrScannerModal` com `html5-qrcode` para leitura via câmera traseira do dispositivo em `frontend/src/features/production/components/QrScannerModal.tsx`
- [ ] **US-19.7**: Criar página `ProductionScannerPage` para operação rápida de chão de fábrica com bipagem e seleção de operador em `frontend/src/pages/ProductionScannerPage.tsx`
- [ ] **US-19.8**: Criar página `ProductionOrderDetailPage` com ficha técnica completa da peça e histórico de etapas em `frontend/src/pages/ProductionOrderDetailPage.tsx`

---

## 📦 US-20: Acompanhar Produção via Painel Kanban de OPs

> **Descrição**: Disponibilizar painel visual Kanban em tempo real para a diretoria e encarregado de fábrica monitorarem o fluxo de todas as OPs em fabricação.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-20.1** | [US-20.1](issues/US-20.1-criar-componente-productionstatusbadge-em-fro/issue.md) Criar componente `ProductionStatusBadge` em `frontend/src/features/production/components/ProductionStatusBadge.tsx` | 🔲 Pendente |
| **US-20.2** | [US-20.2](issues/US-20.2-criar-componente-productionordercard-em-front/issue.md) Criar componente `ProductionOrderCard` em `frontend/src/features/production/components/ProductionOrderCard.tsx` | 🔲 Pendente |
| **US-20.3** | [US-20.3](issues/US-20.3-criar-componente-productionkanbanboard-com-co/issue.md) Criar componente `ProductionKanbanBoard` com colunas (Aguardando Corte, Corte, Montagem, CQ, Pronto) em `frontend/src/features/production/components/ProductionKanbanBoard.tsx` | 🔲 Pendente |
| **US-20.4** | [US-20.4](issues/US-20.4-criar-pagina-productionkanbanpage-com-filtros/issue.md) Criar página `ProductionKanbanPage` com filtros de busca e botão de atalho para o Scanner em `frontend/src/pages/ProductionKanbanPage.tsx` | 🔲 Pendente |
| **US-20.5** | [US-20.5](issues/US-20.5-configurar-rotas-producao-producao-scanner-pr/issue.md) Configurar rotas `/producao`, `/producao/scanner`, `/producao/op/:codigo` no React Router em `frontend/src/App.tsx` | 🔲 Pendente |
| **US-20.6** | [US-20.6](issues/US-20.6-documentar-endpoints-do-productionordercontro/issue.md) Documentar endpoints do `ProductionOrderController` com OpenAPI/Swagger | 🔲 Pendente |
| **US-20.7** | [US-20.7](issues/US-20.7-adicionar-atalhos-de-chao-de-fabrica-e-scanne/issue.md) Adicionar atalhos de "Chão de Fábrica" e "Scanner QR" no menu lateral do frontend | 🔲 Pendente |
| **US-20.8** | [US-20.8](issues/US-20.8-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) Executar validação dos cenários de teste do `quickstart.md` da Sprint 6 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-20.1**: Criar componente `ProductionStatusBadge` em `frontend/src/features/production/components/ProductionStatusBadge.tsx`
- [ ] **US-20.2**: Criar componente `ProductionOrderCard` em `frontend/src/features/production/components/ProductionOrderCard.tsx`
- [ ] **US-20.3**: Criar componente `ProductionKanbanBoard` com colunas (Aguardando Corte, Corte, Montagem, CQ, Pronto) em `frontend/src/features/production/components/ProductionKanbanBoard.tsx`
- [ ] **US-20.4**: Criar página `ProductionKanbanPage` com filtros de busca e botão de atalho para o Scanner em `frontend/src/pages/ProductionKanbanPage.tsx`
- [ ] **US-20.5**: Configurar rotas `/producao`, `/producao/scanner`, `/producao/op/:codigo` no React Router em `frontend/src/App.tsx`
- [ ] **US-20.6**: Documentar endpoints do `ProductionOrderController` com OpenAPI/Swagger
- [ ] **US-20.7**: Adicionar atalhos de "Chão de Fábrica" e "Scanner QR" no menu lateral do frontend
- [ ] **US-20.8**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 6

