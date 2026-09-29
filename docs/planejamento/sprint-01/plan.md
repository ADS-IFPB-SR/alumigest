# ⚙️ Plano de Implementação Técnica — Sprint 01

> **Fase:** Setup & Infraestrutura Base  
> **Status:** 🟢 Executado e Homologado  

---

## 1. 🏛️ Constitution Check
- ✅ Monorepo com `backend/` e `frontend/`.
- ✅ Java 21 LTS e Spring Boot 3.4.
- ✅ Docker Compose com PostgreSQL 16 (Alpine).
- ✅ UUIDs para identificadores.

---

## 2. 📦 Componentes Arquiteturais

```
backend/
├── src/main/java/br/edu/ifpb/alumigest/
│   ├── AlumiGestApplication.java
│   └── common/config/
│       ├── OpenApiConfig.java
│       └── WebConfig.java
└── pom.xml
docker-compose.yml
.env.example
```

---

## 3. 🛠️ Passos de Execução
1. Configuração do Monorepo e Rulesets do GitHub.
2. Criação do `docker-compose.yml` e scripts SQL de inicialização (`docker/init-db.sql`).
3. Setup do projeto Maven Spring Boot 3.4 com SpringDoc OpenAPI.
4. Elaboração dos artefatos de governança (PGC, PPJ, DRI).
