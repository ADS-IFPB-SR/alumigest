# 🚀 Guia de Validação Rápida — Sprint 03

### 1. Executar 141 Testes Automatizados Backend
```bash
cd backend
./mvnw clean test
```
Confirma 141 testes passando com 100% de sucesso.

### 2. Validar Cobertura JaCoCo e SonarQube
```bash
cd backend
./mvnw clean verify
```
Gera relatório em `backend/target/site/jacoco/jacoco.xml` com >90% de cobertura no motor de orçamentos.

### 3. Rodar Testes E2E Cypress
```bash
cd frontend
npm run test:e2e
# ou
npx cypress run
```
Executa as 23 specs do Catálogo PWA.
