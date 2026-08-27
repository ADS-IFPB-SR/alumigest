# Tasks: Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3

**Feature**: `012-treinamento-carga-homologacao-r3`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-onboarding.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Migration Flyway V16 de Carga de Dados Real de Produção

- [ ] T001 Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding`
- [ ] T002 Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING`

---

## Phase 2: User Story 1 - Importador de Clientes via CSV (Priority: P1) 🎯 MVP

**Goal**: Importar clientes em lote via planilha CSV com validação de duplicidade.

**Independent Test**: Fazer upload de planilha CSV com 10 clientes e constatar inserção no banco de dados.

- [ ] T003 [P] [US1] Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/`
- [ ] T004 [US1] Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java`
- [ ] T005 [US1] Criar endpoint POST /api/onboarding/import-clients-csv no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java`
- [ ] T006 [P] [US1] Criar testes unitários do `ClientCsvImportServiceTest`
- [ ] T007 [US1] Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx`

---

## Phase 3: User Story 2 - Roteiro de Homologação Ponta a Ponta (Priority: P1) 🎯 MVP

**Goal**: Executar e certificar os 10 passos do fluxo E2E integrado da Release 3 (v3.0.0).

**Independent Test**: Executar os 10 passos sequenciais descritos no `quickstart.md` e validar persistência e coerência de dados.

- [ ] T008 [US2] Executar e validar Passo 1: Criação de Orçamento com Desconto e 2 vias de PDF (R1 - Sprint 4)
- [ ] T009 [US2] Executar e validar Passo 2: Conversão em Pedido com Lock de Preços (R2 - Sprint 5)
- [ ] T010 [US2] Executar e validar Passo 3: Cobrança do Sinal 50% via PIX Dinâmico e Liberação (R3 - Sprint 9)
- [ ] T011 [US2] Executar e validar Passo 4: Geração de OPs individuais com Etiquetas QR Code (R2 - Sprint 6)
- [ ] T012 [US2] Executar e validar Passo 5: Romaneio de Oficina e Lista de Corte em PDF (R2 - Sprint 7)
- [ ] T013 [US2] Executar e validar Passo 6: Baixa automática de estoque e registro de sucata (R2 - Sprint 8)
- [ ] T014 [US2] Executar e validar Passo 7: Agendamento da Instalação e Emissão de OS em PDF (R3 - Sprint 12)
- [ ] T015 [US2] Executar e validar Passo 8: Execução de Campo Offline no PWA com fotos e sincronização (R3 - Sprint 14)
- [ ] T016 [US2] Executar e validar Passo 9: Baixa do Saldo Final 50% em Dinheiro e Fechamento de Caixa (R3 - Sprints 10 e 11)
- [ ] T017 [US2] Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13)

---

## Phase 4: User Story 3 - Guias de Treinamento por Perfil e Central de Ajuda (Priority: P2)

**Goal**: Gerar manuais operacionais ilustrados em PDF por perfil e criar Central de Ajuda no frontend.

**Independent Test**: Baixar manual do Vendedor em PDF e validar formatação e passo a passo.

- [ ] T018 [US3] Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/OperationalManualPdfService.java`
- [ ] T019 [US3] Criar endpoint GET /api/onboarding/manuals/{role}/pdf no `OnboardingController`
- [ ] T020 [P] [US3] Criar teste unitário do `OperationalManualPdfServiceTest`
- [ ] T021 [US3] Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/`

---

## Phase 5: Polish & Release 3 Certification

**Purpose**: Documentação OpenAPI e encerramento oficial da Release 3 (v3.0.0)

- [ ] T022 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T023 [P] Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend
- [ ] T024 Ratificar termo de homologação da Release 3 (v3.0.0)