# 📋 Lista de Tarefas (Tasks) — Sprint 08 — Controle de Estoque de Matéria-Prima, Kardex e Homologação R2

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-21: Reservar e Baixar Matéria-Prima no Estoque Automaticamente

> **Descrição**: Reservar insumos no momento da confirmação do pedido e efetuar a baixa definitiva no estoque no início da produção dos itens.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-21.1** | [US-21.1](issues/US-21.1-criar-package-br-edu-ifpb-alumigest-stock-e-d/issue.md) Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock` | 🔲 Pendente |
| **US-21.2** | [US-21.2](issues/US-21.2-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items` e `stock_movements` | 🔲 Pendente |
| **US-21.3** | [US-21.3](issues/US-21.3-criar-enum-stockmovementtype-entrada-compra-r/issue.md) Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java` | 🔲 Pendente |
| **US-21.4** | [US-21.4](issues/US-21.4-criar-entidade-jpa-stockitem-em-backend-src-m/issue.md) Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java` | 🔲 Pendente |
| **US-21.5** | [US-21.5](issues/US-21.5-criar-entidade-jpa-stockmovement-em-backend-s/issue.md) Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java` | 🔲 Pendente |
| **US-21.6** | [US-21.6](issues/US-21.6-criar-repositorio-stockitemrepository-em-back/issue.md) Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java` | 🔲 Pendente |
| **US-21.7** | [US-21.7](issues/US-21.7-criar-repositorio-stockmovementrepository-em-/issue.md) Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java` | 🔲 Pendente |
| **US-21.8** | [US-21.8](issues/US-21.8-criar-record-stockitemresponse-saldos-fisico-/issue.md) Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java` | 🔲 Pendente |
| **US-21.9** | [US-21.9](issues/US-21.9-criar-record-stockmovementrequest-e-stockmove/issue.md) Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java` | 🔲 Pendente |
| **US-21.10** | [US-21.10](issues/US-21.10-criar-mapper-mapstruct-stockmapper-em-backend/issue.md) Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java` | 🔲 Pendente |
| **US-21.11** | [US-21.11](issues/US-21.11-implementar-metodo-reservarmateriais-long-ord/issue.md) Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java` | 🔲 Pendente |
| **US-21.12** | [US-21.12](issues/US-21.12-implementar-metodo-baixarmateriais-long-produ/issue.md) Implementar método `baixarMateriais(Long orderId)` no `StockService` convertendo reserva em baixa física | 🔲 Pendente |
| **US-21.13** | [US-21.13](issues/US-21.13-implementar-metodo-registrarmovimentacaomanua/issue.md) Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService` | 🔲 Pendente |
| **US-21.14** | [US-21.14](issues/US-21.14-criar-stockcontroller-com-endpoints-get-api-s/issue.md) Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java` | 🔲 Pendente |
| **US-21.15** | [US-21.15](issues/US-21.15-criar-testes-unitarios-de-reserva-baixa-e-con/issue.md) Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-21.1**: Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock`
- [ ] **US-21.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items` e `stock_movements`
- [ ] **US-21.3**: Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java`
- [ ] **US-21.4**: Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java`
- [ ] **US-21.5**: Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java`
- [ ] **US-21.6**: Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java`
- [ ] **US-21.7**: Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java`
- [ ] **US-21.8**: Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java`
- [ ] **US-21.9**: Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`
- [ ] **US-21.10**: Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java`
- [ ] **US-21.11**: Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java`
- [ ] **US-21.12**: Implementar método `baixarMateriais(Long orderId)` no `StockService` convertendo reserva em baixa física
- [ ] **US-21.13**: Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService`
- [ ] **US-21.14**: Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java`
- [ ] **US-21.15**: Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java`

---

## 📦 US-22: Consultar Posição de Estoque e Kardex de Movimentações

> **Descrição**: Consultar saldo atual, ponto de reposição, valorização de estoque e histórico cronológico (Kardex) de entradas, reservas e saídas de insumos.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-22.1** | [US-22.1](issues/US-22.1-criar-interfaces-typescript-e-schemas-zod-em-/issue.md) Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts` | 🔲 Pendente |
| **US-22.2** | [US-22.2](issues/US-22.2-criar-servico-de-api-axios-stockapi-ts-e-hook/issue.md) Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`) | 🔲 Pendente |
| **US-22.3** | [US-22.3](issues/US-22.3-criar-componente-stocktable-com-badges-de-ale/issue.md) Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx` | 🔲 Pendente |
| **US-22.4** | [US-22.4](issues/US-22.4-criar-modal-stockmovementmodal-para-entrada-d/issue.md) Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx` | 🔲 Pendente |
| **US-22.5** | [US-22.5](issues/US-22.5-criar-componente-kardexdrawer-com-historico-d/issue.md) Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx` | 🔲 Pendente |
| **US-22.6** | [US-22.6](issues/US-22.6-criar-pagina-stockpage-e-registrar-rota-estoq/issue.md) Criar página `StockPage` e registrar rota `/estoque` no React Router | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-22.1**: Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`
- [ ] **US-22.2**: Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`)
- [ ] **US-22.3**: Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx`
- [ ] **US-22.4**: Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx`
- [ ] **US-22.5**: Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx`
- [ ] **US-22.6**: Criar página `StockPage` e registrar rota `/estoque` no React Router

---

## 📦 US-23: Homologação Integrada e Validação da Release 2 (v2.0.0)

> **Descrição**: Homologar o fluxo ponta a ponta da Release 2 (Pedido de Venda -> Etiquetas e Chão de Fábrica -> Corte & Montagem -> Baixa de Estoque e Kardex).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-23.1** | [US-23.1](issues/US-23.1-executar-mvn-clean-verify-no-backend-e-corrig/issue.md) Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2 | 🔲 Pendente |
| **US-23.2** | [US-23.2](issues/US-23.2-executar-npm-run-build-no-frontend-e-validar-/issue.md) Executar `npm run build` no frontend e validar tipagem estrita | 🔲 Pendente |
| **US-23.3** | [US-23.3](issues/US-23.3-validar-os-cenarios-e2e-da-release-2-no-ambie/issue.md) Validar os cenários E2E da Release 2 no ambiente local | 🔲 Pendente |
| **US-23.4** | [US-23.4](issues/US-23.4-documentar-relatorio-de-testes-de-aceitacao-d/issue.md) Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md` | 🔲 Pendente |
| **US-23.5** | [US-23.5](issues/US-23.5-documentacao-openapi-swagger-nos-endpoints-de/issue.md) Documentação OpenAPI/Swagger nos endpoints de estoque | 🔲 Pendente |
| **US-23.6** | [US-23.6](issues/US-23.6-adicionar-atalho-estoque-materiais-no-menu-do/issue.md) Adicionar atalho "Estoque & Materiais" no menu do frontend | 🔲 Pendente |
| **US-23.7** | [US-23.7](issues/US-23.7-validacao-final-do-quickstart-md-da-sprint-8/issue.md) Validação final do `quickstart.md` da Sprint 8 | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-23.1**: Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2
- [ ] **US-23.2**: Executar `npm run build` no frontend e validar tipagem estrita
- [ ] **US-23.3**: Validar os cenários E2E da Release 2 no ambiente local
- [ ] **US-23.4**: Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md`
- [ ] **US-23.5**: Documentação OpenAPI/Swagger nos endpoints de estoque
- [ ] **US-23.6**: Adicionar atalho "Estoque & Materiais" no menu do frontend
- [ ] **US-23.7**: Validação final do `quickstart.md` da Sprint 8

---

## 🚫 Tarefas Descartadas (Decisão de Escopo)
- As sub-tarefas de registro e descarte de sucata/perdas da antiga US-25 foram arquivadas em [descartadas/](issues/descartadas/).
