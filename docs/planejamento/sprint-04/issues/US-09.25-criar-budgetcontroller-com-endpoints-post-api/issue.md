# [US-09.25] Estender `BudgetController` com endpoints de desconto e adição de itens avulsos

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-09.25`
- **US Pai**: `US-09: Aplicar Descontos e Condições Comerciais no Orçamento`
- **Fase**: `Phase 3: User Story 1 - Descontos e Condições Comerciais (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Controller REST`
- **Execução Paralela**: ❌ Não (Depende dos DTOs e métodos do `BudgetService`)
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/budgets/controller/BudgetController.java`
- **Labels Sugeridas**: `release-1`, `backend`, `java`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Contexto

> ⚠️ **Nota de Contexto**: O `BudgetController` **já existe** no projeto (implementado na Sprint 03 com as operações básicas de CRUD, listagem paginada, alteração de status e cancelamento).
> **Esta tarefa NÃO deve recriar o controller do zero**, mas sim **estendê-lo** para suportar as novas regras comerciais de desconto e adição incremental de itens da US-09.

O objetivo é adicionar os endpoints de negócio no `BudgetController` e garantir o mapeamento de rotas em conformidade com o contrato da API (`contracts/api-budgets.md`).

---

## 🔌 Novos Endpoints a Implementar

### 1. Aplicar Desconto e Condições Comerciais
- **Método / Rota**: `PUT /api/budgets/{id}/discount` (e alias `/api/orcamentos/{id}/desconto`)
- **Payload (`DiscountRequest`)**:
  - `tipoDesconto`: `PERCENTUAL` ou `VALOR_FIXO`
  - `valor`: valor monetário ou percentual (com validações de limite)
  - `condicaoPagamento`: enum/código da condição comercial (ex: `A_VISTA_PIX`, `ENTRADA_50_SALDO_ENTREGA`)
  - `observacoesPagamento`: texto livre explicativo
  - `dataValidade`: data de expiração da proposta
- **Ação**: Delegar para `budgetService.aplicarDesconto(id, discountRequest)`
- **Resposta**: `200 OK` retornando `BudgetResponse` com totais e subtotais recalculados

### 2. Adicionar Item Avulso ao Orçamento
- **Método / Rota**: `POST /api/budgets/{id}/items` (e alias `/api/orcamentos/{id}/itens`)
- **Payload (`BudgetItemCreateRequest`)**:
  - Dados do produto/esquadria (dimensões, quantidade, acabamento, vidro, ferragens, valor unitário)
- **Ação**: Delegar para `budgetService.adicionarItem(id, itemRequest)`
- **Resposta**: `201 Created` retornando `BudgetItemResponse` com o item inserido e valores calculados

### 3. Alinhamento de Rotas Base
- Incluir `"/api/budgets"` no `@RequestMapping` da classe (mantendo suporte aos aliases legados `{"/api/orcamentos", "/api/v1/budgets"}`).

---

## 🛠️ Checklist de Implementação

- [ ] Manter os endpoints existentes (`create`, `findAll`, `findById`, `update`, `updateStatus`, `recalculate`, `delete`) intactos sem introduzir regressões
- [ ] Adicionar path `"/api/budgets"` na anotação `@RequestMapping`
- [ ] Implementar endpoint `PUT /{id}/discount` delegando para `BudgetService`
- [ ] Implementar endpoint `POST /{id}/items` delegando para `BudgetService`
- [ ] Documentar os novos endpoints com anotações Swagger/OpenAPI (`@Operation`, `@ApiResponses`, `@ApiResponse`)
- [ ] Validar DTOs de entrada com anotação `@Valid`
- [ ] Garantir compilação com `mvn clean compile`

---

## ✅ Critérios de Aceitação

1. Os novos endpoints respondem nas rotas `/api/budgets/{id}/discount` e `/api/budgets/{id}/items` com os status HTTP esperados (200 e 201).
2. O payload de desconto é devidamente validado (erros 400 em caso de dados inválidos).
3. As operações CRUD já existentes continuam funcionando sem regressão.
4. O código segue os padrões do projeto (Clean Architecture, anotações OpenAPI e sem warnings bloqueantes).

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-budgets.md](../contracts/api-budgets.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
