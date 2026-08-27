# Implementation Plan: Sprint 16 — Estabilização, Contingência e Auditoria

**Branch**: `013-estabilizacao-contingencia-final` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/013-estabilizacao-contingencia-final/spec.md`

## Summary

Implementar a rotina de backup diário automatizado com compressão gzip, disparador de backup manual sob demanda, trilha de auditoria via Spring AOP (`@AuditAction`), endpoints Actuator e documentação de Disaster Recovery.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2 (Actuator, AOP, Scheduling), PostgreSQL (pg_dump)
- Frontend: React 19, Lucide React, Tailwind CSS

**Storage**: PostgreSQL 16+ (Migration `V17__create_audit_and_backup_schema.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `admin.audit` e `admin.backup` |
| I. DTOs em Records Java | ✅ PASS | `AuditLogResponse`, `SystemBackupResponse`, etc. |
| II. Test-First | ✅ PASS | Testes unitários do aspecto de auditoria e agendador |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/admin/
├── controller/
│   ├── AuditLogController.java                 # Endpoints de consulta de auditoria
│   └── SystemBackupController.java             # Endpoints de backup e download
├── service/
│   ├── AuditLogService.java                    # Gravação assíncrona de logs
│   ├── SystemBackupService.java                # Execução de pg_dump e retenção
│   └── AuditAspect.java                        # Interceptor @AuditAction
├── repository/
│   ├── AuditLogRepository.java
│   └── SystemBackupRepository.java
├── domain/
│   ├── AuditLog.java
│   └── SystemBackup.java
└── dto/
    ├── AuditLogResponse.java
    └── SystemBackupResponse.java
```

### Frontend

```text
frontend/src/features/admin/
├── components/
│   ├── AuditLogTable.tsx                       # Tabela de logs com filtros
│   ├── SystemBackupCard.tsx                    # Card de status de backups e botão manual
│   └── SystemHealthBadge.tsx                   # Badge com status do Actuator
└── pages/
    ├── AuditLogsPage.tsx                       # Página de auditoria
    └── SystemSettingsPage.tsx                  # Configurações do sistema e backups
```