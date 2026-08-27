# Quickstart Validation Guide: Sprint 16 — Estabilização, Contingência e Auditoria

**Feature**: `013-estabilizacao-contingencia-final`
**Date**: 2026-08-27

## Prerequisites

- PostgreSQL rodando com migrations até V17 aplicadas
- Backend e Frontend rodando com perfil administrativo

## Validation Scenarios

### Cenário 1: Disparar Backup Manual e Fazer Download

```bash
# Gerar backup
curl -s -X POST http://localhost:8080/api/admin/backups/generate

# Baixar arquivo gerado
curl -s -o backup.sql.gz http://localhost:8080/api/admin/backups/1/download
```

### Cenário 2: Consulta de Trilha de Auditoria

```bash
curl -s "http://localhost:8080/api/admin/audit-logs?acao=CANCELAR_PEDIDO"

# Resultado esperado: HTTP 200 OK com logs de quem cancelou pedidos, data/hora e justificativa
```

### Cenário 3: Validação de Health Check do Actuator

```bash
curl -s http://localhost:8080/actuator/health

# Resultado esperado: HTTP 200 OK com {"status":"UP"}
```