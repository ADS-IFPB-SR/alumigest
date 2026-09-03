# 📋 Especificação Funcional — Sprint 01

> **Sprint:** 01 — Iniciação, Governança e Infraestrutura Base  
> **Período:** 28/07/2026 a 03/08/2026  
> **Release:** Release 1 (v1.0.0) — Fundação & Cadastros  
> **Status:** 🟢 Concluída (Baseline `B-ALG-v0.1.0-S01-01`)  
> **Responsáveis:** José Guylherme (PO), Nichollas Cavalcante (SM), Equipe AlumiGest  

---

## 1. 🎯 Objetivo da Sprint 1

Estabelecer a governança formal do projeto, arquitetura base Monorepo, infraestrutura de containerização com Docker Compose (PostgreSQL 16 e PgAdmin 4), esqueleto da API REST Spring Boot 3.4 (Java 21 LTS), documentação OpenAPI Swagger e convenções de versionamento e repositório.

---

## 2. 👥 Personas & Contexto

- **Desenvolvedores / Equipe Técnica:** Necessitam de ambiente reprodutível via Docker, padronização de commits, branch protection rules e scaffold backend configurado.
- **Scrum Master / PO:** Necessitam de plano de projeto (PPJ), governança de configuração (PGC), backlog inicial (PBL) e matriz de riscos (DRI).

---

## 3. 📦 Histórias de Usuário & Entregas

### US-001: Estrutura Monorepo e Governança
- **Como** membro da equipe,
- **Quero** uma estrutura de repositório organizada e protegida,
- **Para** garantir a integridade do código e documentação.

### US-002: Infraestrutura Containerizada
- **Como** desenvolvedor,
- **Quero** rodar PostgreSQL 16 e PgAdmin 4 via `docker compose up -d`,
- **Para** ter persistência de dados isolada e extensão nativa de UUIDs (`uuid-ossp`).

### US-003: Scaffold Spring Boot 3.4
- **Como** desenvolvedor backend,
- **Quero** uma base de código com Spring Boot 3.4, Java 21, Lombok, MapStruct e OpenAPI,
- **Para** iniciar a criação de APIs REST com alta produtividade.

---

## 4. 🧪 Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Inicialização do ambiente de banco de dados
  Dado que o Docker Compose está instalado
  Quando executo "docker compose up -d"
  Então o container "alumigest-db" (PostgreSQL 16) deve ficar saudável na porta 5432
  E o container "alumigest-pgadmin" deve responder na porta 5050

Cenário: Documentação OpenAPI Swagger disponível
  Dado que a aplicação Spring Boot está em execução
  Quando acesso "http://localhost:8080/swagger-ui.html"
  Então a interface interativa do Swagger UI deve ser carregada com sucesso
```

---

*Especificação homologada na Baseline da Sprint 1.*
