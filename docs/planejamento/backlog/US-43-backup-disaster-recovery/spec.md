# Especificação Funcional: US-43 — Executar Rotinas de Backup Automático e Disaster Recovery

**Identificador**: `US-43`  
**Issue GitHub**: [#168](https://github.com/ADS-IFPB-SR/alumigest/issues/168)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Automação de backups do PostgreSQL com retenção e teste de restauração em ambiente Docker.

---

## 📋 Sub-Tarefas / Issues Vinculadas (10 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-43.1-criar-package-br-edu-ifpb-alumigest-admin-e-d/issue.md) | Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin` | 🔲 No Backlog |
| [US](issues/US-43.10-criar-testes-unitarios-do-systembackupservice/issue.md) | Criar testes unitários do `SystemBackupServiceTest` | 🔲 No Backlog |
| [US](issues/US-43.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups` | 🔲 No Backlog |
| [US](issues/US-43.3-criar-entidades-jpa-auditlog-e-systembackup-e/issue.md) | Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/` | 🔲 No Backlog |
| [US](issues/US-43.4-criar-repositorios-auditlogrepository-e-syste/issue.md) | Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/` | 🔲 No Backlog |
| [US](issues/US-43.5-criar-record-systembackupresponse-em-backend-/issue.md) | Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java` | 🔲 No Backlog |
| [US](issues/US-43.6-implementar-servico-systembackupservice-gerar/issue.md) | Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java` | 🔲 No Backlog |
| [US](issues/US-43.7-configurar-rotina-agendada-scheduled-cron-0-0/issue.md) | Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada | 🔲 No Backlog |
| [US](issues/US-43.8-criar-endpoints-post-api-admin-backups-genera/issue.md) | Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java` | 🔲 No Backlog |
| [US](issues/US-43.9-criar-script-de-restauracao-rapida-scripts-re/issue.md) | Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
