# Research: Sprint 16 — Estabilização, Contingência e Auditoria

**Feature**: `013-estabilizacao-contingencia-final`
**Date**: 2026-08-27

## R1: Automação de Backup do PostgreSQL

### Decision: Spring `@Scheduled` invocando `ProcessBuilder` com `pg_dump -Fc` e compressão gzip

**Rationale**:
- Gera dumps binários customizados rápidos e compactos.
- Gerencia limpeza automática de arquivos com mais de 30 dias.

## R2: Trilha de Auditoria com Spring AOP

### Decision: Anotação `@AuditAction(acao = ..., entidade = ...)` interceptando métodos de Service

**Rationale**:
- Não polui o código de negócio com chamadas repetitivas de gravação de log.
- Captura usuário logado (Spring Security context), data/hora, IP e payload JSON.

## R3: Nova Migration Flyway

### Decision: `V17__create_audit_and_backup_schema.sql`

**Rationale**:
- Cria as tabelas `audit_logs` e `system_backups`.