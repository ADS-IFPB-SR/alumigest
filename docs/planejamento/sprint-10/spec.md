# Feature Specification: Sprint 10 — Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento

**Feature**: `007-contas-receber-parcelamento`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

No modelo operacional da Alumiportas, a grande maioria dos contratos de esquadrias e vidros envolve divisão de pagamentos: **50% de Sinal de Entrada** (para compra de matéria-prima) e **50% de Saldo na Entrega/Instalação**, ou parcelamento no cartão/boleto em até 12x.

Atualmente, o controle de quais clientes já pagaram o sinal e quais estão com saldo devedor pendente na entrega é feito em cadernos ou planilhas desconectadas.

Esta sprint entrega:
1. **Geração Automática do Plano de Contas a Receber**: Desdobramento inteligente do valor do pedido em títulos a receber (`AccountReceivable`), com centavos residuais na 1ª parcela e permissão de edição manual de datas/valores.
2. **Gestão de Sinais de Entrada (50%) e Saldos**: Acompanhamento dinâmico dos status (`A_VENCER`, `VENCIDO`, `PAGO_PARCIAL`, `PAGO`, `CANCELADO`).
3. **Painel Financeiro de Contas a Receber**: Visão consolidada por período de vencimento com alertas visuais de inadimplência.
4. **Posição Financeira do Cliente & Recibos em PDF**: Extrato de débitos e emissão de recibos oficiais de quitação via OpenPDF.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-27: Desdobrar e Gerenciar Parcelamento de Pedidos

> Gerar automaticamente os títulos a receber com base na condição de pagamento (Entrada + Saldo, Cartão em N vezes, etc.) com datas de vencimento configuráveis.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-27.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables`
- **US-27.2**: Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`
- **US-27.3**: Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java`
- **US-27.4**: Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java`
- **US-27.5**: Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java`
- **US-27.6**: Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java`
- **US-27.7**: Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java`
- **US-27.8**: Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java`
- **US-27.9**: Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java`
- **US-27.10**: Criar endpoint POST /api/finance/receivables/order/{orderId}/generate no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java`
- **US-27.11**: Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest`

### 📌 US-28: Controlar Contas a Receber, Vencimentos e Inadimplência

> Painel gerencial de contas a receber com visão de títulos a vencer, vencidos, taxas de inadimplência e alertas visuais.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-28.1**: Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO`
- **US-28.2**: Criar endpoint GET /api/finance/receivables no `AccountReceivableController`
- **US-28.3**: Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts`
- **US-28.4**: Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx`
- **US-28.5**: Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router

### 📌 US-29: Emitir Extrato Financeiro do Cliente e Recibo de Quitação

> Gerar extrato financeiro detalhado por cliente e emitir recibos oficiais de quitação total ou parcial em PDF.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-29.1**: Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java`
- **US-29.2**: Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService`
- **US-29.3**: Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java`
- **US-29.4**: Adicionar endpoints GET /api/finance/receivables/client/{clienteId}/statement e GET /api/finance/receivables/{id}/receipt-pdf no `AccountReceivableController`
- **US-29.5**: Criar teste unitário do `ReceiptPdfServiceTest`
- **US-29.6**: Criar componente `ClientFinancialStatementCard` no frontend
- **US-29.7**: Documentar endpoints no OpenAPI/Swagger
- **US-29.8**: Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend
- **US-29.9**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 10

## 3. Requisitos Funcionais

1. **RF01 - Geração Automática por Condição**: Divisão em títulos a receber conforme condição comercial.
2. **RF02 - Regra de Centavos**: O centavo residual de divisões ímpares é somado na primeira parcela.
3. **RF03 - Validação de Integridade**: A soma das parcelas deve obrigatoriamente bater com o `valor_liquido` do pedido.
4. **RF04 - Alerta Não-Bloqueante de Inadimplência**: Clientes com parcelas em atraso são sinalizados com banner vermelho de aviso sem travar a operação.
5. **RF05 - Emissão de Recibo em PDF**: Geração de documento de quitação via OpenPDF.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Ajuste de Parcelas)**: Sugestão automática inteligente + edição manual livre de datas e valores (com validação de soma total).
- **Q2 (Centavos)**: Centavo residual alocado na 1ª parcela (Entrada/Sinal).
- **Q3 (Inadimplência)**: Alerta visual em vermelho no cadastro e propostas sem bloqueio de emissão.