# Feature Specification: Sprint 8 — Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2

**Feature**: `005-estoque-perdas-homologacao-r2`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Com o motor de produção e chão de fábrica operando (Sprints 5, 6 e 7), o AlumiGest fecha o ciclo fabril da **Release 2 (v2.0.0)** integrando a gestão de materiais e estoque:
1. **Controle de Saldos em Tempo Real**: Gestão de estoque físico, reservado e disponível (`disponivel = saldo_fisico - reservado`) para perfis de alumínio (barras/metros), vidros (m²) e ferragens (unidades).
2. **Reserva e Baixa Automática**: Reserva dos materiais na liberação da produção e baixa física definitiva ao concluir o corte da esquadria.
3. **Flexibilidade Operacional**: Saldo insuficiente emite alerta visual amarelo na tela sem travar a produção da oficina.
4. **Registro de Perdas & Sucata**: Registro de quebras e sobras com motivo (manuseio, erro de corte, defeito de fábrica) para auditoria e controle de custos de matéria-prima, com descarte e baixa do estoque.
5. **Homologação da Release 2 (v2.0.0)**: Validação integrada do ciclo fabril completo: Orçamento Aprovado → Pedido Lock → OPs e QR Code → Romaneio de Corte → Baixa de Estoque e Perdas.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-24: Reservar e Baixar Matéria-Prima no Estoque Automaticamente

> Reservar insumos no momento da confirmação do pedido e efetuar a baixa definitiva no estoque no início da produção da OP.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-24.1**: Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock`
- **US-24.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`, `stock_movements` e `scrap_records`
- **US-24.3**: Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java`
- **US-24.4**: Criar enum `ScrapReason` (QUEBRA_MANUSEIO, ERRO_MEDIDA_CORTE, DEFEITO_FABRICA_MATERIAL, AVARIA_TRANSPORTE, OUTROS) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapReason.java`
- **US-24.5**: Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java`
- **US-24.6**: Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java`
- **US-24.7**: Criar entidade JPA `ScrapRecord` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/ScrapRecord.java`
- **US-24.8**: Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java`
- **US-24.9**: Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java`
- **US-24.10**: Criar repositório `ScrapRecordRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/ScrapRecordRepository.java`
- **US-24.11**: Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java`
- **US-24.12**: Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`
- **US-24.13**: Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java`
- **US-24.14**: Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java`
- **US-24.15**: Implementar método `baixarMateriais(Long productionOrderId)` no `StockService` convertendo reserva em baixa física
- **US-24.16**: Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService`
- **US-24.17**: Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java`
- **US-24.18**: Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java`

### 📌 US-25: Apontar Perdas, Quebras e Descarte de Sucata

> Registrar perdas de perfis, quebras de vidro ou retrabalhos com justificativas padronizadas e solicitação de reposição de insumos.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-25.1**: Criar record `ScrapRecordRequest` e `ScrapRecordResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/ScrapRecordRequest.java`
- **US-25.2**: Implementar método `registrarPerda(ScrapRecordRequest request)` no `ScrapService` com débito em `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/ScrapService.java`
- **US-25.3**: Adicionar endpoint POST /api/stock/scrap no `StockController`
- **US-25.4**: Criar teste unitário do `ScrapServiceTest`

### 📌 US-26: Consultar Posição de Estoque e Kardex de Movimentações

> Consultar saldo atual, ponto de reposição, valorização de estoque e histórico cronológico (Kardex) de entradas, reservas e saídas de insumos.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-26.1**: Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`
- **US-26.2**: Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`)
- **US-26.3**: Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx`
- **US-26.4**: Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx`
- **US-26.5**: Criar modal `ScrapRecordModal` para registro de perda/sucata em `frontend/src/features/stock/components/ScrapRecordModal.tsx`
- **US-26.6**: Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx`
- **US-26.7**: Criar página `StockPage` e registrar rota `/estoque` no React Router

### 📌 US-27: Homologação Integrada e Validação da Release 2 (v2.0.0)

> Homologar o fluxo ponta a ponta da Release 2 (Pedido de Venda -> OP com QR Code -> Corte & Montagem -> Baixa de Estoque e Kardex).

#### Sub-tarefas Técnicas (Sub-issues):
- **US-27.1**: Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2
- **US-27.2**: Executar `npm run build` no frontend e validar tipagem estrita
- **US-27.3**: Validar os cenários E2E da Release 2 no ambiente local
- **US-27.4**: Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md`
- **US-27.5**: Documentação OpenAPI/Swagger nos endpoints de estoque
- **US-27.6**: Adicionar atalho "Estoque & Materiais" no menu do frontend
- **US-27.7**: Validação final do `quickstart.md` da Sprint 8

## 3. Requisitos Funcionais

1. **RF01 - Cálculo de Saldo Disponível**: `disponivel = saldo_fisico - reservado`.
2. **RF02 - Tipos de Movimentação**: `ENTRADA_COMPRA`, `RESERVA_PRODUCAO`, `BAIXA_PRODUCAO`, `PERDA_SUCATA`, `AJUSTE_MANUAL`, `CANCELAMENTO_RESERVA`.
3. **RF03 - Motivos de Perda**: `QUEBRA_MANUSEIO`, `ERRO_MEDIDA_CORTE`, `DEFEITO_FABRICA_MATERIAL`, `AVARIA_TRANSPORTE`, `OUTROS`.
4. **RF04 - Aviso Flexível de Saldo**: Saldo insuficiente emite alerta visual sem bloquear a esteira de fabricação.
5. **RF05 - Histórico Kardex Auditável**: Registro imutável de todas as movimentações de estoque com data/hora, operador e referência documental.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Momento da Baixa)**: Reserva imediata na liberação da produção e baixa definitiva ao concluir a etapa de corte da OP.
- **Q2 (Estoque Insuficiente)**: Emissão de alerta visual amarelo sem bloqueio da esteira de fabricação.
- **Q3 (Perdas e Sucata)**: Registro de perda com baixa de estoque no histórico de sucata, sem interferência automática no fluxo da OP.