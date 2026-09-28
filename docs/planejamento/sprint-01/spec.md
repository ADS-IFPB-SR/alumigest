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

## 3. 📦 Histórias de Usuário (User Stories)

### 📌 US-01: Configurar Infraestrutura Monorepo, Docker e Governança do Projeto
- **Como** membro da equipe e desenvolvedor,
- **Quero** uma estrutura de repositório organizada e protegida, banco de dados PostgreSQL 16 containerizado e scaffold Spring Boot 3.4 com OpenAPI,
- **Para que** tenhamos um ambiente padronizado, seguro e produtivo para o desenvolvimento de todas as features do AlumiGest.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-01.1**: Criar PGC, PPJ, DRI e estrutura de governança
- **US-01.2**: Configurar `docker-compose.yml` com PostgreSQL 16 e PgAdmin 4
- **US-01.3**: Scaffold Spring Boot 3.4 com Maven, Lombok e OpenAPI Swagger
- **US-01.4**: Configurar Monorepo, Rulesets e CI/CD Base no GitHub Actions

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
