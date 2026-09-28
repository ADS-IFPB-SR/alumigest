# Especificação Funcional: US-40 — Executar Carga Inicial de Dados e Importador de Clientes via CSV

**Identificador**: `US-40`  
**Issue GitHub**: [#165](https://github.com/ADS-IFPB-SR/alumigest/issues/165)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Importador em lote de clientes e catálogo de fornecedores via arquivos CSV formatados.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-40.1-criar-package-br-edu-ifpb-alumigest-onboardin/issue.md) | Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding` | 🔲 No Backlog |
| [US](issues/US-40.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING` | 🔲 No Backlog |
| [US](issues/US-40.3-criar-record-clientimportsummaryresponse-tota/issue.md) | Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/` | 🔲 No Backlog |
| [US](issues/US-40.4-implementar-servico-clientcsvimportservice-im/issue.md) | Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java` | 🔲 No Backlog |
| [US](issues/US-40.5-criar-endpoint-post-api-onboarding-import-cli/issue.md) | Criar endpoint POST /api/onboarding/import-clients-csv no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java` | 🔲 No Backlog |
| [US](issues/US-40.6-criar-testes-unitarios-do-clientcsvimportserv/issue.md) | Criar testes unitários do `ClientCsvImportServiceTest` | 🔲 No Backlog |
| [US](issues/US-40.7-criar-modal-csvclientimportmodal-no-frontend-/issue.md) | Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
