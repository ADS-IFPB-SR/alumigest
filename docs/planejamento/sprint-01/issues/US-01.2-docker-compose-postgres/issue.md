# [US-01.2] Setup Docker Compose com PostgreSQL 16 e PgAdmin 4

## 📌 Metadados da Issue
- **ID da Tarefa**: `US-01.2`
- **US Pai**: `US US-01`
- **Fase**: `Phase 2: Database Infrastructure`
- **Labels**: `task`,  `database`, `docker`

## 🎯 Objetivo & Descrição
Configurar o arquivo `docker-compose.yml` para subir instâncias de banco PostgreSQL 16 e PgAdmin 4, com volume persistente e script `docker/init-db.sql`.

## ✅ Critérios de Aceitação
- [x] Execução de `docker compose up -d` provisiona o banco e a extensão `uuid-ossp`.
