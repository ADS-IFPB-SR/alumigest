# [US-30.7] Criar Controlador REST `CashFlowController`

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.7`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Backend / API REST Controller
- **Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/CashFlowController.java`
- **Labels**: `backend`, `controller`, `rest-api`, `openapi`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Implementar os endpoints REST do módulo financeiro em `/api/v1/finance/cash-flow` e `/api/v1/finance/expenses`, com validações Jakarta, tratamento centralizado de exceções e documentação SpringDoc OpenAPI.

---

## 📐 Endpoints da API

1. **`GET /api/v1/finance/cash-flow/summary`**
   - **Query Params:** `year` (int, default = ano corrente), `month` (int 1..12, default = mês corrente)
   - **Retorno:** HTTP 200 com `ApiResponse<CashFlowSummaryResponse>` contendo totais e saldo líquido.

2. **`GET /api/v1/finance/cash-flow/movements`**
   - **Query Params:** `year` (int), `month` (int)
   - **Retorno:** HTTP 200 com `ApiResponse<List<CashFlowMovementResponse>>` ordenados cronologicamente.

3. **`POST /api/v1/finance/expenses`**
   - **Body:** `ExpenseCreateRequest` validado com `@Valid`
   - **Retorno:** HTTP 201 Created com a despesa persistida.

4. **`DELETE /api/v1/finance/expenses/{id}`**
   - **Path Variable:** `id` (UUID)
   - **Retorno:** HTTP 204 No Content.

---

## 🚦 Critérios de Aceitação
1. Requisição com mês inválido (ex: `month=13`) ou ano negativo retorna HTTP 400 Bad Request.
2. Cadastro de despesa com valor zerado/negativo é rejeitado pelo Bean Validation com HTTP 400.
3. Endpoints documentados com anotações `@Tag(name = "Financeiro")`, `@Operation` e `@ApiResponse`.
4. Testes `MockMvc` cobrem retornos de sucesso e cenários de erro.
