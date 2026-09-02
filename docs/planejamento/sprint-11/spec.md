# Feature Specification: Sprint 11 — Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa

**Feature**: `008-baixa-pagamentos-fluxo-caixa`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Após a emissão dos títulos a receber (Sprint 10) e do módulo PIX (Sprint 9), o AlumiGest unifica o processamento e a conciliação financeira:
1. **Baixa Manual Multi-Método**: Liquidação de títulos em Dinheiro, Cartão (Débito/Crédito), Transferência Bancária ou Boleto.
2. **Baixa Parcial e Ajustes Comerciais**: Suporte a pagamentos parciais mantendo o mesmo título com status `PAGO_PARCIAL` e saldo devedor atualizado, com campos opcionais para descontos por pontualidade ou juros por atraso.
3. **Fluxo de Caixa Geral**: Acompanhamento diário e mensal de Entradas Realizadas x Previstas (baseado nas datas de vencimento dos títulos).
4. **Fechamento de Caixa Diário Consolidado**: Emissão de relatório de fechamento de caixa em PDF consolidando todos os recebimentos da empresa por forma de pagamento.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-34: Realizar Baixa Financeira Manual com Parciais, Juros e Descontos

> Permitir baixa manual de títulos com suporte a pagamentos parciais, acréscimo de juros/multa ou concessão de descontos pontuais.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-34.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows`
- **US-34.2**: Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`
- **US-34.3**: Criar repositório `CashFlowRepository` com queries de agregação por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`
- **US-34.4**: Criar record `SettlementRequest` (metodoPagamento, valorPago, descontoConcedido, jurosAcrescimo, operadorNome, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/SettlementRequest.java`
- **US-34.5**: Implementar serviço `SettlementService.liquidarTitulo(Long receivableId, SettlementRequest request)` com suporte a baixa parcial e atualização do pedido pai em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/SettlementService.java`
- **US-34.6**: Criar endpoint POST /api/finance/receivables/{id}/settle no `SettlementController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/SettlementController.java`
- **US-34.7**: Criar testes unitários do `SettlementServiceTest`
- **US-34.8**: Criar modal `SettlementModal` no frontend com campos de valor, desconto e método de pagamento em `frontend/src/features/finance/components/SettlementModal.tsx`
- **US-34.9**: Adicionar botão "Dar Baixa" na tabela de Contas a Receber (`ReceivablesTable.tsx`)

### 📌 US-35: Acompanhar Fluxo de Caixa Diário e Mensal

> Painel visual de fluxo de caixa com projeção de entradas, saídas, saldo operacional diário e consolidado mensal.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-35.1**: Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java`
- **US-35.2**: Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java`
- **US-35.3**: Criar endpoint GET /api/finance/cash-flow/summary no `CashFlowController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java`
- **US-35.4**: Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend em `frontend/src/features/finance/components/`
- **US-35.5**: Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router

### 📌 US-36: Emitir Relatório de Fechamento de Caixa Diário em PDF

> Emitir relatório oficial de fechamento de caixa diário em PDF com conciliação por forma de pagamento (Dinheiro, PIX, Cartão, Transferência).

#### Sub-tarefas Técnicas (Sub-issues):
- **US-36.1**: Criar serviço `DailyClosurePdfService` gerando PDF A4 de fechamento de caixa consolidado em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/DailyClosurePdfService.java`
- **US-36.2**: Adicionar endpoint GET /api/finance/cash-flow/daily-closure-pdf no `CashFlowController`
- **US-36.3**: Criar teste unitário do `DailyClosurePdfServiceTest`
- **US-36.4**: Adicionar botão "Emitir Fechamento de Caixa" na página de Fluxo de Caixa
- **US-36.5**: Documentar endpoints no OpenAPI/Swagger
- **US-36.6**: Adicionar atalho "Fluxo de Caixa" no menu do frontend
- **US-36.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 11

## 3. Requisitos Funcionais

1. **RF01 - Modal de Baixa Manual**: Suporte a seleção de método (`DINHEIRO`, `CARTAO_CREDITO`, `CARTAO_DEBITO`, `TRANSFERENCIA_TED_DOC`, `BOLETO`, `PIX_MANUAL`) e campos opcionais de `desconto` e `juros`.
2. **RF02 - Saldo Parcial Sem Títulos Extras**: A baixa parcial mantém o mesmo registro de `AccountReceivable` com status `PAGO_PARCIAL`.
3. **RF03 - Atualização Automática do Pedido**: Quando 100% dos títulos do pedido forem liquidados, o status financeiro do pedido passa para `TOTALMENTE_PAGO`.
4. **RF04 - Projeção de Caixa**: Cálculo de entradas futuras somando títulos `A_VENCER` agrupados por semana/mês.
5. **RF05 - Fechamento Consolidado em PDF**: Relatório institucional em folha A4 consolidando todas as entradas da empresa.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Baixa Parcial)**: Manter o mesmo título com status `PAGO_PARCIAL` e saldo devedor atualizado (`saldo_devedor = valor_original - valor_pago`).
- **Q2 (Descontos e Juros)**: Inclusão de campos opcionais de Desconto Concedido e Juros/Acréscimo no modal de baixa.
- **Q3 (Fechamento de Caixa)**: Relatório consolidado geral da empresa em PDF.