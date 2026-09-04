# Tasks: Sprint 11 — Fluxo de Caixa Mensal

## US-30: Acompanhar Fluxo de Caixa Mensal

- [ ] **US-30.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows`
- [ ] **US-30.2**: Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`
- [ ] **US-30.3**: Criar repositório `CashFlowRepository` com queries de agregação mensal por período
- [ ] **US-30.4**: Criar record `MonthlyCashFlowResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/`
- [ ] **US-30.5**: Implementar serviço `CashFlowService.obterResumoMensal(int ano, int mes)`
- [ ] **US-30.6**: Criar endpoint GET `/api/finance/cash-flow/monthly` no `CashFlowController`
- [ ] **US-30.7**: Criar componentes `MonthlyCashFlowCards` e gráfico comparativo mensal no frontend
- [ ] **US-30.8**: Criar página `MonthlyCashFlowPage` e registrar rota `/financeiro/fluxo-mensal` no React Router
- [ ] **US-30.9**: Criar testes unitários do `CashFlowServiceTest`
- [ ] **US-30.10**: Documentar endpoints no OpenAPI/Swagger e adicionar atalho no menu
