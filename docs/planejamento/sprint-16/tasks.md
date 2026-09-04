# 📋 Lista de Tarefas (Tasks) — Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-44: Executar Rotinas de Backup Automático e Disaster Recovery em 1 Comando

> **Descrição**: Rotinas agendadas de backup diário compactado do PostgreSQL com retenção de 30 dias e script de restauração em menos de 10 minutos.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-44.1** | [US-44.1](issues/US-44.1-criar-package-br-edu-ifpb-alumigest-admin-e-d/issue.md) Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin` | 🔲 Pendente |
| **US-44.2** | [US-44.2](issues/US-44.2-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups` | 🔲 Pendente |
| **US-44.3** | [US-44.3](issues/US-44.3-criar-entidades-jpa-auditlog-e-systembackup-e/issue.md) Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/` | 🔲 Pendente |
| **US-44.4** | [US-44.4](issues/US-44.4-criar-repositorios-auditlogrepository-e-syste/issue.md) Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/` | 🔲 Pendente |
| **US-44.5** | [US-44.5](issues/US-44.5-criar-record-systembackupresponse-em-backend-/issue.md) Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java` | 🔲 Pendente |
| **US-44.6** | [US-44.6](issues/US-44.6-implementar-servico-systembackupservice-gerar/issue.md) Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java` | 🔲 Pendente |
| **US-44.7** | [US-44.7](issues/US-44.7-configurar-rotina-agendada-scheduled-cron-0-0/issue.md) Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada | 🔲 Pendente |
| **US-44.8** | [US-44.8](issues/US-44.8-criar-endpoints-post-api-admin-backups-genera/issue.md) Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java` | 🔲 Pendente |
| **US-44.9** | [US-44.9](issues/US-44.9-criar-script-de-restauracao-rapida-scripts-re/issue.md) Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1` | 🔲 Pendente |
| **US-44.10** | [US-44.10](issues/US-44.10-criar-testes-unitarios-do-systembackupservice/issue.md) Criar testes unitários do `SystemBackupServiceTest` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-44.1**: Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin`
- [ ] **US-44.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups`
- [ ] **US-44.3**: Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/`
- [ ] **US-44.4**: Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/`
- [ ] **US-44.5**: Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java`
- [ ] **US-44.6**: Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java`
- [ ] **US-44.7**: Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada
- [ ] **US-44.8**: Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java`
- [ ] **US-44.9**: Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1`
- [ ] **US-44.10**: Criar testes unitários do `SystemBackupServiceTest`

---

## 📦 US-45: Registrar Trilha de Auditoria Imutável para Ações Críticas

> **Descrição**: Registro imutável de eventos sensíveis (alteração de tabelas de preços, descontos, cancelamento de pedidos, baixas manuais).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-45.1** | [US-45.1](issues/US-45.1-criar-anotacao-customizada-auditaction-acao-e/issue.md) Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java` | 🔲 Pendente |
| **US-45.2** | [US-45.2](issues/US-45.2-implementar-interceptor-aop-auditaspect-captu/issue.md) Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService` | 🔲 Pendente |
| **US-45.3** | [US-45.3](issues/US-45.3-criar-record-auditlogresponse/issue.md) Criar record `AuditLogResponse` | 🔲 Pendente |
| **US-45.4** | [US-45.4](issues/US-45.4-criar-endpoint-get-api-admin-audit-logs-no-au/issue.md) Criar endpoint GET /api/admin/audit-logs no `AuditLogController` | 🔲 Pendente |
| **US-45.5** | [US-45.5](issues/US-45.5-criar-testes-unitarios-do-auditaspecttest/issue.md) Criar testes unitários do `AuditAspectTest` | 🔲 Pendente |
| **US-45.6** | [US-45.6](issues/US-45.6-criar-componente-auditlogtable-no-frontend-co/issue.md) Criar componente `AuditLogTable` no frontend com filtros por entidade e data | 🔲 Pendente |
| **US-45.7** | [US-45.7](issues/US-45.7-criar-pagina-auditlogspage-no-frontend/issue.md) Criar página `AuditLogsPage` no frontend | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-45.1**: Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java`
- [ ] **US-45.2**: Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService`
- [ ] **US-45.3**: Criar record `AuditLogResponse`
- [ ] **US-45.4**: Criar endpoint GET /api/admin/audit-logs no `AuditLogController`
- [ ] **US-45.5**: Criar testes unitários do `AuditAspectTest`
- [ ] **US-45.6**: Criar componente `AuditLogTable` no frontend com filtros por entidade e data
- [ ] **US-45.7**: Criar página `AuditLogsPage` no frontend

---

## 📦 US-46: Monitorar Saúde do Sistema com Actuator e Publicar Documentação Final

> **Descrição**: Endpoints de métricas de saúde com Spring Boot Actuator, dicionário de dados consolidado e runbook de operações da sustentação.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-46.1** | [US-46.1](issues/US-46.1-configurar-spring-boot-actuator-no-pom-xml-e-/issue.md) Configurar Spring Boot Actuator no `pom.xml` e `application.yml` | 🔲 Pendente |
| **US-46.2** | [US-46.2](issues/US-46.2-criar-componente-systemhealthbadge-e-tela-sys/issue.md) Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend | 🔲 Pendente |
| **US-46.3** | [US-46.3](issues/US-46.3-criar-runbook-de-contingencia-e-guia-de-disas/issue.md) Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md` | 🔲 Pendente |
| **US-46.4** | [US-46.4](issues/US-46.4-criar-diagrama-c4-model-consolidado-da-arquit/issue.md) Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md` | 🔲 Pendente |
| **US-46.5** | [US-46.5](issues/US-46.5-documentar-endpoints-no-openapi-swagger/issue.md) Documentar endpoints no OpenAPI/Swagger | 🔲 Pendente |
| **US-46.6** | [US-46.6](issues/US-46.6-atualizar-mapa-mestre-de-governanca-e-documen/issue.md) Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-46.1**: Configurar Spring Boot Actuator no `pom.xml` e `application.yml`
- [ ] **US-46.2**: Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend
- [ ] **US-46.3**: Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md`
- [ ] **US-46.4**: Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md`
- [ ] **US-46.5**: Documentar endpoints no OpenAPI/Swagger
- [ ] **US-46.6**: Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md`

