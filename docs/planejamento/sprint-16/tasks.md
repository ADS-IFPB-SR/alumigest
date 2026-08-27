# Tasks: Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final

**Feature**: `013-estabilizacao-contingencia-final`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-admin.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Migration Flyway V17, Entidades JPA de Auditoria e Backup

- [ ] T001 Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin`
- [ ] T002 Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups`
- [ ] T003 Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/`
- [ ] T004 [P] Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/`

---

## Phase 2: User Story 1 - Backup Automático e Restauração de Desastre (Priority: P1) 🎯 MVP

**Goal**: Agendamento diário de backup, disparador manual e script de restore automatizado.

**Independent Test**: Executar backup manual via endpoint e validar integridade do dump gerado.

- [ ] T005 [P] [US1] Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java`
- [ ] T006 [US1] Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java`
- [ ] T007 [US1] Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada
- [ ] T008 [US1] Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java`
- [ ] T009 [US1] Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1`
- [ ] T010 [P] [US1] Criar testes unitários do `SystemBackupServiceTest`

---

## Phase 3: User Story 2 - Trilha de Auditoria de Operações Sensíveis (Priority: P1) 🎯 MVP

**Goal**: Interceptar métodos sensíveis com AOP e exibir logs de auditoria no frontend.

**Independent Test**: Cancelar pedido de teste e verificar gravação de registro em `audit_logs`.

- [ ] T011 [P] [US2] Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java`
- [ ] T012 [US2] Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService`
- [ ] T013 [P] [US2] Criar record `AuditLogResponse`
- [ ] T014 [US2] Criar endpoint GET /api/admin/audit-logs no `AuditLogController`
- [ ] T015 [P] [US2] Criar testes unitários do `AuditAspectTest`
- [ ] T016 [US2] Criar componente `AuditLogTable` no frontend com filtros por entidade e data
- [ ] T017 [US2] Criar página `AuditLogsPage` no frontend

---

## Phase 4: User Story 3 - Monitoramento de Saúde e Documentação Final (Priority: P2)

**Goal**: Configurar Actuator e gerar documentação arquitetural consolidada.

**Independent Test**: Acessar `/actuator/health` e constatar status "UP".

- [ ] T018 [US3] Configurar Spring Boot Actuator no `pom.xml` e `application.yml`
- [ ] T019 [US3] Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend
- [ ] T020 [US3] Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md`
- [ ] T021 [US3] Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md`

---

## Phase 5: Polish & Project Governance

**Purpose**: Documentação OpenAPI e consolidação de governança

- [ ] T022 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T023 [P] Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md`