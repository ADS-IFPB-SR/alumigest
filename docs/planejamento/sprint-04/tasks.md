# 📋 Lista de Tarefas (Tasks) — Sprint 04 — Descontos Comerciais (Parte 1: Fundação & Modelagem) e Homologação R1

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

> ℹ️ **Divisão de Escopo entre Sprints 04 e 05**:  
> - **Sprint 04**: Cobriu a **US-09 (Parte 1: tarefas US-09.1 a US-09.19)** (🟢 Concluída: modelagem Flyway V8, entidades, DTOs, regras de cálculo decimais) e a **US-12 (Homologação R1 / Baseline v0.4.0)** (🟡 Em Homologação - Não Concluída).  
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

## 📦 US-12: Homologação Integrada e Validação da Release 1 (v1.0.0 / Baseline v0.4.0)
**Status**: 🟡 Em Execução / Homologação (Não Concluída) ([Issue #136](https://github.com/ADS-IFPB-SR/alumigest/issues/136))

> **Descrição**: Validar a integração ponta a ponta da Release 1 (Catálogo de Insumos -> Produto Paramétrico -> Motor de Cálculo -> Orçamento com Desconto -> PDFs Comercial e Técnico), assegurando cobertura de testes e aprovação no SonarQube Quality Gate.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-12.1** | [US-12.1](issues/US-12.1-executar-mvn-clean-verify-e-corrigir-qualquer/issue.md) Executar `mvn clean verify` e corrigir qualquer falha nos testes unitários e de integração do backend | 🟡 Em Homologação |
| **US-12.2** | [US-12.2](issues/US-12.2-executar-npm-run-build-no-frontend-e-corrigir/issue.md) Executar `npm run build` no frontend e corrigir erros de compilação TypeScript | 🟡 Em Homologação |
| **US-12.3** | [US-12.3](issues/US-12.3-validar-os-cenarios-de-quickstart-md-cenarios/issue.md) Validar os cenários de quickstart.md (Cenários 1 a 7) manualmente no ambiente local | 🔲 Pendente |
| **US-12.4** | [US-12.4](issues/US-12.4-verificar-que-o-sonarqube-quality-gate-passa-/issue.md) Verificar que o SonarQube Quality Gate passa no pipeline de CI do GitHub Actions | 🟡 Em Homologação |
| **US-12.5** | [US-12.5](issues/US-12.5-documentar-resultado-dos-testes-de-aceitacao-/issue.md) Documentar resultado dos Testes de Aceitação (TEA) da Release 1 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Sprint04.md` | 🔲 Pendente |
| **US-12.6** | [US-12.6](issues/US-12.6-adicionar-documentacao-openapi-swagger-nos-en/issue.md) Adicionar documentação OpenAPI/Swagger nos endpoints do `BudgetController` com anotações `@Operation`, `@ApiResponse` do springdoc | 🔲 Pendente |
| **US-12.7** | [US-12.7](issues/US-12.7-atualizar-o-link-de-navegacao-no-sidebar-menu/issue.md) Atualizar o link de navegação no sidebar/menu do frontend para incluir "Orçamentos" com ícone Lucide | 🔲 Pendente |
| **US-12.8** | [US-12.8](issues/US-12.8-revisar-e-garantir-responsividade-mobile-pwa-/issue.md) Revisar e garantir responsividade mobile (PWA) nas telas de orçamentos | 🔲 Pendente |
| **US-12.9** | [US-12.9](issues/US-12.9-validar-tratamento-de-campos-ausentes-no-pdf-/issue.md) Validar tratamento de campos ausentes no PDF (cliente sem CPF/endereço → exibir "Não informado") | 🔲 Pendente |
| **US-12.10** | [US-12.10](issues/US-12.10-executar-validacao-completa-do-quickstart-md-/issue.md) Executar validação completa do `quickstart.md` e marcar checklist final | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-12.1**: Executar `mvn clean verify` e corrigir qualquer falha nos testes unitários e de integração do backend
- [ ] **US-12.2**: Executar `npm run build` no frontend e corrigir erros de compilação TypeScript
- [ ] **US-12.3**: Validar os cenários de quickstart.md (Cenários 1 a 7) manualmente no ambiente local
- [ ] **US-12.4**: Verificar que o SonarQube Quality Gate passa no pipeline de CI do GitHub Actions
- [ ] **US-12.5**: Documentar resultado dos Testes de Aceitação (TEA) da Release 1 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Sprint04.md`
- [ ] **US-12.6**: Adicionar documentação OpenAPI/Swagger nos endpoints do `BudgetController` com anotações `@Operation`, `@ApiResponse` do springdoc
- [ ] **US-12.7**: Atualizar o link de navegação no sidebar/menu do frontend para incluir "Orçamentos" com ícone Lucide
- [ ] **US-12.8**: Revisar e garantir responsividade mobile (PWA) nas telas de orçamentos
- [ ] **US-12.9**: Validar tratamento de campos ausentes no PDF (cliente sem CPF/endereço → exibir "Não informado")
- [ ] **US-12.10**: Executar validação completa do `quickstart.md` e marcar checklist final

