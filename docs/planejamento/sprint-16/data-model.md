# Data Model: Sprint 16 — Estabilização, Contingência e Auditoria

**Feature**: `013-estabilizacao-contingencia-final`
**Date**: 2026-08-27

## Entities

### AuditLog (Trilha de Auditoria)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `usuario_id` | `BIGINT` | NULL | — | ID do usuário |
| `usuario_nome` | `VARCHAR(100)` | NOT NULL | — | Nome / Login do operador |
| `acao` | `VARCHAR(50)` | NOT NULL | — | Ex: ALTERAR_PRECO, CONCEDER_DESCONTO, CANCELAR_PEDIDO, BAIXA_PAGAMENTO |
| `entidade` | `VARCHAR(50)` | NOT NULL | — | Ex: Order, Budget, Product, Payment |
| `registro_id` | `BIGINT` | NOT NULL | — | ID do registro alterado |
| `detalhes_json` | `TEXT` | NULL | — | Snapshot antes/depois ou justificativa |
| `ip_origem` | `VARCHAR(45)` | NULL | — | IP da requisição |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data e hora exata |

**Índices**:
- `idx_audit_logs_entidade_registro` ON `(entidade, registro_id)`
- `idx_audit_logs_created_at` ON `created_at`
- `idx_audit_logs_usuario_id` ON `usuario_id`

---

### SystemBackup (Registro de Backups Gerados)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `nome_arquivo` | `VARCHAR(200)` | NOT NULL | UNIQUE | Ex: `backup-alumigest-20260827-0200.sql.gz` |
| `tamanho_bytes` | `BIGINT` | NOT NULL | — | Tamanho do arquivo |
| `tipo` | `VARCHAR(20)` | NOT NULL | — | Enum: AUTOMATICO, MANUAL |
| `status` | `VARCHAR(20)` | NOT NULL | — | Enum: SUCESSO, ERRO |
| `mensagem_erro` | `TEXT` | NULL | — | Detalhes em caso de falha |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data da execução |