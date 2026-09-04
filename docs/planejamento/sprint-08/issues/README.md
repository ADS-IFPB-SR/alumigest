# 📌 Issues de Implementação — Sprint 08 — Controle de Estoque de Matéria-Prima, Kardex e Homologação R2

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-22: Reservar e Baixar Matéria-Prima no Estoque Automaticamente

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-21.1](US-21.1-criar-package-br-edu-ifpb-alumigest-stock-e-d/issue.md) | Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock` | `backlog` | 🔲 Aberta |
| [US-21.2](US-21.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`stock_movements` e `scrap_records` | `backlog` | 🔲 Aberta |
| [US-21.3](US-21.3-criar-enum-stockmovementtype-entrada-compra-r/issue.md) | Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java` | `backlog` | 🔲 Aberta |
| [TEMP21_4](TEMP21_4-criar-enum-scrapreason-quebra-manuseio-erro-m/issue.md) | Criar enum `ScrapReason` (QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapReason.java` | `backlog` | 🔲 Aberta |
| [US-21.4](US-21.4-criar-entidade-jpa-stockitem-em-backend-src-m/issue.md) | Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java` | `backlog` | 🔲 Aberta |
| [US-21.5](US-21.5-criar-entidade-jpa-stockmovement-em-backend-s/issue.md) | Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java` | `backlog` | 🔲 Aberta |
| [TEMP21_7](TEMP21_7-criar-entidade-jpa-scraprecord-em-backend-src/issue.md) | Criar entidade JPA `ScrapRecord` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapRecord.java` | `backlog` | 🔲 Aberta |
| [US-21.6](US-21.6-criar-repositorio-stockitemrepository-em-back/issue.md) | Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java` | `backlog` | 🔲 Aberta |
| [US-21.7](US-21.7-criar-repositorio-stockmovementrepository-em-/issue.md) | Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java` | `backlog` | 🔲 Aberta |
| [US-21.10](US-21.10-criar-repositorio-scraprecordrepository-em-ba/issue.md) | Criar repositório `ScrapRecordRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/ScrapRecordRepository.java` | `backlog` | 🔲 Aberta |
| [US-21.11](US-21.11-criar-record-stockitemresponse-saldos-fisico-/issue.md) | Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java` | `backlog` | 🔲 Aberta |
| [US-21.12](US-21.12-criar-record-stockmovementrequest-e-stockmove/issue.md) | Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java` | `backlog` | 🔲 Aberta |
| [US-21.13](US-21.13-criar-mapper-mapstruct-stockmapper-em-backend/issue.md) | Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java` | `backlog` | 🔲 Aberta |
| [US-21.14](US-21.14-implementar-metodo-reservarmateriais-long-ord/issue.md) | Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java` | `backlog` | 🔲 Aberta |
| [US-21.15](US-21.15-implementar-metodo-baixarmateriais-long-produ/issue.md) | Implementar método `baixarMateriais(Long productionOrderId)` no `StockService` convertendo reserva em baixa física | `backlog` | 🔲 Aberta |
| [US-21.16](US-21.16-implementar-metodo-registrarmovimentacaomanua/issue.md) | Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService` | `backlog` | 🔲 Aberta |
| [US-21.17](US-21.17-criar-stockcontroller-com-endpoints-get-api-s/issue.md) | Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java` | `backlog` | 🔲 Aberta |
| [US-21.18](US-21.18-criar-testes-unitarios-de-reserva-baixa-e-con/issue.md) | Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java` | `backlog` | 🔲 Aberta |

## 📦 US-23: Apontar Perdas, Quebras e Descarte de Sucata

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-23.1](US-23.1-criar-record-scraprecordrequest-e-scraprecord/issue.md) | Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java` | `backlog` | 🔲 Aberta |
| [US-23.2](US-23.2-implementar-metodo-registrarperda-scraprecord/issue.md) | Implementar método `registrarPerda(ScrapRecordRequest request)` no `ScrapService` com débito em `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/ScrapService.java` | `backlog` | 🔲 Aberta |
| [US-23.3](US-23.3-adicionar-endpoint-post-api-stock-scrap-no-st/issue.md) | Adicionar endpoint POST /api/stock/scrap no `StockController` | `backlog` | 🔲 Aberta |
| [US-23.4](US-23.4-criar-teste-unitario-do-scrapservicetest/issue.md) | Criar teste unitário do `ScrapServiceTest` | `backlog` | 🔲 Aberta |

## 📦 US-24: Consultar Posição de Estoque e Kardex de Movimentações

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-22.1](US-22.1-criar-interfaces-typescript-e-schemas-zod-em-/issue.md) | Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts` | `backlog` | 🔲 Aberta |
| [US-22.2](US-22.2-criar-servico-de-api-axios-stockapi-ts-e-hook/issue.md) | Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`) | `backlog` | 🔲 Aberta |
| [US-22.3](US-22.3-criar-componente-stocktable-com-badges-de-ale/issue.md) | Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx` | `backlog` | 🔲 Aberta |
| [US-22.4](US-22.4-criar-modal-stockmovementmodal-para-entrada-d/issue.md) | Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx` | `backlog` | 🔲 Aberta |
| [TEMP22_5](TEMP22_5-criar-modal-scraprecordmodal-para-registro-de/issue.md) | Criar modal `ScrapRecordModal` para registro de perda/sucata em `frontend/src/features/stock/components/ScrapRecordModal.tsx` | `backlog` | 🔲 Aberta |
| [US-22.5](US-22.5-criar-componente-kardexdrawer-com-historico-d/issue.md) | Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx` | `backlog` | 🔲 Aberta |
| [US-22.6](US-22.6-criar-pagina-stockpage-e-registrar-rota-estoq/issue.md) | Criar página `StockPage` e registrar rota `/estoque` no React Router | `backlog` | 🔲 Aberta |

## 📦 US-25: Homologação Integrada e Validação da Release 2 (v2.0.0)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-23.1](US-23.1-executar-mvn-clean-verify-no-backend-e-corrig/issue.md) | Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2 | `backlog` | 🔲 Aberta |
| [US-23.2](US-23.2-executar-npm-run-build-no-frontend-e-validar-/issue.md) | Executar `npm run build` no frontend e validar tipagem estrita | `backlog` | 🔲 Aberta |
| [US-23.3](US-23.3-validar-os-cenarios-e2e-da-release-2-no-ambie/issue.md) | Validar os cenários E2E da Release 2 no ambiente local | `backlog` | 🔲 Aberta |
| [US-23.4](US-23.4-documentar-relatorio-de-testes-de-aceitacao-d/issue.md) | Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md` | `backlog` | 🔲 Aberta |
| [US-23.5](US-23.5-documentacao-openapi-swagger-nos-endpoints-de/issue.md) | Documentação OpenAPI/Swagger nos endpoints de estoque | `backlog` | 🔲 Aberta |
| [US-23.6](US-23.6-adicionar-atalho-estoque-materiais-no-menu-do/issue.md) | Adicionar atalho "Estoque & Materiais" no menu do frontend | `backlog` | 🔲 Aberta |
| [US-23.7](US-23.7-validacao-final-do-quickstart-md-da-sprint-8/issue.md) | Validação final do `quickstart.md` da Sprint 8 | `backlog` | 🔲 Aberta |

