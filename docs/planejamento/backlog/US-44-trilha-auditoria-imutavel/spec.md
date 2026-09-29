# Especificação Funcional: US-44 — Registrar Trilha de Auditoria Imutável para Ações Críticas

**Identificador**: `US-44`  
**Issue GitHub**: [#169](https://github.com/ADS-IFPB-SR/alumigest/issues/169)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Registro imutável de eventos de sistema (descontos concedidos, cancelamentos, baixas de estoque) com autor e timestamp.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-44.1-criar-anotacao-customizada-auditaction-acao-e/issue.md) | Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java` | 🔲 No Backlog |
| [US](issues/US-44.2-implementar-interceptor-aop-auditaspect-captu/issue.md) | Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService` | 🔲 No Backlog |
| [US](issues/US-44.3-criar-record-auditlogresponse/issue.md) | Criar record `AuditLogResponse` | 🔲 No Backlog |
| [US](issues/US-44.4-criar-endpoint-get-api-admin-audit-logs-no-au/issue.md) | Criar endpoint GET /api/admin/audit-logs no `AuditLogController` | 🔲 No Backlog |
| [US](issues/US-44.5-criar-testes-unitarios-do-auditaspecttest/issue.md) | Criar testes unitários do `AuditAspectTest` | 🔲 No Backlog |
| [US](issues/US-44.6-criar-componente-auditlogtable-no-frontend-co/issue.md) | Criar componente `AuditLogTable` no frontend com filtros por entidade e data | 🔲 No Backlog |
| [US](issues/US-44.7-criar-pagina-auditlogspage-no-frontend/issue.md) | Criar página `AuditLogsPage` no frontend | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
