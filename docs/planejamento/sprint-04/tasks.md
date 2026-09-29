# 📋 Lista de Tarefas (Tasks) — Sprint 04 — Descontos Comerciais (Parte 1: Fundação & Modelagem)

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

> ℹ️ **Divisão de Escopo entre Sprints 04 e 05**:  
> - **Sprint 04**: Cobriu a **US-09 (Parte 1: tarefas US-09.1 a US-09.19)** (🟢 Concluída: modelagem Flyway V8, entidades, DTOs, regras de cálculo decimais). A antiga demanda de homologação da Release 1 foi descontinuada como história e absorvida no DoD de US-10 e US-11 na Sprint 05.  
> - **Sprint 05**: Cobriu a **US-09 (Parte 2: tarefas US-09.20 a US-09.40)**, a **US-10 (PDF Comercial e WhatsApp)** e a **US-11 (PDF Técnico de Oficina)**.

---

## 📦 US-09 (Parte 1): Fundação e Modelagem de Descontos e Orçamentos
**Status**: 🟢 Concluída na Sprint 04 ([Issue #133](https://github.com/ADS-IFPB-SR/alumigest/issues/133))

> **Descrição**: Criar a infraestrutura de banco de dados (Flyway V8), entidades JPA `Budget` e `BudgetItem`, enums, mappers, DTOs e motor de cálculo monetário com precisão decimal (`BigDecimal`).  
> ⏱️ **Estimativas em Horas**: [Consulte o guia e detalhamento de horas da US-09 (45.0h)](guia-estimativas-horas-us09.md).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-09.1** | [US-09.1](issues/US-09.1-adicionar-dependencia-com-github-librepdf-ope/issue.md) Adicionar dependência `com.github.librepdf:openpdf:2.0.3` no `backend/pom.xml` | ✅ Concluída |
| **US-09.2** | [US-09.2](issues/US-09.2-adicionar-o-logotipo-da-alumiportas-em-backen/issue.md) Adicionar o logotipo da Alumiportas em `backend/src/main/resources/static/logo-alumiportas.png` | ✅ Concluída |
| **US-09.3** | [US-09.3](issues/US-09.3-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V8__create_budgets_schema.sql` com tabelas `budgets` e `budget_items`, constraints, índices e checks conforme `data-model.md` | ✅ Concluída |
| **US-09.4** | [US-09.4](issues/US-09.4-criar-enum-budgetstatus-rascunho-enviado-apro/issue.md) Criar enum `BudgetStatus` (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java` | ✅ Concluída |
| **US-09.5** | [US-09.5](issues/US-09.5-criar-enum-discounttype-percentual-valor-fixo/issue.md) Criar enum `DiscountType` (PERCENTUAL, VALOR_FIXO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/DiscountType.java` | ✅ Concluída |
| **US-09.6** | [US-09.6](issues/US-09.6-criar-enum-paymentcondition-com-label-em-port/issue.md) Criar enum `PaymentCondition` com label em português (A_VISTA_PIX, ENTRADA_50_SALDO_ENTREGA, CARTAO_12X, A_COMBINAR) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/PaymentCondition.java` | ✅ Concluída |
| **US-09.7** | [US-09.7](issues/US-09.7-criar-entidade-jpa-budget-com-todos-os-campos/issue.md) Criar entidade JPA `Budget` com todos os campos, relacionamentos, auditoria (createdAt/updatedAt) e soft delete conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/Budget.java` | ✅ Concluída |
| **US-09.8** | [US-09.8](issues/US-09.8-criar-entidade-jpa-budgetitem-com-fk-para-bud/issue.md) Criar entidade JPA `BudgetItem` com FK para Budget (CASCADE), campos técnicos (medidas, cor, vidro, abertura, ferragens) e valores conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetItem.java` | ✅ Concluída |
| **US-09.9** | [US-09.9](issues/US-09.9-criar-repositorio-budgetrepository-jpareposit/issue.md) Criar repositório `BudgetRepository` (JpaRepository) com queries customizadas (findByCodigo, busca por status, busca por nome do cliente) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetRepository.java` | ✅ Concluída |
| **US-09.10** | [US-09.10](issues/US-09.10-criar-repositorio-budgetitemrepository-jparep/issue.md) Criar repositório `BudgetItemRepository` (JpaRepository) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetItemRepository.java` | ✅ Concluída |
| **US-09.11** | [US-09.11](issues/US-09.11-criar-gerador-de-codigo-sequencial-budgetcode/issue.md) Criar gerador de código sequencial `BudgetCodeGenerator` (formato ORC-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetCodeGenerator.java` | ✅ Concluída |
| **US-09.12** | [US-09.12](issues/US-09.12-criar-record-budgetcreaterequest-clientenome-/issue.md) Criar record `BudgetCreateRequest` (clienteNome, clienteTelefone, clienteEndereco, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetCreateRequest.java` | ✅ Concluída |
| **US-09.13** | [US-09.13](issues/US-09.13-criar-record-budgetitemcreaterequest-producti/issue.md) Criar record `BudgetItemCreateRequest` (productId, descricao, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, ferragens, valorUnitario) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemCreateRequest.java` | ✅ Concluída |
| **US-09.14** | [US-09.14](issues/US-09.14-criar-record-discountrequest-tipodesconto-val/issue.md) Criar record `DiscountRequest` (tipoDesconto, valor, condicaoPagamento, observacoesPagamento, dataValidade) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/DiscountRequest.java` | ✅ Concluída |
| **US-09.15** | [US-09.15](issues/US-09.15-criar-record-statuschangerequest-novostatus-e/issue.md) Criar record `StatusChangeRequest` (novoStatus) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/StatusChangeRequest.java` | ✅ Concluída |
| **US-09.16** | [US-09.16](issues/US-09.16-criar-record-budgetresponse-resposta-completa/issue.md) Criar record `BudgetResponse` (resposta completa com items e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetResponse.java` | ✅ Concluída |
| **US-09.17** | [US-09.17](issues/US-09.17-criar-record-budgetsummaryresponse-resumo-par/issue.md) Criar record `BudgetSummaryResponse` (resumo para listagem) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetSummaryResponse.java` | ✅ Concluída |
| **US-09.18** | [US-09.18](issues/US-09.18-criar-record-budgetitemresponse-em-backend-sr/issue.md) Criar record `BudgetItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemResponse.java` | ✅ Concluída |
| **US-09.19** | [US-09.19](issues/US-09.19-criar-mapper-mapstruct-budgetmapper-entity-dt/issue.md) Criar mapper MapStruct `BudgetMapper` (Entity ↔ DTOs, incluindo cálculo de campo `expirado` e `condicaoPagamentoLabel`) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/mapper/BudgetMapper.java` | ✅ Concluída |

---

### 🔄 US-09 (Parte 2): Conclusão, Validade 15 Dias e Integrações Comerciais (Entregue na Sprint 05)
> As tarefas abaixo foram desenvolvidas e consolidadas na **Sprint 05** (ver [`../sprint-05/tasks.md`](../sprint-05/tasks.md)):

| ID | Tarefa | Status |
|---|---|:---:|
| **US-09.20** | [US-09.20](issues/US-09.20-criar-budgetservice-com-logica-de-criacao-de-/issue.md) Criar `BudgetService` com lógica de criação de orçamento (geração de código sequencial, dataValidade = emissão + 15 dias) | ✅ Concluída (Sprint 05) |
| **US-09.21** | [US-09.21](issues/US-09.21-implementar-metodo-adicionaritem-no-budgetser/issue.md) Implementar método `adicionarItem()` no `BudgetService` com recálculo automático do `valorBruto` do orçamento | ✅ Concluída (Sprint 05) |
| **US-09.22** | [US-09.22](issues/US-09.22-implementar-metodo-aplicardesconto-no-budgets/issue.md) Implementar método `aplicarDesconto()` no `BudgetService` com cálculo bidirecional (percentual ↔ valor fixo) | ✅ Concluída (Sprint 05) |
| **US-09.23** | [US-09.23](issues/US-09.23-implementar-metodo-alterarstatus-no-budgetser/issue.md) Implementar método `alterarStatus()` no `BudgetService` com máquina de estados | ✅ Concluída (Sprint 05) |
| **US-09.24** | [US-09.24](issues/US-09.24-implementar-metodo-listar-no-budgetservice-co/issue.md) Implementar método `listar()` no `BudgetService` com paginação, filtro por status e busca por código/nome | ✅ Concluída (Sprint 05) |
| **US-09.25** | [US-09.25](issues/US-09.25-criar-budgetcontroller-com-endpoints-post-api/issue.md) Estender `BudgetController` com endpoints de aplicação de desconto (`PUT /discount`) e adição de itens avulsos | ✅ Concluída (Sprint 05) |
| **US-09.26** | [US-09.26](issues/US-09.26-criar-testes-unitarios-do-budgetservice-criac/issue.md) Criar testes unitários do `BudgetService` | ✅ Concluída (Sprint 05) |
| **US-09.27** | [US-09.27](issues/US-09.27-criar-testes-de-integracao-do-budgetcontrolle/issue.md) Criar testes de integração do `BudgetController` com H2 | ✅ Concluída (Sprint 05) |
| **US-09.28** | [US-09.28](issues/US-09.28-criar-interfaces-typescript-budget-budgetitem/issue.md) Criar interfaces TypeScript (Budget, BudgetItem, etc.) em `frontend` | ✅ Concluída (Sprint 05) |
| **US-09.29** | [US-09.29](issues/US-09.29-criar-schemas-zod-de-validacao-budgetcreatesc/issue.md) Criar schemas Zod de validação (budgetCreateSchema, discountSchema) | ✅ Concluída (Sprint 05) |
| **US-09.30** | [US-09.30](issues/US-09.30-criar-servico-de-api-axios-createbudget-listb/issue.md) Criar serviço de API Axios (createBudget, listBudgets, getBudget, applyDiscount) | ✅ Concluída (Sprint 05) |
| **US-09.31** | [US-09.31](issues/US-09.31-criar-custom-hooks-react-query-usebudgets-use/issue.md) Criar custom hooks React Query (useBudgets, useApplyDiscount) | ✅ Concluída (Sprint 05) |
| **US-09.32** | [US-09.32](issues/US-09.32-criar-componente-budgetstatusbadge-badge-visu/issue.md) Criar componente `BudgetStatusBadge` com indicador de expirado | ✅ Concluída (Sprint 05) |
| **US-09.33** | [US-09.33](issues/US-09.33-criar-componente-budgetform-formulario-de-dad/issue.md) Criar componente `BudgetForm` com react-hook-form + zod | ✅ Concluída (Sprint 05) |
| **US-09.34** | [US-09.34](issues/US-09.34-criar-componente-budgetitemform-formulario-de/issue.md) Criar componente `BudgetItemForm` | ✅ Concluída (Sprint 05) |
| **US-09.35** | [US-09.35](issues/US-09.35-criar-componente-budgetitemstable-tabela-dos-/issue.md) Criar componente `BudgetItemsTable` | ✅ Concluída (Sprint 05) |
| **US-09.36** | [US-09.36](issues/US-09.36-criar-componente-discountpanel-painel-de-desc/issue.md) Criar componente `DiscountPanel` | ✅ Concluída (Sprint 05) |
| **US-09.37** | [US-09.37](issues/US-09.37-criar-componente-budgetsummarycard-card-com-v/issue.md) Criar componente `BudgetSummaryCard` | ✅ Concluída (Sprint 05) |
| **US-09.38** | [US-09.38](issues/US-09.38-criar-pagina-budgetcreatepage-montagem-comple/issue.md) Criar página `BudgetCreatePage` | ✅ Concluída (Sprint 05) |
| **US-09.39** | [US-09.39](issues/US-09.39-criar-pagina-budgetlistpage-listagem-paginada/issue.md) Criar página `BudgetListPage` com filtros | ✅ Concluída (Sprint 05) |
| **US-09.40** | [US-09.40](issues/US-09.40-adicionar-rotas-orcamentos-orcamentos-novo-or/issue.md) Adicionar rotas `/orcamentos` no React Router | ✅ Concluída (Sprint 05) |
### Detalhamento das Tarefas da Sprint 04 (Checklist):

- [x] **US-09.1**: Adicionar dependência `com.github.librepdf:openpdf:2.0.3` no `backend/pom.xml`
- [x] **US-09.2**: Adicionar o logotipo da Alumiportas em `backend/src/main/resources/static/logo-alumiportas.png`
- [x] **US-09.3**: Criar migration Flyway `backend/src/main/resources/db/migration/V8__create_budgets_schema.sql` com tabelas `budgets` e `budget_items`, constraints, índices e checks conforme `data-model.md`
- [x] **US-09.4**: Criar enum `BudgetStatus` (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java`
- [x] **US-09.5**: Criar enum `DiscountType` (PERCENTUAL, VALOR_FIXO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/DiscountType.java`
- [x] **US-09.6**: Criar enum `PaymentCondition` com label em português (A_VISTA_PIX, ENTRADA_50_SALDO_ENTREGA, CARTAO_12X, A_COMBINAR) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/PaymentCondition.java`
- [x] **US-09.7**: Criar entidade JPA `Budget` com todos os campos, relacionamentos, auditoria (createdAt/updatedAt) e soft delete conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/Budget.java`
- [x] **US-09.8**: Criar entidade JPA `BudgetItem` com FK para Budget (CASCADE), campos técnicos (medidas, cor, vidro, abertura, ferragens) e valores conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetItem.java`
- [x] **US-09.9**: Criar repositório `BudgetRepository` (JpaRepository) com queries customizadas (findByCodigo, busca por status, busca por nome do cliente) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetRepository.java`
- [x] **US-09.10**: Criar repositório `BudgetItemRepository` (JpaRepository) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetItemRepository.java`
- [x] **US-09.11**: Criar gerador de código sequencial `BudgetCodeGenerator` (formato ORC-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetCodeGenerator.java`
- [x] **US-09.12**: Criar record `BudgetCreateRequest` (clienteNome, clienteTelefone, clienteEndereco, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetCreateRequest.java`
- [x] **US-09.13**: Criar record `BudgetItemCreateRequest` (productId, descricao, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, ferragens, valorUnitario) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemCreateRequest.java`
- [x] **US-09.14**: Criar record `DiscountRequest` (tipoDesconto, valor, condicaoPagamento, observacoesPagamento, dataValidade) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/DiscountRequest.java`
- [x] **US-09.15**: Criar record `StatusChangeRequest` (novoStatus) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/StatusChangeRequest.java`
- [x] **US-09.16**: Criar record `BudgetResponse` (resposta completa com items e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetResponse.java`
- [x] **US-09.17**: Criar record `BudgetSummaryResponse` (resumo para listagem) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetSummaryResponse.java`
- [x] **US-09.18**: Criar record `BudgetItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemResponse.java`
- [x] **US-09.19**: Criar mapper MapStruct `BudgetMapper` (Entity ↔ DTOs, incluindo cálculo de campo `expirado` e `condicaoPagamentoLabel`) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/mapper/BudgetMapper.java`

> ℹ️ *As tarefas US-09.20 a US-09.40 foram executadas e validadas no checklist da [Sprint 05](../sprint-05/tasks.md).*

---

> ℹ️ **Migração de Histórias para a Sprint 05**:  
> Conforme definição de escopo e histórico real do projeto, as histórias **US-10** (*Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp*) e **US-11** (*Emitir Orçamento em PDF - Via Técnica de Oficina*), juntamente com a **US-09 (Parte 2: tarefas US-09.20 a US-09.40)**, pertencem e foram executadas na **Sprint 05**. Consulte o detalhamento completo em [`../sprint-05/tasks.md`](../sprint-05/tasks.md).

---

## 🛡️ Homologação Integrada da Release 1 (v1.0.0) — [Incorporada no DoD de US-10 e US-11]
**Status de Governança**: 🛡️ **Critérios Incorporados no DoD da Sprint 05** ([Issue #136](https://github.com/ADS-IFPB-SR/alumigest/issues/136))

> ℹ️ **Decisão de Governança Técnica & Engenharia Ágil**:  
> Conforme acordado entre o Product Owner e a equipe de Engenharia do AlumiGest, **atividades de homologação, testes E2E e quality gates não constituem User Stories**, visto que não implementam funcionalidades de negócio perceptíveis ao usuário final.  
> Dessa forma, a antiga demanda isolada de homologação da Release 1 foi formalmente descontinuada como história de usuário independente. Todos os seus critérios de verificação técnica (pirâmide de testes Maven/Vitest, SonarQube Quality Gate $\ge 80\%$, testes de responsividade mobile e validação do fluxo do `quickstart.md`) foram **incorporados diretamente como Definition of Done (DoD) e Critérios de Aceitação das histórias US-10 (PDF Comercial & WhatsApp) e US-11 (PDF Técnico de Oficina) na [Sprint 05](../sprint-05/tasks.md)**.


