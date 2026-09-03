# 🚀 Guia de Validação Rápida — Sprint 01

### 1. Subir Containers
```bash
docker compose up -d
```
Verificar que PostgreSQL responde na porta 5432 e PgAdmin na porta 5050.

### 2. Rodar Backend
```bash
cd backend
./mvnw spring-boot:run
```
Acessar documentação Swagger em: `http://localhost:8080/swagger-ui.html`.
