# 📌 Issues de Implementação — Sprint 05 — Emitir e Exportar Orçamento em PDF (Via Comercial, WhatsApp, Técnico de Oficina) e Homologação Integrada e Validação da Release 1 (v1.0.0)

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

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


