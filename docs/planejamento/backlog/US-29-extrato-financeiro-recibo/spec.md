# Especificação Funcional: US-29 — Emitir Extrato Financeiro do Cliente e Recibo de Quitação

**Identificador**: `US-29`  
**Issue GitHub**: [#154](https://github.com/ADS-IFPB-SR/alumigest/issues/154)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Emissão documental de extrato de débitos/créditos e recibo oficial de quitação financeira em PDF.

---

## 📋 Sub-Tarefas / Issues Vinculadas (9 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-29.1-criar-record-clientfinancialstatementresponse/issue.md) | Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java` | 🔲 No Backlog |
| [US](issues/US-29.2-implementar-metodo-obterextratocliente-long-c/issue.md) | Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService` | 🔲 No Backlog |
| [US](issues/US-29.3-criar-servico-receiptpdfservice-gerando-recib/issue.md) | Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java` | 🔲 No Backlog |
| [US](issues/US-29.4-adicionar-endpoints-get-api-finance-receivabl/issue.md) | Adicionar endpoints GET /api/finance/receivables/client/{clienteId}/statement e GET /api/finance/receivables/{id}/receipt-pdf no `AccountReceivableController` | 🔲 No Backlog |
| [US](issues/US-29.5-criar-teste-unitario-do-receiptpdfservicetest/issue.md) | Criar teste unitário do `ReceiptPdfServiceTest` | 🔲 No Backlog |
| [US](issues/US-29.6-criar-componente-clientfinancialstatementcard/issue.md) | Criar componente `ClientFinancialStatementCard` no frontend | 🔲 No Backlog |
| [US](issues/US-29.7-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | 🔲 No Backlog |
| [US](issues/US-29.8-adicionar-atalho-contas-a-receber-no-submenu-/issue.md) | Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend | 🔲 No Backlog |
| [US](issues/US-29.9-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 10 | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
