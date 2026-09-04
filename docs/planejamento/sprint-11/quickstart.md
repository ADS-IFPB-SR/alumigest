# Quickstart: Sprint 11 — Fluxo de Caixa Mensal

## Como Executar e Validar

### 1. Backend
- Executar migrations Flyway:
  ```bash
  mvn clean compile
  ```
- Executar testes unitários do Fluxo de Caixa:
  ```bash
  mvn test -Dtest=CashFlowServiceTest
  ```

### 2. Frontend
- Iniciar aplicação frontend:
  ```bash
  npm run dev
  ```
- Acessar rota `/financeiro/fluxo-mensal` e selecionar o mês corrente.
- Validar se os cards de resumo mensal e o gráfico de evolução anual são renderizados corretamente.
