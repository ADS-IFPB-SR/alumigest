# 📋 Issues da Sprint 16 — Estabilização, Contingência e Governança

Este diretório contém todas as **23 issues** detalhadas da Sprint 16 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin`](T001-criar-package-br-edu-ifpb-alumigest-admin-e-d/issue.md)
- [T002: Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups`](T002-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T003: Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/`](T003-criar-entidades-jpa-auditlog-e-systembackup-e/issue.md)
- [T004: Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/`](T004-criar-repositorios-auditlogrepository-e-syste/issue.md) `[P]`

### Phase 2: User Story 1 - Backup Automático e Restauração de Desastre (Priority: P1) 🎯 MVP

- [T005: Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java`](T005-criar-record-systembackupresponse-em-backend-/issue.md) `[P]` `[US1]`
- [T006: Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java`](T006-implementar-servico-systembackupservice-gerar/issue.md) `[US1]`
- [T007: Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada](T007-configurar-rotina-agendada-scheduled-cron-0-0/issue.md) `[US1]`
- [T008: Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java`](T008-criar-endpoints-post-api-admin-backups-genera/issue.md) `[US1]`
- [T009: Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1`](T009-criar-script-de-restauracao-rapida-scripts-re/issue.md) `[US1]`
- [T010: Criar testes unitários do `SystemBackupServiceTest`](T010-criar-testes-unitarios-do-systembackupservice/issue.md) `[P]` `[US1]`

### Phase 3: User Story 2 - Trilha de Auditoria de Operações Sensíveis (Priority: P1) 🎯 MVP

- [T011: Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java`](T011-criar-anotacao-customizada-auditaction-acao-e/issue.md) `[P]` `[US2]`
- [T012: Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService`](T012-implementar-interceptor-aop-auditaspect-captu/issue.md) `[US2]`
- [T013: Criar record `AuditLogResponse`](T013-criar-record-auditlogresponse/issue.md) `[P]` `[US2]`
- [T014: Criar endpoint GET /api/admin/audit-logs no `AuditLogController`](T014-criar-endpoint-get-api-admin-audit-logs-no-au/issue.md) `[US2]`
- [T015: Criar testes unitários do `AuditAspectTest`](T015-criar-testes-unitarios-do-auditaspecttest/issue.md) `[P]` `[US2]`
- [T016: Criar componente `AuditLogTable` no frontend com filtros por entidade e data](T016-criar-componente-auditlogtable-no-frontend-co/issue.md) `[US2]`
- [T017: Criar página `AuditLogsPage` no frontend](T017-criar-pagina-auditlogspage-no-frontend/issue.md) `[US2]`

### Phase 4: User Story 3 - Monitoramento de Saúde e Documentação Final (Priority: P2)

- [T018: Configurar Spring Boot Actuator no `pom.xml` e `application.yml`](T018-configurar-spring-boot-actuator-no-pom-xml-e-/issue.md) `[US3]`
- [T019: Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend](T019-criar-componente-systemhealthbadge-e-tela-sys/issue.md) `[US3]`
- [T020: Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md`](T020-criar-runbook-de-contingencia-e-guia-de-disas/issue.md) `[US3]`
- [T021: Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md`](T021-criar-diagrama-c4-model-consolidado-da-arquit/issue.md) `[US3]`

### Phase 5: Polish & Project Governance

- [T022: Documentar endpoints no OpenAPI/Swagger](T022-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T023: Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md`](T023-atualizar-mapa-mestre-de-governanca-e-documen/issue.md) `[P]`
