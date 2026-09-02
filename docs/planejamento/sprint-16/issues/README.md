# 📌 Issues de Implementação — Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-50: Executar Rotinas de Backup Automático e Disaster Recovery em 1 Comando

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-50.1](US-50.1-criar-package-br-edu-ifpb-alumigest-admin-e-d/issue.md) | Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin` | `sprint-16` | 🔲 Aberta |
| [US-50.2](US-50.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups` | `sprint-16` | 🔲 Aberta |
| [US-50.3](US-50.3-criar-entidades-jpa-auditlog-e-systembackup-e/issue.md) | Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/` | `sprint-16` | 🔲 Aberta |
| [US-50.4](US-50.4-criar-repositorios-auditlogrepository-e-syste/issue.md) | Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/` | `sprint-16` | 🔲 Aberta |
| [US-50.5](US-50.5-criar-record-systembackupresponse-em-backend-/issue.md) | Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java` | `sprint-16` | 🔲 Aberta |
| [US-50.6](US-50.6-implementar-servico-systembackupservice-gerar/issue.md) | Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java` | `sprint-16` | 🔲 Aberta |
| [US-50.7](US-50.7-configurar-rotina-agendada-scheduled-cron-0-0/issue.md) | Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada | `sprint-16` | 🔲 Aberta |
| [US-50.8](US-50.8-criar-endpoints-post-api-admin-backups-genera/issue.md) | Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java` | `sprint-16` | 🔲 Aberta |
| [US-50.9](US-50.9-criar-script-de-restauracao-rapida-scripts-re/issue.md) | Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1` | `sprint-16` | 🔲 Aberta |
| [US-50.10](US-50.10-criar-testes-unitarios-do-systembackupservice/issue.md) | Criar testes unitários do `SystemBackupServiceTest` | `sprint-16` | 🔲 Aberta |

## 📦 US-51: Registrar Trilha de Auditoria Imutável para Ações Críticas

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-51.1](US-51.1-criar-anotacao-customizada-auditaction-acao-e/issue.md) | Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java` | `sprint-16` | 🔲 Aberta |
| [US-51.2](US-51.2-implementar-interceptor-aop-auditaspect-captu/issue.md) | Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService` | `sprint-16` | 🔲 Aberta |
| [US-51.3](US-51.3-criar-record-auditlogresponse/issue.md) | Criar record `AuditLogResponse` | `sprint-16` | 🔲 Aberta |
| [US-51.4](US-51.4-criar-endpoint-get-api-admin-audit-logs-no-au/issue.md) | Criar endpoint GET /api/admin/audit-logs no `AuditLogController` | `sprint-16` | 🔲 Aberta |
| [US-51.5](US-51.5-criar-testes-unitarios-do-auditaspecttest/issue.md) | Criar testes unitários do `AuditAspectTest` | `sprint-16` | 🔲 Aberta |
| [US-51.6](US-51.6-criar-componente-auditlogtable-no-frontend-co/issue.md) | Criar componente `AuditLogTable` no frontend com filtros por entidade e data | `sprint-16` | 🔲 Aberta |
| [US-51.7](US-51.7-criar-pagina-auditlogspage-no-frontend/issue.md) | Criar página `AuditLogsPage` no frontend | `sprint-16` | 🔲 Aberta |

## 📦 US-52: Monitorar Saúde do Sistema com Actuator e Publicar Documentação Final

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-52.1](US-52.1-configurar-spring-boot-actuator-no-pom-xml-e-/issue.md) | Configurar Spring Boot Actuator no `pom.xml` e `application.yml` | `sprint-16` | 🔲 Aberta |
| [US-52.2](US-52.2-criar-componente-systemhealthbadge-e-tela-sys/issue.md) | Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend | `sprint-16` | 🔲 Aberta |
| [US-52.3](US-52.3-criar-runbook-de-contingencia-e-guia-de-disas/issue.md) | Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md` | `sprint-16` | 🔲 Aberta |
| [US-52.4](US-52.4-criar-diagrama-c4-model-consolidado-da-arquit/issue.md) | Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md` | `sprint-16` | 🔲 Aberta |
| [US-52.5](US-52.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `sprint-16` | 🔲 Aberta |
| [US-52.6](US-52.6-atualizar-mapa-mestre-de-governanca-e-documen/issue.md) | Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md` | `sprint-16` | 🔲 Aberta |

