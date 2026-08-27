# 📋 Issues da Sprint 15 — Treinamento, Carga Real e Homologação R3

Este diretório contém todas as **24 issues** detalhadas da Sprint 15 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding`](T001-criar-package-br-edu-ifpb-alumigest-onboardin/issue.md)
- [T002: Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING`](T002-criar-migration-flyway-backend-src-main-resou/issue.md)

### Phase 2: User Story 1 - Importador de Clientes via CSV (Priority: P1) 🎯 MVP

- [T003: Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/`](T003-criar-record-clientimportsummaryresponse-tota/issue.md) `[P]` `[US1]`
- [T004: Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java`](T004-implementar-servico-clientcsvimportservice-im/issue.md) `[US1]`
- [T005: Criar endpoint POST /api/onboarding/import-clients-csv no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java`](T005-criar-endpoint-post-api-onboarding-import-cli/issue.md) `[US1]`
- [T006: Criar testes unitários do `ClientCsvImportServiceTest`](T006-criar-testes-unitarios-do-clientcsvimportserv/issue.md) `[P]` `[US1]`
- [T007: Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx`](T007-criar-modal-csvclientimportmodal-no-frontend-/issue.md) `[US1]`

### Phase 3: User Story 2 - Roteiro de Homologação Ponta a Ponta (Priority: P1) 🎯 MVP

- [T008: Executar e validar Passo 1: Criação de Orçamento com Desconto e 2 vias de PDF (R1 - Sprint 4)](T008-executar-e-validar-passo-1-criacao-de-orcamen/issue.md) `[US2]`
- [T009: Executar e validar Passo 2: Conversão em Pedido com Lock de Preços (R2 - Sprint 5)](T009-executar-e-validar-passo-2-conversao-em-pedid/issue.md) `[US2]`
- [T010: Executar e validar Passo 3: Cobrança do Sinal 50% via PIX Dinâmico e Liberação (R3 - Sprint 9)](T010-executar-e-validar-passo-3-cobranca-do-sinal-/issue.md) `[US2]`
- [T011: Executar e validar Passo 4: Geração de OPs individuais com Etiquetas QR Code (R2 - Sprint 6)](T011-executar-e-validar-passo-4-geracao-de-ops-ind/issue.md) `[US2]`
- [T012: Executar e validar Passo 5: Romaneio de Oficina e Lista de Corte em PDF (R2 - Sprint 7)](T012-executar-e-validar-passo-5-romaneio-de-oficin/issue.md) `[US2]`
- [T013: Executar e validar Passo 6: Baixa automática de estoque e registro de sucata (R2 - Sprint 8)](T013-executar-e-validar-passo-6-baixa-automatica-d/issue.md) `[US2]`
- [T014: Executar e validar Passo 7: Agendamento da Instalação e Emissão de OS em PDF (R3 - Sprint 12)](T014-executar-e-validar-passo-7-agendamento-da-ins/issue.md) `[US2]`
- [T015: Executar e validar Passo 8: Execução de Campo Offline no PWA com fotos e sincronização (R3 - Sprint 14)](T015-executar-e-validar-passo-8-execucao-de-campo-/issue.md) `[US2]`
- [T016: Executar e validar Passo 9: Baixa do Saldo Final 50% em Dinheiro e Fechamento de Caixa (R3 - Sprints 10 e 11)](T016-executar-e-validar-passo-9-baixa-do-saldo-fin/issue.md) `[US2]`
- [T017: Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13)](T017-executar-e-validar-passo-10-auditoria-dos-kpi/issue.md) `[US2]`

### Phase 4: User Story 3 - Guias de Treinamento por Perfil e Central de Ajuda (Priority: P2)

- [T018: Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/OperationalManualPdfService.java`](T018-criar-servico-operationalmanualpdfservice-ger/issue.md) `[US3]`
- [T019: Criar endpoint GET /api/onboarding/manuals/{role}/pdf no `OnboardingController`](T019-criar-endpoint-get-api-onboarding-manuals-rol/issue.md) `[US3]`
- [T020: Criar teste unitário do `OperationalManualPdfServiceTest`](T020-criar-teste-unitario-do-operationalmanualpdfs/issue.md) `[P]` `[US3]`
- [T021: Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/`](T021-criar-componente-helpcentermodal-e-pagina-hel/issue.md) `[US3]`

### Phase 5: Polish & Release 3 Certification

- [T022: Documentar endpoints no OpenAPI/Swagger](T022-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T023: Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend](T023-adicionar-botao-central-de-ajuda-manuais-no-c/issue.md) `[P]`
- [T024: Ratificar termo de homologação da Release 3 (v3.0.0)](T024-ratificar-termo-de-homologacao-da-release-3-v/issue.md)
