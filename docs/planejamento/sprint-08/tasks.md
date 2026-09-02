# 📋 Lista de Tarefas (Tasks) — Sprint 08 — Controle de Estoque de Matéria-Prima, Kardex e Homologação R2

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-24: Reservar e Baixar Matéria-Prima no Estoque Automaticamente

> **Descrição**: Reservar insumos no momento da confirmação do pedido e efetuar a baixa definitiva no estoque no início da produção da OP.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-24.1** | [US-24.1](issues/US-24.1-criar-package-br-edu-ifpb-alumigest-stock-e-d/issue.md) Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock` | 🔲 Pendente |
| **US-24.2** | [US-24.2](issues/US-24.2-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`, `stock_movements` e `scrap_records` | 🔲 Pendente |
| **US-24.3** | [US-24.3](issues/US-24.3-criar-enum-stockmovementtype-entrada-compra-r/issue.md) Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java` | 🔲 Pendente |
| **US-24.4** | [US-24.4](issues/US-24.4-criar-enum-scrapreason-quebra-manuseio-erro-m/issue.md) Criar enum `ScrapReason` (QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapReason.java` | 🔲 Pendente |
| **US-24.5** | [US-24.5](issues/US-24.5-criar-entidade-jpa-stockitem-em-backend-src-m/issue.md) Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java` | 🔲 Pendente |
| **US-24.6** | [US-24.6](issues/US-24.6-criar-entidade-jpa-stockmovement-em-backend-s/issue.md) Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java` | 🔲 Pendente |
| **US-24.7** | [US-24.7](issues/US-24.7-criar-entidade-jpa-scraprecord-em-backend-src/issue.md) Criar entidade JPA `ScrapRecord` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapRecord.java` | 🔲 Pendente |
| **US-24.8** | [US-24.8](issues/US-24.8-criar-repositorio-stockitemrepository-em-back/issue.md) Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java` | 🔲 Pendente |
| **US-24.9** | [US-24.9](issues/US-24.9-criar-repositorio-stockmovementrepository-em-/issue.md) Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java` | 🔲 Pendente |
| **US-24.10** | [US-24.10](issues/US-24.10-criar-repositorio-scraprecordrepository-em-ba/issue.md) Criar repositório `ScrapRecordRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/ScrapRecordRepository.java` | 🔲 Pendente |
| **US-24.11** | [US-24.11](issues/US-24.11-criar-record-stockitemresponse-saldos-fisico-/issue.md) Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java` | 🔲 Pendente |
| **US-24.12** | [US-24.12](issues/US-24.12-criar-record-stockmovementrequest-e-stockmove/issue.md) Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java` | 🔲 Pendente |
| **US-24.13** | [US-24.13](issues/US-24.13-criar-mapper-mapstruct-stockmapper-em-backend/issue.md) Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java` | 🔲 Pendente |
| **US-24.14** | [US-24.14](issues/US-24.14-implementar-metodo-reservarmateriais-long-ord/issue.md) Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java` | 🔲 Pendente |
| **US-24.15** | [US-24.15](issues/US-24.15-implementar-metodo-baixarmateriais-long-produ/issue.md) Implementar método `baixarMateriais(Long productionOrderId)` no `StockService` convertendo reserva em baixa física | 🔲 Pendente |
| **US-24.16** | [US-24.16](issues/US-24.16-implementar-metodo-registrarmovimentacaomanua/issue.md) Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService` | 🔲 Pendente |
| **US-24.17** | [US-24.17](issues/US-24.17-criar-stockcontroller-com-endpoints-get-api-s/issue.md) Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java` | 🔲 Pendente |
| **US-24.18** | [US-24.18](issues/US-24.18-criar-testes-unitarios-de-reserva-baixa-e-con/issue.md) Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-24.1**: Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock`
- [ ] **US-24.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`, `stock_movements` e `scrap_records`
- [ ] **US-24.3**: Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java`
- [ ] **US-24.4**: Criar enum `ScrapReason` (QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapReason.java`
- [ ] **US-24.5**: Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java`
- [ ] **US-24.6**: Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java`
- [ ] **US-24.7**: Criar entidade JPA `ScrapRecord` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapRecord.java`
- [ ] **US-24.8**: Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java`
- [ ] **US-24.9**: Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java`
- [ ] **US-24.10**: Criar repositório `ScrapRecordRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/ScrapRecordRepository.java`
- [ ] **US-24.11**: Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java`
- [ ] **US-24.12**: Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`
- [ ] **US-24.13**: Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java`
- [ ] **US-24.14**: Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java`
- [ ] **US-24.15**: Implementar método `baixarMateriais(Long productionOrderId)` no `StockService` convertendo reserva em baixa física
- [ ] **US-24.16**: Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService`
- [ ] **US-24.17**: Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java`
- [ ] **US-24.18**: Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java`

---

## 📦 US-25: Apontar Perdas, Quebras e Descarte de Sucata

> **Descrição**: Registrar perdas de perfis, quebras de vidro ou retrabalhos com justificativas padronizadas e solicitação de reposição de insumos.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-25.1** | [US-25.1](issues/US-25.1-criar-record-scraprecordrequest-e-scraprecord/issue.md) Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java` | 🔲 Pendente |
| **US-25.2** | [US-25.2](issues/US-25.2-implementar-metodo-registrarperda-scraprecord/issue.md) Implementar método `registrarPerda(ScrapRecordRequest request)` no `ScrapService` com débito em `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/ScrapService.java` | 🔲 Pendente |
| **US-25.3** | [US-25.3](issues/US-25.3-adicionar-endpoint-post-api-stock-scrap-no-st/issue.md) Adicionar endpoint POST /api/stock/scrap no `StockController` | 🔲 Pendente |
| **US-25.4** | [US-25.4](issues/US-25.4-criar-teste-unitario-do-scrapservicetest/issue.md) Criar teste unitário do `ScrapServiceTest` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-25.1**: Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`
- [ ] **US-25.2**: Implementar método `registrarPerda(ScrapRecordRequest request)` no `ScrapService` com débito em `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/ScrapService.java`
- [ ] **US-25.3**: Adicionar endpoint POST /api/stock/scrap no `StockController`
- [ ] **US-25.4**: Criar teste unitário do `ScrapServiceTest`

---

## 📦 US-26: Consultar Posição de Estoque e Kardex de Movimentações

> **Descrição**: Consultar saldo atual, ponto de reposição, valorização de estoque e histórico cronológico (Kardex) de entradas, reservas e saídas de insumos.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-26.1** | [US-26.1](issues/US-26.1-criar-interfaces-typescript-e-schemas-zod-em-/issue.md) Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts` | 🔲 Pendente |
| **US-26.2** | [US-26.2](issues/US-26.2-criar-servico-de-api-axios-stockapi-ts-e-hook/issue.md) Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`) | 🔲 Pendente |
| **US-26.3** | [US-26.3](issues/US-26.3-criar-componente-stocktable-com-badges-de-ale/issue.md) Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx` | 🔲 Pendente |
| **US-26.4** | [US-26.4](issues/US-26.4-criar-modal-stockmovementmodal-para-entrada-d/issue.md) Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx` | 🔲 Pendente |
| **US-26.5** | [US-26.5](issues/US-26.5-criar-modal-scraprecordmodal-para-registro-de/issue.md) Criar modal `ScrapRecordModal` para registro de perda/sucata em `frontend/src/features/stock/components/ScrapRecordModal.tsx` | 🔲 Pendente |
| **US-26.6** | [US-26.6](issues/US-26.6-criar-componente-kardexdrawer-com-historico-d/issue.md) Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx` | 🔲 Pendente |
| **US-26.7** | [US-26.7](issues/US-26.7-criar-pagina-stockpage-e-registrar-rota-estoq/issue.md) Criar página `StockPage` e registrar rota `/estoque` no React Router | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-26.1**: Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`
- [ ] **US-26.2**: Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`)
- [ ] **US-26.3**: Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx`
- [ ] **US-26.4**: Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx`
- [ ] **US-26.5**: Criar modal `ScrapRecordModal` para registro de perda/sucata em `frontend/src/features/stock/components/ScrapRecordModal.tsx`
- [ ] **US-26.6**: Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx`
- [ ] **US-26.7**: Criar página `StockPage` e registrar rota `/estoque` no React Router

---

## 📦 US-27: Homologação Integrada e Validação da Release 2 (v2.0.0)

> **Descrição**: Homologar o fluxo ponta a ponta da Release 2 (Pedido de Venda -> OP com QR Code -> Corte & Montagem -> Baixa de Estoque e Kardex).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-27.1** | [US-27.1](issues/US-27.1-executar-mvn-clean-verify-no-backend-e-corrig/issue.md) Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2 | 🔲 Pendente |
| **US-27.2** | [US-27.2](issues/US-27.2-executar-npm-run-build-no-frontend-e-validar-/issue.md) Executar `npm run build` no frontend e validar tipagem estrita | 🔲 Pendente |
| **US-27.3** | [US-27.3](issues/US-27.3-validar-os-cenarios-e2e-da-release-2-no-ambie/issue.md) Validar os cenários E2E da Release 2 no ambiente local | 🔲 Pendente |
| **US-27.4** | [US-27.4](issues/US-27.4-documentar-relatorio-de-testes-de-aceitacao-d/issue.md) Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md` | 🔲 Pendente |
| **US-27.5** | [US-27.5](issues/US-27.5-documentacao-openapi-swagger-nos-endpoints-de/issue.md) Documentação OpenAPI/Swagger nos endpoints de estoque | 🔲 Pendente |
| **US-27.6** | [US-27.6](issues/US-27.6-adicionar-atalho-estoque-materiais-no-menu-do/issue.md) Adicionar atalho "Estoque & Materiais" no menu do frontend | 🔲 Pendente |
| **US-27.7** | [US-27.7](issues/US-27.7-validacao-final-do-quickstart-md-da-sprint-8/issue.md) Validação final do `quickstart.md` da Sprint 8 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-27.1**: Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2
- [ ] **US-27.2**: Executar `npm run build` no frontend e validar tipagem estrita
- [ ] **US-27.3**: Validar os cenários E2E da Release 2 no ambiente local
- [ ] **US-27.4**: Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md`
- [ ] **US-27.5**: Documentação OpenAPI/Swagger nos endpoints de estoque
- [ ] **US-27.6**: Adicionar atalho "Estoque & Materiais" no menu do frontend
- [ ] **US-27.7**: Validação final do `quickstart.md` da Sprint 8

