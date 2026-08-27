# Data Model: Sprint 12 — Instalações e Ordens de Serviço (OS)

**Feature**: `009-instalacoes-ordens-servico`
**Date**: 2026-08-27

## Entities

### InstallationTeam (Equipe de Instalação)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `nome` | `VARCHAR(100)` | NOT NULL | UNIQUE | Nome da equipe (ex: "Equipe 1 - Carlos") |
| `lider_nome` | `VARCHAR(100)` | NOT NULL | — | Nome do encarregado |
| `telefone` | `VARCHAR(20)` | NULL | — | Contato |
| `tipo` | `VARCHAR(20)` | NOT NULL | DEFAULT 'PROPRIA' | Enum: PROPRIA, TERCEIRIZADA |
| `ativo` | `BOOLEAN` | NOT NULL | DEFAULT TRUE | Soft delete |

---

### ServiceOrder (Ordem de Serviço de Instalação)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `codigo` | `VARCHAR(25)` | NOT NULL | UNIQUE | Código sequencial (ex: `OS-2026-0001`) |
| `order_id` | `BIGINT` | NOT NULL | FK → `orders(id)` | Pedido associado |
| `installation_team_id` | `BIGINT` | NULL | FK → `installation_teams(id)` | Equipe alocada |
| `cliente_nome` | `VARCHAR(200)` | NOT NULL | — | Nome do cliente |
| `endereco_instalacao` | `TEXT` | NOT NULL | — | Endereço da obra |
| `data_agendamento` | `DATE` | NOT NULL | — | Data agendada |
| `turno` | `VARCHAR(20)` | NOT NULL | — | Enum: MANHA, TARDE, INTEGRAL |
| `status` | `VARCHAR(25)` | NOT NULL | DEFAULT 'AGENDADA' | Enum: AGENDADA, EM_DESLOCAMENTO, EM_EXECUCAO, CONCLUIDA, REAGENDADA, CANCELADA |
| `recebido_por_nome` | `VARCHAR(100)` | NULL | — | Nome de quem recebeu |
| `data_inicio_execucao`| `TIMESTAMP` | NULL | — | Início do serviço |
| `data_fim_execucao` | `TIMESTAMP` | NULL | — | Término do serviço |
| `observacoes` | `TEXT` | NULL | — | Detalhes de campo |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |
| `updated_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Auditoria |

**Índices**:
- `idx_service_orders_codigo` UNIQUE ON `codigo`
- `idx_service_orders_order_id` ON `order_id`
- `idx_service_orders_data_agendamento` ON `data_agendamento`
- `idx_service_orders_team_id` ON `installation_team_id`

---

### ServiceOrderPhoto (Fotos de Evidência da Obra)

| Campo | Tipo | Nullable | Constraint | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | NOT NULL | PK | Identificador único |
| `service_order_id` | `BIGINT` | NOT NULL | FK → `service_orders(id)` ON DELETE CASCADE | OS associada |
| `caminho_arquivo` | `VARCHAR(255)` | NOT NULL | — | Caminho / URL |
| `tipo_foto` | `VARCHAR(30)` | NOT NULL | DEFAULT 'DEPOIS' | Enum: ANTES, DEPOIS, DETALHE |
| `created_at` | `TIMESTAMP` | NOT NULL | DEFAULT NOW() | Data do envio |