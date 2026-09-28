# 📌 Issues de Implementação — Sprint 05 — Orçamentos, PDFs e Homologação R1

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes da Sprint 05.

## 📦 US-10: Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-10.1](US-10.1-criar-budgetpdfservice-com-metodo-gerarpdfcom/issue.md) | Criar `BudgetPdfService` com método `gerarPdfComercial(Budget)` usando OpenPDF | `backend` | 🟢 Concluída |
| [US-10.2](US-10.2-implementar-paginacao-automatica-no-pdf-com-r/issue.md) | Implementar paginação automática no PDF com rodapé "Página X de Y" | `backend` | 🟢 Concluída |
| [US-10.3](US-10.3-implementar-metodo-gerarresumowhatsapp-budget/issue.md) | Implementar método `gerarResumoWhatsApp(Budget)` formatado | `backend` | 🟢 Concluída |
| [US-10.4](US-10.4-adicionar-endpoint-get-api-budgets-id-pdf-com/issue.md) | Adicionar endpoint `GET /api/budgets/{id}/pdf` no `BudgetController` | `backend` | 🟢 Concluída |
| [US-10.5](US-10.5-adicionar-endpoint-get-api-budgets-id-resumo-/issue.md) | Adicionar endpoint `GET /api/budgets/{id}/whatsapp-summary` no `BudgetController` | `backend` | 🟢 Concluída |
| [US-10.6](US-10.6-criar-teste-do-budgetpdfservice-gerarpdfcomer/issue.md) | Criar teste unitário do `BudgetPdfService.gerarPdfComercial` | `backend` | 🟢 Concluída |
| [US-10.7](US-10.7-criar-teste-do-endpoint-de-resumo-whatsapp-ve/issue.md) | Criar teste do endpoint de resumo WhatsApp no `BudgetController` | `backend` | 🟢 Concluída |
| [US-10.8](US-10.8-adicionar-funcoes-downloadpdfcomercial-e-copi/issue.md) | Adicionar funções `downloadPdfComercial` e `copiarResumoWhatsApp` na API frontend | `frontend` | 🟢 Concluída |
| [US-10.9](US-10.9-criar-pagina-budgetdetailpage-com-visualizaca/issue.md) | Criar visualização de orçamento na `BudgetDetailPage` com botões de emissão | `frontend` | 🟢 Concluída |
| [US-10.10](US-10.10-implementar-logica-de-copia-para-area-de-tran/issue.md) | Implementar cópia para área de transferência (Clipboard API) com feedback toast | `frontend` | 🟢 Concluída |

## 📦 US-11: Emitir Orçamento em PDF - Via Técnica de Oficina (Sigilo Comercial)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-11.1](US-11.1-implementar-metodo-gerarpdftecnico-budget-no-/issue.md) | Implementar método `gerarPdfTecnico(Budget)` com estrito sigilo comercial | `backend` | 🟢 Concluída |
| [US-11.2](US-11.2-adicionar-endpoint-get-api-budgets-id-pdf-tec/issue.md) | Adicionar endpoint `GET /api/budgets/{id}/technical-pdf` no `BudgetController` | `backend` | 🟢 Concluída |
| [US-11.3](US-11.3-criar-teste-que-extrai-texto-do-pdf-tecnico-g/issue.md) | Criar teste que extrai texto do PDF técnico garantindo ausência de valores monetários | `backend` | 🟢 Concluída |
| [US-11.4](US-11.4-adicionar-botao-emitir-via-tecnica-oficina-e-/issue.md) | Adicionar botão "Via Técnica" na `BudgetDetailPage` com download direto | `frontend` | 🟢 Concluída |

## 📦 US-12 (DoD): Homologação Integrada da Release 1 (v1.0.0)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-12.1](US-12.1-executar-mvn-clean-verify-e-corrigir-qualquer/issue.md) | Executar `mvn clean verify` e corrigir qualquer quebra de teste | `backend` | 🟢 Concluída |
| [US-12.2](US-12.2-executar-npm-run-build-no-frontend-e-corrigir/issue.md) | Executar `npm run build` no frontend e corrigir eventuais erros de tipagem | `frontend` | 🟢 Concluída |
| [US-12.3](US-12.3-validar-os-cenarios-de-quickstart-md-cenarios/issue.md) | Validar cenários do `quickstart.md` da Sprint 05 | `qa` | 🟢 Concluída |
| [US-12.4](US-12.4-verificar-que-o-sonarqube-quality-gate-passa-/issue.md) | Verificar SonarQube Quality Gate no código da release | `ci/cd` | 🟢 Concluída |
| [US-12.5](US-12.5-documentar-resultado-dos-testes-de-aceitacao-/issue.md) | Documentar resultado dos testes de aceitação em `TEA-Testes_de_Aceitacao` | `docs` | 🟢 Concluída |
| [US-12.6](US-12.6-adicionar-documentacao-openapi-swagger-nos-en/issue.md) | Adicionar documentação OpenAPI/Swagger nos endpoints do `BudgetController` | `backend` | 🟢 Concluída |
| [US-12.7](US-12.7-atualizar-o-link-de-navegacao-no-sidebar-menu/issue.md) | Atualizar link de navegação no sidebar menu | `frontend` | 🟢 Concluída |
| [US-12.8](US-12.8-revisar-e-garantir-responsividade-mobile-pwa-/issue.md) | Revisar responsividade mobile/PWA para a esteira comercial | `frontend` | 🟢 Concluída |
| [US-12.9](US-12.9-validar-tratamento-de-campos-ausentes-no-pdf-/issue.md) | Validar tratamento de campos opcionais/nulos no gerador de PDF | `backend` | 🟢 Concluída |
| [US-12.10](US-12.10-executar-validacao-completa-do-quickstart-md-/issue.md) | Executar validação completa do `quickstart.md` e checklist de fechamento | `qa` | 🟢 Concluída |
