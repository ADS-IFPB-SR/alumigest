# 📋 Issues da Sprint 4 — Descontos, PDF e Homologação R1

Este diretório contém todas as **64 issues** detalhadas da Sprint 4 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup (Shared Infrastructure)

- [T001: Adicionar dependência `com.github.librepdf:openpdf:2.0.3` no `backend/pom.xml`](T001-adicionar-dependencia-com-github-librepdf-ope/issue.md)
- [T002: Adicionar o logotipo da Alumiportas em `backend/src/main/resources/static/logo-alumiportas.png`](T002-adicionar-o-logotipo-da-alumiportas-em-backen/issue.md) `[P]`

### Phase 2: Foundational (Blocking Prerequisites)

- [T003: Criar migration Flyway `backend/src/main/resources/db/migration/V8__create_budgets_schema.sql` com tabelas `budgets` e `budget_items`, constraints, índices e checks conforme `data-model.md`](T003-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T004: Criar enum `BudgetStatus` (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java`](T004-criar-enum-budgetstatus-rascunho-enviado-apro/issue.md) `[P]`
- [T005: Criar enum `DiscountType` (PERCENTUAL, VALOR_FIXO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/DiscountType.java`](T005-criar-enum-discounttype-percentual-valor-fixo/issue.md) `[P]`
- [T006: Criar enum `PaymentCondition` com label em português (A_VISTA_PIX, ENTRADA_50_SALDO_ENTREGA, CARTAO_12X, A_COMBINAR) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/PaymentCondition.java`](T006-criar-enum-paymentcondition-com-label-em-port/issue.md) `[P]`
- [T007: Criar entidade JPA `Budget` com todos os campos, relacionamentos, auditoria (createdAt/updatedAt) e soft delete conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/Budget.java`](T007-criar-entidade-jpa-budget-com-todos-os-campos/issue.md)
- [T008: Criar entidade JPA `BudgetItem` com FK para Budget (CASCADE), campos técnicos (medidas, cor, vidro, abertura, ferragens) e valores conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetItem.java`](T008-criar-entidade-jpa-budgetitem-com-fk-para-bud/issue.md)
- [T009: Criar repositório `BudgetRepository` (JpaRepository) com queries customizadas (findByCodigo, busca por status, busca por nome do cliente) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetRepository.java`](T009-criar-repositorio-budgetrepository-jpareposit/issue.md) `[P]`
- [T010: Criar repositório `BudgetItemRepository` (JpaRepository) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetItemRepository.java`](T010-criar-repositorio-budgetitemrepository-jparep/issue.md) `[P]`
- [T011: Criar gerador de código sequencial `BudgetCodeGenerator` (formato ORC-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetCodeGenerator.java`](T011-criar-gerador-de-codigo-sequencial-budgetcode/issue.md)

### Phase 3: User Story 1 - Descontos e Condições Comerciais (Priority: P1) 🎯 MVP

- [T012: Criar record `BudgetCreateRequest` (clienteNome, clienteTelefone, clienteEndereco, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetCreateRequest.java`](T012-criar-record-budgetcreaterequest-clientenome-/issue.md) `[P]` `[US1]`
- [T013: Criar record `BudgetItemCreateRequest` (productId, descricao, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, ferragens, valorUnitario) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemCreateRequest.java`](T013-criar-record-budgetitemcreaterequest-producti/issue.md) `[P]` `[US1]`
- [T014: Criar record `DiscountRequest` (tipoDesconto, valor, condicaoPagamento, observacoesPagamento, dataValidade) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/DiscountRequest.java`](T014-criar-record-discountrequest-tipodesconto-val/issue.md) `[P]` `[US1]`
- [T015: Criar record `StatusChangeRequest` (novoStatus) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/StatusChangeRequest.java`](T015-criar-record-statuschangerequest-novostatus-e/issue.md) `[P]` `[US1]`
- [T016: Criar record `BudgetResponse` (resposta completa com items e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetResponse.java`](T016-criar-record-budgetresponse-resposta-completa/issue.md) `[P]` `[US1]`
- [T017: Criar record `BudgetSummaryResponse` (resumo para listagem) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetSummaryResponse.java`](T017-criar-record-budgetsummaryresponse-resumo-par/issue.md) `[P]` `[US1]`
- [T018: Criar record `BudgetItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemResponse.java`](T018-criar-record-budgetitemresponse-em-backend-sr/issue.md) `[P]` `[US1]`
- [T019: Criar mapper MapStruct `BudgetMapper` (Entity ↔ DTOs, incluindo cálculo de campo `expirado` e `condicaoPagamentoLabel`) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/mapper/BudgetMapper.java`](T019-criar-mapper-mapstruct-budgetmapper-entity-dt/issue.md) `[US1]`
- [T020: Criar `BudgetService` com lógica de criação de orçamento (geração de código sequencial, dataValidade = emissão + 15 dias), `@Transactional(readOnly=true)` na classe e `@Transactional` nos métodos de mutação em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetService.java`](T020-criar-budgetservice-com-logica-de-criacao-de-/issue.md) `[US1]`
- [T021: Implementar método `adicionarItem()` no `BudgetService` com recálculo automático do `valorBruto` do orçamento](T021-implementar-metodo-adicionaritem-no-budgetser/issue.md) `[US1]`
- [T022: Implementar método `aplicarDesconto()` no `BudgetService` com cálculo bidirecional (percentual ↔ valor fixo), validação de limites (desconto <= valorBruto) e persistência de condições de pagamento](T022-implementar-metodo-aplicardesconto-no-budgets/issue.md) `[US1]`
- [T023: Implementar método `alterarStatus()` no `BudgetService` com máquina de estados (transições válidas conforme `data-model.md`)](T023-implementar-metodo-alterarstatus-no-budgetser/issue.md) `[US1]`
- [T024: Implementar método `listar()` no `BudgetService` com paginação, filtro por status e busca por código/nome do cliente](T024-implementar-metodo-listar-no-budgetservice-co/issue.md) `[US1]`
- [T025: Criar `BudgetController` com endpoints POST /api/budgets, GET /api/budgets, GET /api/budgets/{id}, POST /api/budgets/{id}/items, PUT /api/budgets/{id}/discount, PATCH /api/budgets/{id}/status conforme `contracts/api-budgets.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/controller/BudgetController.java`](T025-criar-budgetcontroller-com-endpoints-post-api/issue.md) `[US1]`
- [T026: Criar testes unitários do `BudgetService` (criação, desconto percentual, desconto valor fixo, validações de limites, transições de status) em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetServiceTest.java`](T026-criar-testes-unitarios-do-budgetservice-criac/issue.md) `[P]` `[US1]`
- [T027: Criar testes de integração do `BudgetController` (endpoints CRUD, desconto, status) com H2 em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/controller/BudgetControllerIntegrationTest.java`](T027-criar-testes-de-integracao-do-budgetcontrolle/issue.md) `[US1]`
- [T028: Criar interfaces TypeScript (Budget, BudgetItem, BudgetCreateRequest, DiscountRequest, etc.) em `frontend/src/features/budgets/types/budget.ts`](T028-criar-interfaces-typescript-budget-budgetitem/issue.md) `[P]` `[US1]`
- [T029: Criar schemas Zod de validação (budgetCreateSchema, budgetItemSchema, discountSchema) em `frontend/src/features/budgets/schemas/budgetSchema.ts`](T029-criar-schemas-zod-de-validacao-budgetcreatesc/issue.md) `[P]` `[US1]`
- [T030: Criar serviço de API Axios (createBudget, listBudgets, getBudget, addItem, applyDiscount, changeStatus) em `frontend/src/features/budgets/services/budgetApi.ts`](T030-criar-servico-de-api-axios-createbudget-listb/issue.md) `[US1]`
- [T031: Criar custom hooks React Query (useBudgets, useBudget, useCreateBudget, useAddItem, useApplyDiscount) em `frontend/src/features/budgets/hooks/useBudgets.ts`](T031-criar-custom-hooks-react-query-usebudgets-use/issue.md) `[US1]`
- [T032: Criar componente `BudgetStatusBadge` (badge visual colorido por status com indicador de expirado) em `frontend/src/features/budgets/components/BudgetStatusBadge.tsx`](T032-criar-componente-budgetstatusbadge-badge-visu/issue.md) `[US1]`
- [T033: Criar componente `BudgetForm` (formulário de dados do cliente com react-hook-form + zod) em `frontend/src/features/budgets/components/BudgetForm.tsx`](T033-criar-componente-budgetform-formulario-de-dad/issue.md) `[US1]`
- [T034: Criar componente `BudgetItemForm` (formulário de adição de item com medidas, cor, vidro, abertura) em `frontend/src/features/budgets/components/BudgetItemForm.tsx`](T034-criar-componente-budgetitemform-formulario-de/issue.md) `[US1]`
- [T035: Criar componente `BudgetItemsTable` (tabela dos itens do orçamento com valores) em `frontend/src/features/budgets/components/BudgetItemsTable.tsx`](T035-criar-componente-budgetitemstable-tabela-dos-/issue.md) `[US1]`
- [T036: Criar componente `DiscountPanel` (painel de desconto % ou R$, seleção de condição de pagamento, validade) em `frontend/src/features/budgets/components/DiscountPanel.tsx`](T036-criar-componente-discountpanel-painel-de-desc/issue.md) `[US1]`
- [T037: Criar componente `BudgetSummaryCard` (card com valor bruto, desconto, taxas e total líquido) em `frontend/src/features/budgets/components/BudgetSummaryCard.tsx`](T037-criar-componente-budgetsummarycard-card-com-v/issue.md) `[US1]`
- [T038: Criar página `BudgetCreatePage` (montagem completa do orçamento com formulário, itens e desconto) em `frontend/src/pages/BudgetCreatePage.tsx`](T038-criar-pagina-budgetcreatepage-montagem-comple/issue.md) `[US1]`
- [T039: Criar página `BudgetListPage` (listagem paginada com filtros de status e busca) em `frontend/src/pages/BudgetListPage.tsx`](T039-criar-pagina-budgetlistpage-listagem-paginada/issue.md) `[US1]`
- [T040: Adicionar rotas `/orcamentos`, `/orcamentos/novo`, `/orcamentos/:id` no React Router em `frontend/src/App.tsx` (ou arquivo de rotas existente)](T040-adicionar-rotas-orcamentos-orcamentos-novo-or/issue.md) `[US1]`

### Phase 4: User Story 2 - Emissão de PDF Comercial (Priority: P1)

- [T041: Criar `BudgetPdfService` com método `gerarPdfComercial(Budget)` usando OpenPDF: cabeçalho institucional com logo, dados do cliente, tabela de itens (medidas + valores), descontos, total líquido, condição de pagamento, validade e observações em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java`](T041-criar-budgetpdfservice-com-metodo-gerarpdfcom/issue.md) `[US2]`
- [T042: Implementar paginação automática no PDF com rodapé "Página X de Y" e repetição de cabeçalho simplificado no `BudgetPdfService`](T042-implementar-paginacao-automatica-no-pdf-com-r/issue.md) `[US2]`
- [T043: Implementar método `gerarResumoWhatsApp(Budget)` que retorna texto formatado com emojis para copiar/enviar via WhatsApp no `BudgetPdfService`](T043-implementar-metodo-gerarresumowhatsapp-budget/issue.md) `[US2]`
- [T044: Adicionar endpoint GET /api/budgets/{id}/pdf/comercial no `BudgetController` (retorna application/pdf com Content-Disposition attachment)](T044-adicionar-endpoint-get-api-budgets-id-pdf-com/issue.md) `[US2]`
- [T045: Adicionar endpoint GET /api/budgets/{id}/resumo-whatsapp no `BudgetController` (retorna text/plain UTF-8)](T045-adicionar-endpoint-get-api-budgets-id-resumo-/issue.md) `[US2]`
- [T046: Criar teste do `BudgetPdfService.gerarPdfComercial()` (verificar bytes não-vazios e content-type) em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfServiceTest.java`](T046-criar-teste-do-budgetpdfservice-gerarpdfcomer/issue.md) `[P]` `[US2]`
- [T047: Criar teste do endpoint de resumo WhatsApp (verificar formatação e presença dos dados essenciais)](T047-criar-teste-do-endpoint-de-resumo-whatsapp-ve/issue.md) `[P]` `[US2]`
- [T048: Adicionar funções `downloadPdfComercial()` e `copiarResumoWhatsApp()` no serviço `frontend/src/features/budgets/services/budgetApi.ts`](T048-adicionar-funcoes-downloadpdfcomercial-e-copi/issue.md) `[US2]`
- [T049: Criar página `BudgetDetailPage` com visualização do orçamento, botões "Emitir PDF Comercial", "Copiar para WhatsApp" e ações de status em `frontend/src/pages/BudgetDetailPage.tsx`](T049-criar-pagina-budgetdetailpage-com-visualizaca/issue.md) `[US2]`
- [T050: Implementar lógica de cópia para área de transferência (Clipboard API) e link WhatsApp (`https://api.whatsapp.com/send?text=...`) no `BudgetDetailPage`](T050-implementar-logica-de-copia-para-area-de-tran/issue.md) `[US2]`

### Phase 5: User Story 3 - Emissão de PDF Técnico / Oficina (Priority: P2)

- [T051: Implementar método `gerarPdfTecnico(Budget)` no `BudgetPdfService` com layout focado em engenharia: medidas nominais (L x A mm), modelo da esquadria, cor do alumínio, tipo/espessura do vidro, lado de abertura, ferragens/acessórios — omitindo rigorosamente quaisquer campos de preço](T051-implementar-metodo-gerarpdftecnico-budget-no-/issue.md) `[US3]`
- [T052: Adicionar endpoint GET /api/budgets/{id}/pdf/tecnico no `BudgetController` (retorna application/pdf)](T052-adicionar-endpoint-get-api-budgets-id-pdf-tec/issue.md) `[US3]`
- [T053: Criar teste que extrai texto do PDF técnico gerado e verifica ausência de padrão monetário (R$, valor, preço, total) em `BudgetPdfServiceTest`](T053-criar-teste-que-extrai-texto-do-pdf-tecnico-g/issue.md) `[US3]`
- [T054: Adicionar botão "Emitir Via Técnica (Oficina)" e função `downloadPdfTecnico()` na `BudgetDetailPage` em `frontend/src/pages/BudgetDetailPage.tsx`](T054-adicionar-botao-emitir-via-tecnica-oficina-e-/issue.md) `[US3]`

### Phase 6: User Story 4 - Homologação da Release 1 (Priority: P2)

- [T055: Executar `mvn clean verify` e corrigir qualquer falha nos testes unitários e de integração do backend](T055-executar-mvn-clean-verify-e-corrigir-qualquer/issue.md) `[US4]`
- [T056: Executar `npm run build` no frontend e corrigir erros de compilação TypeScript](T056-executar-npm-run-build-no-frontend-e-corrigir/issue.md) `[US4]`
- [T057: Validar os cenários de quickstart.md (Cenários 1 a 7) manualmente no ambiente local](T057-validar-os-cenarios-de-quickstart-md-cenarios/issue.md) `[US4]`
- [T058: Verificar que o SonarQube Quality Gate passa no pipeline de CI do GitHub Actions](T058-verificar-que-o-sonarqube-quality-gate-passa-/issue.md) `[US4]`
- [T059: Documentar resultado dos Testes de Aceitação (TEA) da Release 1 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Sprint04.md`](T059-documentar-resultado-dos-testes-de-aceitacao-/issue.md) `[US4]`

### Phase 7: Polish & Cross-Cutting Concerns

- [T060: Adicionar documentação OpenAPI/Swagger nos endpoints do `BudgetController` com anotações `@Operation`, `@ApiResponse` do springdoc](T060-adicionar-documentacao-openapi-swagger-nos-en/issue.md) `[P]`
- [T061: Atualizar o link de navegação no sidebar/menu do frontend para incluir "Orçamentos" com ícone Lucide](T061-atualizar-o-link-de-navegacao-no-sidebar-menu/issue.md) `[P]`
- [T062: Revisar e garantir responsividade mobile (PWA) nas telas de orçamentos](T062-revisar-e-garantir-responsividade-mobile-pwa-/issue.md)
- [T063: Validar tratamento de campos ausentes no PDF (cliente sem CPF/endereço → exibir "Não informado")](T063-validar-tratamento-de-campos-ausentes-no-pdf-/issue.md)
- [T064: Executar validação completa do `quickstart.md` e marcar checklist final](T064-executar-validacao-completa-do-quickstart-md-/issue.md)
