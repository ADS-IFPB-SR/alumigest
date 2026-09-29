# 🗃️ Modelo de Dados — Sprint 01

A Sprint 1 estabelece a infraestrutura do banco de dados relacional PostgreSQL 16 com extensão nativa de UUIDs e timezone de Brasília (`America/Sao_Paulo`).

```sql
-- docker/init-db.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET timezone = 'America/Sao_Paulo';
```
