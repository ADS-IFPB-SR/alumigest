# 📌 Issues de Implementação — Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-44: Executar Rotinas de Backup Automático e Disaster Recovery em 1 Comando

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-44.1](US-44.1-criar-package-br-edu-ifpb-alumigest-admin-e-d/issue.md) | Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin` | `backlog` | 🔲 Aberta |
| [US-44.2](US-44.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups` | `backlog` | 🔲 Aberta |
| [US-44.3](US-44.3-criar-entidades-jpa-auditlog-e-systembackup-e/issue.md) | Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/` | `backlog` | 🔲 Aberta |
| [US-44.4](US-44.4-criar-repositorios-auditlogrepository-e-syste/issue.md) | Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/` | `backlog` | 🔲 Aberta |
| [US-44.5](US-44.5-criar-record-systembackupresponse-em-backend-/issue.md) | Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java` | `backlog` | 🔲 Aberta |
| [US-44.6](US-44.6-implementar-servico-systembackupservice-gerar/issue.md) | Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java` | `backlog` | 🔲 Aberta |
| [US-44.7](US-44.7-configurar-rotina-agendada-scheduled-cron-0-0/issue.md) | Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada | `backlog` | 🔲 Aberta |
| [US-44.8](US-44.8-criar-endpoints-post-api-admin-backups-genera/issue.md) | Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java` | `backlog` | 🔲 Aberta |
| [US-44.9](US-44.9-criar-script-de-restauracao-rapida-scripts-re/issue.md) | Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1` | `backlog` | 🔲 Aberta |
| [US-44.10](US-44.10-criar-testes-unitarios-do-systembackupservice/issue.md) | Criar testes unitários do `SystemBackupServiceTest` | `backlog` | 🔲 Aberta |

## 📦 US-45: Registrar Trilha de Auditoria Imutável para Ações Críticas

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-45.1](US-45.1-criar-anotacao-customizada-auditaction-acao-e/issue.md) | Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java` | `backlog` | 🔲 Aberta |
| [US-45.2](US-45.2-implementar-interceptor-aop-auditaspect-captu/issue.md) | Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService` | `backlog` | 🔲 Aberta |
| [US-45.3](US-45.3-criar-record-auditlogresponse/issue.md) | Criar record `AuditLogResponse` | `backlog` | 🔲 Aberta |
| [US-45.4](US-45.4-criar-endpoint-get-api-admin-audit-logs-no-au/issue.md) | Criar endpoint GET /api/admin/audit-logs no `AuditLogController` | `backlog` | 🔲 Aberta |
| [US-45.5](US-45.5-criar-testes-unitarios-do-auditaspecttest/issue.md) | Criar testes unitários do `AuditAspectTest` | `backlog` | 🔲 Aberta |
| [US-45.6](US-45.6-criar-componente-auditlogtable-no-frontend-co/issue.md) | Criar componente `AuditLogTable` no frontend com filtros por entidade e data | `backlog` | 🔲 Aberta |
| [US-45.7](US-45.7-criar-pagina-auditlogspage-no-frontend/issue.md) | Criar página `AuditLogsPage` no frontend | `backlog` | 🔲 Aberta |

## 📦 US-46: Monitorar Saúde do Sistema com Actuator e Publicar Documentação Final

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-46.1](US-46.1-configurar-spring-boot-actuator-no-pom-xml-e-/issue.md) | Configurar Spring Boot Actuator no `pom.xml` e `application.yml` | `backlog` | 🔲 Aberta |
| [US-46.2](US-46.2-criar-componente-systemhealthbadge-e-tela-sys/issue.md) | Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend | `backlog` | 🔲 Aberta |
| [US-46.3](US-46.3-criar-runbook-de-contingencia-e-guia-de-disas/issue.md) | Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md` | `backlog` | 🔲 Aberta |
| [US-46.4](US-46.4-criar-diagrama-c4-model-consolidado-da-arquit/issue.md) | Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md` | `backlog` | 🔲 Aberta |
| [US-46.5](US-46.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `backlog` | 🔲 Aberta |
| [US-46.6](US-46.6-atualizar-mapa-mestre-de-governanca-e-documen/issue.md) | Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md` | `backlog` | 🔲 Aberta |

