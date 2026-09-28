# Especificação Funcional: US-27 — Desdobrar e Gerenciar Parcelamento de Pedidos

**Identificador**: `US-27`  
**Issue GitHub**: [#152](https://github.com/ADS-IFPB-SR/alumigest/issues/152)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Desdobrar o valor do pedido em parcelas com vencimentos, formas de pagamento e controle de status por parcela.

---

## 📋 Sub-Tarefas / Issues Vinculadas (11 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-27.1-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables` | 🔲 No Backlog |
| [US](issues/US-27.10-criar-endpoint-post-api-finance-receivables-o/issue.md) | Criar endpoint POST /api/finance/receivables/order/{orderId}/generate no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java` | 🔲 No Backlog |
| [US](issues/US-27.11-criar-testes-unitarios-do-installmentcalculat/issue.md) | Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest` | 🔲 No Backlog |
| [US](issues/US-27.2-criar-enums-receivablestatus-a-vencer-vencido/issue.md) | Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/` | 🔲 No Backlog |
| [US](issues/US-27.3-criar-entidade-jpa-accountreceivable-em-backe/issue.md) | Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java` | 🔲 No Backlog |
| [US](issues/US-27.4-criar-repositorio-accountreceivablerepository/issue.md) | Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java` | 🔲 No Backlog |
| [US](issues/US-27.5-criar-servico-utilitario-installmentcalculato/issue.md) | Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java` | 🔲 No Backlog |
| [US](issues/US-27.6-criar-record-accountreceivableresponse-em-bac/issue.md) | Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java` | 🔲 No Backlog |
| [US](issues/US-27.7-criar-record-installmentplancustomrequest-em-/issue.md) | Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java` | 🔲 No Backlog |
| [US](issues/US-27.8-criar-mapper-mapstruct-accountreceivablemappe/issue.md) | Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java` | 🔲 No Backlog |
| [US](issues/US-27.9-implementar-servico-accountreceivableservice-/issue.md) | Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
