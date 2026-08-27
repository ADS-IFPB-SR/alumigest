# Tasks: Sprint 4 — Descontos Comerciais, Emissão de PDF (Comercial/Técnico) e Homologação R1

**Feature**: `001-orcamento-descontos-pdf`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-budgets.md, research.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependência do OpenPDF e recurso estático do logotipo

- [ ] T001 Adicionar dependência `com.github.librepdf:openpdf:2.0.3` no `backend/pom.xml`
- [ ] T002 [P] Adicionar o logotipo da Alumiportas em `backend/src/main/resources/static/logo-alumiportas.png`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Migration Flyway, Entidades JPA e Enums que são pré-requisito para TODAS as User Stories

**⚠️ CRITICAL**: Nenhuma User Story pode ser iniciada antes da conclusão desta fase

- [ ] T003 Criar migration Flyway `backend/src/main/resources/db/migration/V8__create_budgets_schema.sql` com tabelas `budgets` e `budget_items`, constraints, índices e checks conforme `data-model.md`
- [ ] T004 [P] Criar enum `BudgetStatus` (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java`
- [ ] T005 [P] Criar enum `DiscountType` (PERCENTUAL, VALOR_FIXO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/DiscountType.java`
- [ ] T006 [P] Criar enum `PaymentCondition` com label em português (A_VISTA_PIX, ENTRADA_50_SALDO_ENTREGA, CARTAO_12X, A_COMBINAR) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/PaymentCondition.java`
- [ ] T007 Criar entidade JPA `Budget` com todos os campos, relacionamentos, auditoria (createdAt/updatedAt) e soft delete conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/Budget.java`
- [ ] T008 Criar entidade JPA `BudgetItem` com FK para Budget (CASCADE), campos técnicos (medidas, cor, vidro, abertura, ferragens) e valores conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetItem.java`
- [ ] T009 [P] Criar repositório `BudgetRepository` (JpaRepository) com queries customizadas (findByCodigo, busca por status, busca por nome do cliente) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetRepository.java`
- [ ] T010 [P] Criar repositório `BudgetItemRepository` (JpaRepository) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetItemRepository.java`
- [ ] T011 Criar gerador de código sequencial `BudgetCodeGenerator` (formato ORC-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetCodeGenerator.java`

**Checkpoint**: Fundação pronta — as entidades, enums, repositórios e migration estão no banco. As User Stories podem iniciar.

---

## Phase 3: User Story 1 - Descontos e Condições Comerciais (Priority: P1) 🎯 MVP

**Goal**: Permitir criar orçamentos, adicionar itens, aplicar descontos (% ou R$), selecionar condição de pagamento e recalcular totais em tempo real.

**Independent Test**: Criar orçamento via API, adicionar itens, aplicar desconto de 10%, verificar recálculo do valorLiquido.

### DTOs (Request/Response)

- [ ] T012 [P] [US1] Criar record `BudgetCreateRequest` (clienteNome, clienteTelefone, clienteEndereco, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetCreateRequest.java`
- [ ] T013 [P] [US1] Criar record `BudgetItemCreateRequest` (productId, descricao, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, ferragens, valorUnitario) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemCreateRequest.java`
- [ ] T014 [P] [US1] Criar record `DiscountRequest` (tipoDesconto, valor, condicaoPagamento, observacoesPagamento, dataValidade) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/DiscountRequest.java`
- [ ] T015 [P] [US1] Criar record `StatusChangeRequest` (novoStatus) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/StatusChangeRequest.java`
- [ ] T016 [P] [US1] Criar record `BudgetResponse` (resposta completa com items e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetResponse.java`
- [ ] T017 [P] [US1] Criar record `BudgetSummaryResponse` (resumo para listagem) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetSummaryResponse.java`
- [ ] T018 [P] [US1] Criar record `BudgetItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemResponse.java`

### Mapper MapStruct

- [ ] T019 [US1] Criar mapper MapStruct `BudgetMapper` (Entity ↔ DTOs, incluindo cálculo de campo `expirado` e `condicaoPagamentoLabel`) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/mapper/BudgetMapper.java`

### Service Layer

- [ ] T020 [US1] Criar `BudgetService` com lógica de criação de orçamento (geração de código sequencial, dataValidade = emissão + 15 dias), `@Transactional(readOnly=true)` na classe e `@Transactional` nos métodos de mutação em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetService.java`
- [ ] T021 [US1] Implementar método `adicionarItem()` no `BudgetService` com recálculo automático do `valorBruto` do orçamento
- [ ] T022 [US1] Implementar método `aplicarDesconto()` no `BudgetService` com cálculo bidirecional (percentual ↔ valor fixo), validação de limites (desconto <= valorBruto) e persistência de condições de pagamento
- [ ] T023 [US1] Implementar método `alterarStatus()` no `BudgetService` com máquina de estados (transições válidas conforme `data-model.md`)
- [ ] T024 [US1] Implementar método `listar()` no `BudgetService` com paginação, filtro por status e busca por código/nome do cliente

### Controller REST

- [ ] T025 [US1] Criar `BudgetController` com endpoints POST /api/budgets, GET /api/budgets, GET /api/budgets/{id}, POST /api/budgets/{id}/items, PUT /api/budgets/{id}/discount, PATCH /api/budgets/{id}/status conforme `contracts/api-budgets.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/controller/BudgetController.java`

### Testes Backend

- [ ] T026 [P] [US1] Criar testes unitários do `BudgetService` (criação, desconto percentual, desconto valor fixo, validações de limites, transições de status) em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetServiceTest.java`
- [ ] T027 [US1] Criar testes de integração do `BudgetController` (endpoints CRUD, desconto, status) com H2 em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/controller/BudgetControllerIntegrationTest.java`

### Frontend — Tipos, Serviços e Hooks

- [ ] T028 [P] [US1] Criar interfaces TypeScript (Budget, BudgetItem, BudgetCreateRequest, DiscountRequest, etc.) em `frontend/src/features/budgets/types/budget.ts`
- [ ] T029 [P] [US1] Criar schemas Zod de validação (budgetCreateSchema, budgetItemSchema, discountSchema) em `frontend/src/features/budgets/schemas/budgetSchema.ts`
- [ ] T030 [US1] Criar serviço de API Axios (createBudget, listBudgets, getBudget, addItem, applyDiscount, changeStatus) em `frontend/src/features/budgets/services/budgetApi.ts`
- [ ] T031 [US1] Criar custom hooks React Query (useBudgets, useBudget, useCreateBudget, useAddItem, useApplyDiscount) em `frontend/src/features/budgets/hooks/useBudgets.ts`

### Frontend — Componentes e Páginas

- [ ] T032 [US1] Criar componente `BudgetStatusBadge` (badge visual colorido por status com indicador de expirado) em `frontend/src/features/budgets/components/BudgetStatusBadge.tsx`
- [ ] T033 [US1] Criar componente `BudgetForm` (formulário de dados do cliente com react-hook-form + zod) em `frontend/src/features/budgets/components/BudgetForm.tsx`
- [ ] T034 [US1] Criar componente `BudgetItemForm` (formulário de adição de item com medidas, cor, vidro, abertura) em `frontend/src/features/budgets/components/BudgetItemForm.tsx`
- [ ] T035 [US1] Criar componente `BudgetItemsTable` (tabela dos itens do orçamento com valores) em `frontend/src/features/budgets/components/BudgetItemsTable.tsx`
- [ ] T036 [US1] Criar componente `DiscountPanel` (painel de desconto % ou R$, seleção de condição de pagamento, validade) em `frontend/src/features/budgets/components/DiscountPanel.tsx`
- [ ] T037 [US1] Criar componente `BudgetSummaryCard` (card com valor bruto, desconto, taxas e total líquido) em `frontend/src/features/budgets/components/BudgetSummaryCard.tsx`
- [ ] T038 [US1] Criar página `BudgetCreatePage` (montagem completa do orçamento com formulário, itens e desconto) em `frontend/src/pages/BudgetCreatePage.tsx`
- [ ] T039 [US1] Criar página `BudgetListPage` (listagem paginada com filtros de status e busca) em `frontend/src/pages/BudgetListPage.tsx`
- [ ] T040 [US1] Adicionar rotas `/orcamentos`, `/orcamentos/novo`, `/orcamentos/:id` no React Router em `frontend/src/App.tsx` (ou arquivo de rotas existente)

**Checkpoint**: Orçamentos podem ser criados, itens adicionados, descontos aplicados e listados. US1 é testável e entrega valor de forma independente (MVP).

---

## Phase 4: User Story 2 - Emissão de PDF Comercial (Priority: P1)

**Goal**: Gerar e baixar o PDF oficial do orçamento com layout profissional, incluindo logotipo, dados do cliente, itens com valores, descontos e condições comerciais. Opção de copiar resumo para WhatsApp.

**Independent Test**: Gerar PDF comercial de um orçamento existente, verificar presença de todos os campos e download correto.

### Backend — Serviço de PDF

- [ ] T041 [US2] Criar `BudgetPdfService` com método `gerarPdfComercial(Budget)` usando OpenPDF: cabeçalho institucional com logo, dados do cliente, tabela de itens (medidas + valores), descontos, total líquido, condição de pagamento, validade e observações em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java`
- [ ] T042 [US2] Implementar paginação automática no PDF com rodapé "Página X de Y" e repetição de cabeçalho simplificado no `BudgetPdfService`
- [ ] T043 [US2] Implementar método `gerarResumoWhatsApp(Budget)` que retorna texto formatado com emojis para copiar/enviar via WhatsApp no `BudgetPdfService`

### Backend — Endpoints de PDF

- [ ] T044 [US2] Adicionar endpoint GET /api/budgets/{id}/pdf/comercial no `BudgetController` (retorna application/pdf com Content-Disposition attachment)
- [ ] T045 [US2] Adicionar endpoint GET /api/budgets/{id}/resumo-whatsapp no `BudgetController` (retorna text/plain UTF-8)

### Testes Backend — PDF

- [ ] T046 [P] [US2] Criar teste do `BudgetPdfService.gerarPdfComercial()` (verificar bytes não-vazios e content-type) em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfServiceTest.java`
- [ ] T047 [P] [US2] Criar teste do endpoint de resumo WhatsApp (verificar formatação e presença dos dados essenciais)

### Frontend — Ações de PDF e WhatsApp

- [ ] T048 [US2] Adicionar funções `downloadPdfComercial()` e `copiarResumoWhatsApp()` no serviço `frontend/src/features/budgets/services/budgetApi.ts`
- [ ] T049 [US2] Criar página `BudgetDetailPage` com visualização do orçamento, botões "Emitir PDF Comercial", "Copiar para WhatsApp" e ações de status em `frontend/src/pages/BudgetDetailPage.tsx`
- [ ] T050 [US2] Implementar lógica de cópia para área de transferência (Clipboard API) e link WhatsApp (`https://api.whatsapp.com/send?text=...`) no `BudgetDetailPage`

**Checkpoint**: PDFs comerciais podem ser gerados e baixados. Resumo copiável para WhatsApp funciona.

---

## Phase 5: User Story 3 - Emissão de PDF Técnico / Oficina (Priority: P2)

**Goal**: Gerar PDF com todas as especificações técnicas (medidas, modelos, cores, vidros, aberturas, ferragens) sem nenhum valor monetário.

**Independent Test**: Gerar PDF técnico e confirmar ausência total de preços/valores em R$.

### Backend — PDF Técnico

- [ ] T051 [US3] Implementar método `gerarPdfTecnico(Budget)` no `BudgetPdfService` com layout focado em engenharia: medidas nominais (L x A mm), modelo da esquadria, cor do alumínio, tipo/espessura do vidro, lado de abertura, ferragens/acessórios — omitindo rigorosamente quaisquer campos de preço

### Backend — Endpoint

- [ ] T052 [US3] Adicionar endpoint GET /api/budgets/{id}/pdf/tecnico no `BudgetController` (retorna application/pdf)

### Testes Backend

- [ ] T053 [US3] Criar teste que extrai texto do PDF técnico gerado e verifica ausência de padrão monetário (R$, valor, preço, total) em `BudgetPdfServiceTest`

### Frontend

- [ ] T054 [US3] Adicionar botão "Emitir Via Técnica (Oficina)" e função `downloadPdfTecnico()` na `BudgetDetailPage` em `frontend/src/pages/BudgetDetailPage.tsx`

**Checkpoint**: Via técnica para oficina pode ser gerada. Nenhum valor monetário é exibido.

---

## Phase 6: User Story 4 - Homologação da Release 1 (Priority: P2)

**Goal**: Validar o fluxo completo E2E da Release 1: Catálogo → Produto → Motor de Cálculo → Orçamento → Desconto → PDF.

**Independent Test**: Executar pipeline CI com SonarQube e percorrer o fluxo completo sem falhas.

- [ ] T055 [US4] Executar `mvn clean verify` e corrigir qualquer falha nos testes unitários e de integração do backend
- [ ] T056 [US4] Executar `npm run build` no frontend e corrigir erros de compilação TypeScript
- [ ] T057 [US4] Validar os cenários de quickstart.md (Cenários 1 a 7) manualmente no ambiente local
- [ ] T058 [US4] Verificar que o SonarQube Quality Gate passa no pipeline de CI do GitHub Actions
- [ ] T059 [US4] Documentar resultado dos Testes de Aceitação (TEA) da Release 1 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Sprint04.md`

**Checkpoint**: Release 1 (v1.0.0) homologada — todos os testes passam e o fluxo E2E é validado.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Refinamentos que afetam múltiplas User Stories

- [ ] T060 [P] Adicionar documentação OpenAPI/Swagger nos endpoints do `BudgetController` com anotações `@Operation`, `@ApiResponse` do springdoc
- [ ] T061 [P] Atualizar o link de navegação no sidebar/menu do frontend para incluir "Orçamentos" com ícone Lucide
- [ ] T062 Revisar e garantir responsividade mobile (PWA) nas telas de orçamentos
- [ ] T063 Validar tratamento de campos ausentes no PDF (cliente sem CPF/endereço → exibir "Não informado")
- [ ] T064 Executar validação completa do `quickstart.md` e marcar checklist final

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente
- **Foundational (Phase 2)**: Depende da conclusão do Setup — BLOQUEIA todas as User Stories
- **US1 (Phase 3)**: Depende da Phase 2 — é o MVP e pode iniciar primeiro
- **US2 (Phase 4)**: Depende de US1 (precisa de orçamento com itens para gerar PDF)
- **US3 (Phase 5)**: Depende de US2 (reutiliza BudgetPdfService)
- **US4 (Phase 6)**: Depende de US1, US2 e US3 (validação E2E completa)
- **Polish (Phase 7)**: Depende de todas as User Stories desejadas

### Fluxo de Dependência

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational: Migration + Entidades + Repos)
    │
    ▼
Phase 3 (US1: CRUD + Descontos + Frontend) ← MVP
    │
    ▼
Phase 4 (US2: PDF Comercial + WhatsApp)
    │
    ▼
Phase 5 (US3: PDF Técnico/Oficina)
    │
    ▼
Phase 6 (US4: Homologação R1)
    │
    ▼
Phase 7 (Polish)
```

### Parallel Opportunities

**Dentro da Phase 2 (Foundational)**:
- T004, T005, T006 (Enums) → todos em paralelo
- T009, T010 (Repositories) → em paralelo após T007/T008

**Dentro da Phase 3 (US1)**:
- T012 a T018 (todos os DTOs) → em paralelo
- T028, T029 (tipos e schemas frontend) → em paralelo com DTOs backend
- T026, T027 (testes backend) → em paralelo com componentes frontend

**Dentro da Phase 4 (US2)**:
- T046, T047 (testes de PDF) → em paralelo

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup (T001–T002)
2. Completar Phase 2: Foundational (T003–T011)
3. Completar Phase 3: User Story 1 (T012–T040)
4. **PARAR E VALIDAR**: Testar US1 de forma independente
5. Deploy/demo se pronto → já entrega valor

### Incremental Delivery

1. Setup + Foundational → Base pronta
2. US1 (Descontos + CRUD) → **MVP!** Testar e demonstrar
3. US2 (PDF Comercial + WhatsApp) → Testar e demonstrar
4. US3 (PDF Técnico) → Testar e demonstrar
5. US4 (Homologação R1) → Validação final da v1.0.0
6. Polish → Refinamentos finais

### Parallel Team Strategy

Com múltiplos desenvolvedores após Phase 2 concluída:
- **Dev A (Backend)**: T012–T027 (DTOs, Service, Controller, Testes)
- **Dev B (Frontend)**: T028–T040 (Tipos, Hooks, Componentes, Páginas)
- **Dev C (PDF)**: T041–T054 (BudgetPdfService, endpoints de PDF, testes)