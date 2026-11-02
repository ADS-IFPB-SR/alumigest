# [US-30.10] Testes Automatizados (Backend/Frontend) e Documentação OpenAPI

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.10`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Qualidade (QA) / Testes & Governança
- **Alvo Principal**: `backend/src/test/java/br/edu/ifpb/alumigest/finance/` e `frontend/src/__tests__/features/finance/`
- **Labels**: `qa`, `tests`, `junit5`, `vitest`, `openapi`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Garantir a cobertura de testes automatizados em todas as camadas do fluxo financeiro:
1. **Testes Unitários Backend (`CashFlowServiceTest`):**
   - Cálculo de saldo líquido mensal ($\text{Entradas} - \text{Saídas}$).
   - Prevenção de duplicidade na chamada de entrada de O.S. (idempotência).
   - Anulação de entrada de O.S. ao receber evento de cancelamento.
2. **Testes de Integração Backend (`CashFlowControllerIntegrationTest`):**
   - Requisições MockMvc validando retorno HTTP 200 para sumário mensal e movimentações.
   - Validação de HTTP 400 ao submeter despesa com valor negativo ou campos vazios.
   - Validação de HTTP 201 ao cadastrar despesa válida.
3. **Testes de Componentes Frontend (Vitest):**
   - Renderização dos cartões de métricas com valores formatados em Real.
   - Abertura e submissão do formulário do `ExpenseModal`.
4. **Documentação OpenAPI Swagger:**
   - Validação do contrato `/v3/api-docs` contendo todas as tags e esquemas do módulo financeiro sem erros de serialização.

---

## 🚦 Critérios de Aceitação
1. 100% de testes passando com `mvn test` no backend e `npm test` no frontend.
2. Cobertura de linhas $\ge 80\%$ (JaCoCo e Vitest).
3. Quality Gate do SonarQube verde sem code smells bloqueantes.
