# Especificação Funcional: US-21 — Reservar e Baixar Matéria-Prima no Estoque Automaticamente

**Identificador**: `US-21`  
**Issue GitHub**: [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Reservar matéria-prima na liberação do pedido e efetuar a baixa definitiva do estoque no chão de fábrica ao concluir as esquadrias.

---

## 📋 Sub-Tarefas / Issues Vinculadas (15 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-21.1-criar-package-br-edu-ifpb-alumigest-stock-e-d/issue.md) | Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock` | 🔲 No Backlog |
| [US](issues/US-21.10-criar-mapper-mapstruct-stockmapper-em-backend/issue.md) | Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java` | 🔲 No Backlog |
| [US](issues/US-21.11-implementar-metodo-reservarmateriais-long-ord/issue.md) | Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java` | 🔲 No Backlog |
| [US](issues/US-21.12-implementar-metodo-baixarmateriais-long-produ/issue.md) | Implementar método `baixarMateriais(Long productionOrderId)` no `StockService` convertendo reserva em baixa física | 🔲 No Backlog |
| [US](issues/US-21.13-implementar-metodo-registrarmovimentacaomanua/issue.md) | Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService` | 🔲 No Backlog |
| [US](issues/US-21.14-criar-stockcontroller-com-endpoints-get-api-s/issue.md) | Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java` | 🔲 No Backlog |
| [US](issues/US-21.15-criar-testes-unitarios-de-reserva-baixa-e-con/issue.md) | Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java` | 🔲 No Backlog |
| [US](issues/US-21.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`stock_movements` e `` | 🔲 No Backlog |
| [US](issues/US-21.3-criar-enum-stockmovementtype-entrada-compra-r/issue.md) | Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java` | 🔲 No Backlog |
| [US](issues/US-21.4-criar-entidade-jpa-stockitem-em-backend-src-m/issue.md) | Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java` | 🔲 No Backlog |
| [US](issues/US-21.5-criar-entidade-jpa-stockmovement-em-backend-s/issue.md) | Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java` | 🔲 No Backlog |
| [US](issues/US-21.6-criar-repositorio-stockitemrepository-em-back/issue.md) | Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java` | 🔲 No Backlog |
| [US](issues/US-21.7-criar-repositorio-stockmovementrepository-em-/issue.md) | Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java` | 🔲 No Backlog |
| [US](issues/US-21.8-criar-record-stockitemresponse-saldos-fisico-/issue.md) | Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java` | 🔲 No Backlog |
| [US](issues/US-21.9-criar-record-stockmovementrequest-e-stockmove/issue.md) | Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
