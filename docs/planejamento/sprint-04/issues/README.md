# 📌 Issues de Implementação — Sprint 04 — Descontos Comerciais, Emissão de PDF e Homologação R1

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-09: Aplicar Descontos e Condições Comerciais no Orçamento

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-09.1](US-09.1-adicionar-dependencia-com-github-librepdf-ope/issue.md) | Adicionar dependência `com.github.librepdf:openpdf:2.0.3` no `backend/pom.xml` | `backlog` | 🔲 Aberta |
| [US-09.2](US-09.2-adicionar-o-logotipo-da-alumiportas-em-backen/issue.md) | Adicionar o logotipo da Alumiportas em `backend/src/main/resources/static/logo-alumiportas.png` | `backlog` | 🔲 Aberta |
| [US-09.3](US-09.3-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V8__create_budgets_schema.sql` com tabelas `budgets` e `budget_itemsconstraints, índices e checks conforme `data-model.md` | `backlog` | 🔲 Aberta |
| [US-09.4](US-09.4-criar-enum-budgetstatus-rascunho-enviado-apro/issue.md) | Criar enum `BudgetStatus` (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetStatus.java` | `backlog` | 🔲 Aberta |
| [US-09.5](US-09.5-criar-enum-discounttype-percentual-valor-fixo/issue.md) | Criar enum `DiscountType` (PERCENTUAL, VALOR_FIXO) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/DiscountType.java` | `backlog` | 🔲 Aberta |
| [US-09.6](US-09.6-criar-enum-paymentcondition-com-label-em-port/issue.md) | Criar enum `PaymentCondition` com label em português (A_VISTA_PIX, ENTRADA_50_SALDO_ENTREGA, CARTAO_12X, A_COMBINAR) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/PaymentCondition.java` | `backlog` | 🔲 Aberta |
| [US-09.7](US-09.7-criar-entidade-jpa-budget-com-todos-os-campos/issue.md) | Criar entidade JPA `Budget` com todos os campos, relacionamentos, auditoria (createdAt/updatedAt) e soft delete conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/Budget.java` | `backlog` | 🔲 Aberta |
| [US-09.8](US-09.8-criar-entidade-jpa-budgetitem-com-fk-para-bud/issue.md) | Criar entidade JPA `BudgetItem` com FK para Budget (CASCADE), campos técnicos (medidas, cor, vidro, abertura, ferragens) e valores conforme `data-model.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/domain/BudgetItem.java` | `backlog` | 🔲 Aberta |
| [US-09.9](US-09.9-criar-repositorio-budgetrepository-jpareposit/issue.md) | Criar repositório `BudgetRepository` (JpaRepository) com queries customizadas (findByCodigo, busca por status, busca por nome do cliente) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetRepository.java` | `backlog` | 🔲 Aberta |
| [US-09.10](US-09.10-criar-repositorio-budgetitemrepository-jparep/issue.md) | Criar repositório `BudgetItemRepository` (JpaRepository) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/repository/BudgetItemRepository.java` | `backlog` | 🔲 Aberta |
| [US-09.11](US-09.11-criar-gerador-de-codigo-sequencial-budgetcode/issue.md) | Criar gerador de código sequencial `BudgetCodeGenerator` (formato ORC-YYYY-NNNN) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetCodeGenerator.java` | `backlog` | 🔲 Aberta |
| [US-09.12](US-09.12-criar-record-budgetcreaterequest-clientenome-/issue.md) | Criar record `BudgetCreateRequest` (clienteNome, clienteTelefone, clienteEndereco, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetCreateRequest.java` | `backlog` | 🔲 Aberta |
| [US-09.13](US-09.13-criar-record-budgetitemcreaterequest-producti/issue.md) | Criar record `BudgetItemCreateRequest` (productId, descricao, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, ferragens, valorUnitario) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemCreateRequest.java` | `backlog` | 🔲 Aberta |
| [US-09.14](US-09.14-criar-record-discountrequest-tipodesconto-val/issue.md) | Criar record `DiscountRequest` (tipoDesconto, valor, condicaoPagamento, observacoesPagamento, dataValidade) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/DiscountRequest.java` | `backlog` | 🔲 Aberta |
| [US-09.15](US-09.15-criar-record-statuschangerequest-novostatus-e/issue.md) | Criar record `StatusChangeRequest` (novoStatus) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/StatusChangeRequest.java` | `backlog` | 🔲 Aberta |
| [US-09.16](US-09.16-criar-record-budgetresponse-resposta-completa/issue.md) | Criar record `BudgetResponse` (resposta completa com items e labels) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetResponse.java` | `backlog` | 🔲 Aberta |
| [US-09.17](US-09.17-criar-record-budgetsummaryresponse-resumo-par/issue.md) | Criar record `BudgetSummaryResponse` (resumo para listagem) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetSummaryResponse.java` | `backlog` | 🔲 Aberta |
| [US-09.18](US-09.18-criar-record-budgetitemresponse-em-backend-sr/issue.md) | Criar record `BudgetItemResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetItemResponse.java` | `backlog` | 🔲 Aberta |
| [US-09.19](US-09.19-criar-mapper-mapstruct-budgetmapper-entity-dt/issue.md) | Criar mapper MapStruct `BudgetMapper` (Entity ↔ DTOs, incluindo cálculo de campo `expirado` e `condicaoPagamentoLabel`) em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/mapper/BudgetMapper.java` | `backlog` | 🔲 Aberta |
| [US-09.20](US-09.20-criar-budgetservice-com-logica-de-criacao-de-/issue.md) | Criar `BudgetService` com lógica de criação de orçamento (geração de código sequencial, dataValidade = emissão + 15 dias)@Transactional(readOnly=true)` na classe e `@Transactional` nos métodos de mutação em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetService.java` | `backlog` | 🔲 Aberta |
| [US-09.21](US-09.21-implementar-metodo-adicionaritem-no-budgetser/issue.md) | Implementar método `adicionarItem()` no `BudgetService` com recálculo automático do `valorBruto` do orçamento | `backlog` | 🔲 Aberta |
| [US-09.22](US-09.22-implementar-metodo-aplicardesconto-no-budgets/issue.md) | Implementar método `aplicarDesconto()` no `BudgetService` com cálculo bidirecional (percentual ↔ valor fixo), validação de limites (desconto <= valorBruto) e persistência de condições de pagamento | `backlog` | 🔲 Aberta |
| [US-09.23](US-09.23-implementar-metodo-alterarstatus-no-budgetser/issue.md) | Implementar método `alterarStatus()` no `BudgetService` com máquina de estados (transições válidas conforme `data-model.md`) | `backlog` | 🔲 Aberta |
| [US-09.24](US-09.24-implementar-metodo-listar-no-budgetservice-co/issue.md) | Implementar método `listar()` no `BudgetService` com paginação, filtro por status e busca por código/nome do cliente | `backlog` | 🔲 Aberta |
| [US-09.25](US-09.25-criar-budgetcontroller-com-endpoints-post-api/issue.md) | Criar `BudgetController` com endpoints POST /api/budgets, GET /api/budgets, GET /api/budgets/{id}, POST /api/budgets/{id}/items, PUT /api/budgets/{id}/discount, PATCH /api/budgets/{id}/status conforme `contracts/api-budgets.md` em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/controller/BudgetController.java` | `backlog` | 🔲 Aberta |
| [US-09.26](US-09.26-criar-testes-unitarios-do-budgetservice-criac/issue.md) | Criar testes unitários do `BudgetService` (criação, desconto percentual, desconto valor fixo, validações de limites, transições de status) em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetServiceTest.java` | `backlog` | 🔲 Aberta |
| [US-09.27](US-09.27-criar-testes-de-integracao-do-budgetcontrolle/issue.md) | Criar testes de integração do `BudgetController` (endpoints CRUD, desconto, status) com H2 em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/controller/BudgetControllerIntegrationTest.java` | `backlog` | 🔲 Aberta |
| [US-09.28](US-09.28-criar-interfaces-typescript-budget-budgetitem/issue.md) | Criar interfaces TypeScript (Budget, BudgetItem, BudgetCreateRequest, DiscountRequest, etc.) em `frontend/src/features/budgets/types/budget.ts` | `backlog` | 🔲 Aberta |
| [US-09.29](US-09.29-criar-schemas-zod-de-validacao-budgetcreatesc/issue.md) | Criar schemas Zod de validação (budgetCreateSchema, budgetItemSchema, discountSchema) em `frontend/src/features/budgets/schemas/budgetSchema.ts` | `backlog` | 🔲 Aberta |
| [US-09.30](US-09.30-criar-servico-de-api-axios-createbudget-listb/issue.md) | Criar serviço de API Axios (createBudget, listBudgets, getBudget, addItem, applyDiscount, changeStatus) em `frontend/src/features/budgets/services/budgetApi.ts` | `backlog` | 🔲 Aberta |
| [US-09.31](US-09.31-criar-custom-hooks-react-query-usebudgets-use/issue.md) | Criar custom hooks React Query (useBudgets, useBudget, useCreateBudget, useAddItem, useApplyDiscount) em `frontend/src/features/budgets/hooks/useBudgets.ts` | `backlog` | 🔲 Aberta |
| [US-09.32](US-09.32-criar-componente-budgetstatusbadge-badge-visu/issue.md) | Criar componente `BudgetStatusBadge` (badge visual colorido por status com indicador de expirado) em `frontend/src/features/budgets/components/BudgetStatusBadge.tsx` | `backlog` | 🔲 Aberta |
| [US-09.33](US-09.33-criar-componente-budgetform-formulario-de-dad/issue.md) | Criar componente `BudgetForm` (formulário de dados do cliente com react-hook-form + zod) em `frontend/src/features/budgets/components/BudgetForm.tsx` | `backlog` | 🔲 Aberta |
| [US-09.34](US-09.34-criar-componente-budgetitemform-formulario-de/issue.md) | Criar componente `BudgetItemForm` (formulário de adição de item com medidas, cor, vidro, abertura) em `frontend/src/features/budgets/components/BudgetItemForm.tsx` | `backlog` | 🔲 Aberta |
| [US-09.35](US-09.35-criar-componente-budgetitemstable-tabela-dos-/issue.md) | Criar componente `BudgetItemsTable` (tabela dos itens do orçamento com valores) em `frontend/src/features/budgets/components/BudgetItemsTable.tsx` | `backlog` | 🔲 Aberta |
| [US-09.36](US-09.36-criar-componente-discountpanel-painel-de-desc/issue.md) | Criar componente `DiscountPanel` (painel de desconto % ou R$, seleção de condição de pagamento, validade) em `frontend/src/features/budgets/components/DiscountPanel.tsx` | `backlog` | 🔲 Aberta |
| [US-09.37](US-09.37-criar-componente-budgetsummarycard-card-com-v/issue.md) | Criar componente `BudgetSummaryCard` (card com valor bruto, desconto, taxas e total líquido) em `frontend/src/features/budgets/components/BudgetSummaryCard.tsx` | `backlog` | 🔲 Aberta |
| [US-09.38](US-09.38-criar-pagina-budgetcreatepage-montagem-comple/issue.md) | Criar página `BudgetCreatePage` (montagem completa do orçamento com formulário, itens e desconto) em `frontend/src/pages/BudgetCreatePage.tsx` | `backlog` | 🔲 Aberta |
| [US-09.39](US-09.39-criar-pagina-budgetlistpage-listagem-paginada/issue.md) | Criar página `BudgetListPage` (listagem paginada com filtros de status e busca) em `frontend/src/pages/BudgetListPage.tsx` | `backlog` | 🔲 Aberta |
| [US-09.40](US-09.40-adicionar-rotas-orcamentos-orcamentos-novo-or/issue.md) | Adicionar rotas `/orcamentos`/orcamentos/novo`/orcamentos/:id` no React Router em `frontend/src/App.tsx` (ou arquivo de rotas existente) | `backlog` | 🔲 Aberta |

## 📦 US-10: Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-10.1](US-10.1-criar-budgetpdfservice-com-metodo-gerarpdfcom/issue.md) | Criar `BudgetPdfService` com método `gerarPdfComercial(Budget)` usando OpenPDF: cabeçalho institucional com logo, dados do cliente, tabela de itens (medidas + valores), descontos, total líquido, condição de pagamento, validade e observações em `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java` | `backlog` | 🔲 Aberta |
| [US-10.2](US-10.2-implementar-paginacao-automatica-no-pdf-com-r/issue.md) | Implementar paginação automática no PDF com rodapé "Página X de Y" e repetição de cabeçalho simplificado no `BudgetPdfService` | `backlog` | 🔲 Aberta |
| [US-10.3](US-10.3-implementar-metodo-gerarresumowhatsapp-budget/issue.md) | Implementar método `gerarResumoWhatsApp(Budget)` que retorna texto formatado com emojis para copiar/enviar via WhatsApp no `BudgetPdfService` | `backlog` | 🔲 Aberta |
| [US-10.4](US-10.4-adicionar-endpoint-get-api-budgets-id-pdf-com/issue.md) | Adicionar endpoint GET /api/budgets/{id}/pdf/comercial no `BudgetController` (retorna application/pdf com Content-Disposition attachment) | `backlog` | 🔲 Aberta |
| [US-10.5](US-10.5-adicionar-endpoint-get-api-budgets-id-resumo-/issue.md) | Adicionar endpoint GET /api/budgets/{id}/resumo-whatsapp no `BudgetController` (retorna text/plain UTF-8) | `backlog` | 🔲 Aberta |
| [US-10.6](US-10.6-criar-teste-do-budgetpdfservice-gerarpdfcomer/issue.md) | Criar teste do `BudgetPdfService.gerarPdfComercial()` (verificar bytes não-vazios e content-type) em `backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfServiceTest.java` | `backlog` | 🔲 Aberta |
| [US-10.7](US-10.7-criar-teste-do-endpoint-de-resumo-whatsapp-ve/issue.md) | Criar teste do endpoint de resumo WhatsApp (verificar formatação e presença dos dados essenciais) | `backlog` | 🔲 Aberta |
| [US-10.8](US-10.8-adicionar-funcoes-downloadpdfcomercial-e-copi/issue.md) | Adicionar funções `downloadPdfComercial()` e `copiarResumoWhatsApp()` no serviço `frontend/src/features/budgets/services/budgetApi.ts` | `backlog` | 🔲 Aberta |
| [US-10.9](US-10.9-criar-pagina-budgetdetailpage-com-visualizaca/issue.md) | Criar página `BudgetDetailPage` com visualização do orçamento, botões "Emitir PDF Comercial", "Copiar para WhatsApp" e ações de status em `frontend/src/pages/BudgetDetailPage.tsx` | `backlog` | 🔲 Aberta |
| [US-10.10](US-10.10-implementar-logica-de-copia-para-area-de-tran/issue.md) | Implementar lógica de cópia para área de transferência (Clipboard API) e link WhatsApp (`https://api.whatsapp.com/send?text=...`) no `BudgetDetailPage` | `backlog` | 🔲 Aberta |

## 📦 US-11: Emitir Orçamento em PDF - Via Técnica de Oficina

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-11.1](US-11.1-implementar-metodo-gerarpdftecnico-budget-no-/issue.md) | Implementar método `gerarPdfTecnico(Budget)` no `BudgetPdfService` com layout focado em engenharia: medidas nominais (L x A mm), modelo da esquadria, cor do alumínio, tipo/espessura do vidro, lado de abertura, ferragens/acessórios — omitindo rigorosamente quaisquer campos de preço | `backlog` | 🔲 Aberta |
| [US-11.2](US-11.2-adicionar-endpoint-get-api-budgets-id-pdf-tec/issue.md) | Adicionar endpoint GET /api/budgets/{id}/pdf/tecnico no `BudgetController` (retorna application/pdf) | `backlog` | 🔲 Aberta |
| [US-11.3](US-11.3-criar-teste-que-extrai-texto-do-pdf-tecnico-g/issue.md) | Criar teste que extrai texto do PDF técnico gerado e verifica ausência de padrão monetário (R$, valor, preço, total) em `BudgetPdfServiceTest` | `backlog` | 🔲 Aberta |
| [US-11.4](US-11.4-adicionar-botao-emitir-via-tecnica-oficina-e-/issue.md) | Adicionar botão "Emitir Via Técnica (Oficina)" e função `downloadPdfTecnico()` na `BudgetDetailPage` em `frontend/src/pages/BudgetDetailPage.tsx` | `backlog` | 🔲 Aberta |

## 📦 US-12: Homologação Integrada e Validação da Release 1 (v1.0.0)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-12.1](US-12.1-executar-mvn-clean-verify-e-corrigir-qualquer/issue.md) | Executar `mvn clean verify` e corrigir qualquer falha nos testes unitários e de integração do backend | `backlog` | 🔲 Aberta |
| [US-12.2](US-12.2-executar-npm-run-build-no-frontend-e-corrigir/issue.md) | Executar `npm run build` no frontend e corrigir erros de compilação TypeScript | `backlog` | 🔲 Aberta |
| [US-12.3](US-12.3-validar-os-cenarios-de-quickstart-md-cenarios/issue.md) | Validar os cenários de quickstart.md (Cenários 1 a 7) manualmente no ambiente local | `backlog` | 🔲 Aberta |
| [US-12.4](US-12.4-verificar-que-o-sonarqube-quality-gate-passa-/issue.md) | Verificar que o SonarQube Quality Gate passa no pipeline de CI do GitHub Actions | `backlog` | 🔲 Aberta |
| [US-12.5](US-12.5-documentar-resultado-dos-testes-de-aceitacao-/issue.md) | Documentar resultado dos Testes de Aceitação (TEA) da Release 1 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Sprint04.md` | `backlog` | 🔲 Aberta |
| [US-12.6](US-12.6-adicionar-documentacao-openapi-swagger-nos-en/issue.md) | Adicionar documentação OpenAPI/Swagger nos endpoints do `BudgetController` com anotações `@Operation`@ApiResponse` do springdoc | `backlog` | 🔲 Aberta |
| [US-12.7](US-12.7-atualizar-o-link-de-navegacao-no-sidebar-menu/issue.md) | Atualizar o link de navegação no sidebar/menu do frontend para incluir "Orçamentos" com ícone Lucide | `backlog` | 🔲 Aberta |
| [US-12.8](US-12.8-revisar-e-garantir-responsividade-mobile-pwa-/issue.md) | Revisar e garantir responsividade mobile (PWA) nas telas de orçamentos | `backlog` | 🔲 Aberta |
| [US-12.9](US-12.9-validar-tratamento-de-campos-ausentes-no-pdf-/issue.md) | Validar tratamento de campos ausentes no PDF (cliente sem CPF/endereço → exibir "Não informado") | `backlog` | 🔲 Aberta |
| [US-12.10](US-12.10-executar-validacao-completa-do-quickstart-md-/issue.md) | Executar validação completa do `quickstart.md` e marcar checklist final | `backlog` | 🔲 Aberta |

