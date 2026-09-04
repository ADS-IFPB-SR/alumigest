# Feature Specification: Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3

**Feature**: `012-treinamento-carga-homologacao-r3`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão (Fechamento da Release 3)
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Esta sprint consolida o ciclo de desenvolvimento das três releases principais do **AlumiGest**, preparando a fábrica e o escritório da **Alumiportas** para a entrada oficial em produção (Go-Live):
1. **Carga Real de Dados e Saneamento**: Inserção dos dados mestres de perfis de alumínio, vidros, acessórios, tabelas de preços e importador de clientes em CSV.
2. **Capacitação e Guias Práticos por Perfil**: Manuais operacionais em PDF e Central de Ajuda contextual para Vendas, Fábrica, Almoxarifado, Financeiro e Campo.
3. **Roteiro de Homologação Ponta a Ponta (E2E Flow)**: Validação integrada de todo o ciclo: Proposta Comercial → Sinal PIX (50%) → Liberação OP com QR Code → Lista de Corte → Baixa no Estoque → Agendamento e Execução de OS Offline com Fotos → Baixa do Saldo Final (50%) → Fechamento de Caixa → DRE.
4. **Fechamento e Certificação da Release 3 (v3.0.0)**: Homologação oficial com critérios de aceitação aprovados pela diretoria.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-41: Executar Carga Inicial de Dados e Importador de Clientes via CSV

> Carga de dados mestres de produção (perfis, vidros, ferragens) via Flyway V16 e ferramenta de importação em lote de clientes via planilha CSV.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-41.1**: Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding`
- **US-41.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING`
- **US-41.3**: Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/`
- **US-41.4**: Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java`
- **US-41.5**: Criar endpoint POST /api/onboarding/import-clients-csv no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java`
- **US-41.6**: Criar testes unitários do `ClientCsvImportServiceTest`
- **US-41.7**: Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx`

### 📌 US-42: Homologação Integrada Ponta a Ponta da Release 3 (v3.0.0)

> Execução do roteiro completo de homologação E2E (Orçamento -> Sinal PIX -> OP & QR Code -> Corte -> Estoque -> OS de Campo -> Saldo -> DRE).

#### Sub-tarefas Técnicas (Sub-issues):
- **US-42.1**: Executar e validar Passo 1: Criação de Orçamento com Desconto e 2 vias de PDF (R1 - Sprint 4)
- **US-42.2**: Executar e validar Passo 2: Conversão em Pedido com Lock de Preços (R2 - Sprint 5)
- **US-42.3**: Executar e validar Passo 3: Cobrança do Sinal 50% via PIX Dinâmico e Liberação (R3 - Sprint 9)
- **US-42.4**: Executar e validar Passo 4: Geração de OPs individuais com Etiquetas QR Code (R2 - Sprint 6)
- **US-42.5**: Executar e validar Passo 5: Romaneio de Oficina e Lista de Corte em PDF (R2 - Sprint 7)
- **US-42.6**: Executar e validar Passo 6: Baixa automática de estoque e registro de sucata (R2 - Sprint 8)
- **US-42.7**: Executar e validar Passo 7: Agendamento da Instalação e Emissão de OS em PDF (R3 - Sprint 12)
- **US-42.8**: Executar e validar Passo 8: Execução de Campo Offline no PWA com fotos e sincronização (R3 - Sprint 14)
- **US-42.9**: Executar e validar Passo 9: Baixa do Saldo Final 50% em Dinheiro e Fechamento de Caixa (R3 - Sprints 10 e 11)
- **US-42.10**: Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13)

### 📌 US-43: Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda

> Manuais operacionais em PDF por perfil de usuário (Vendas, Fábrica, Almoxarifado, Financeiro, Campo) e Central de Ajuda contextual.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-43.1**: Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/OperationalManualPdfService.java`
- **US-43.2**: Criar endpoint GET /api/onboarding/manuals/{role}/pdf no `OnboardingController`
- **US-43.3**: Criar teste unitário do `OperationalManualPdfServiceTest`
- **US-43.4**: Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/`
- **US-43.5**: Documentar endpoints no OpenAPI/Swagger
- **US-43.6**: Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend
- **US-43.7**: Ratificar termo de homologação da Release 3 (v3.0.0)

## 3. Requisitos Funcionais

1. **RF01 - Migration de Carga Real**: Script SQL `V16__seed_initial_production_data.sql` com matérias-primas e preços da Alumiportas.
2. **RF02 - Importador de Clientes em CSV**: Upload de arquivo CSV com validação de CPF/CNPJ e criação em lote.
3. **RF03 - Checklist E2E de Homologação**: Documento executável no `quickstart.md` cobrindo 100% dos fluxos.
4. **RF04 - Central de Ajuda & Onboarding**: Modal com tour rápido e links para download dos Manuais Operacionais em PDF por papel.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Carga Inicial)**: Migrations Flyway / Seeders Automatizados + Importador de Clientes via CSV.
- **Q2 (Roteiro E2E)**: Fluxo End-to-End Unificado cobrindo da proposta ao DRE.
- **Q3 (Guias de Treinamento)**: Guias Rápidos por Papel Operacional (Vendas, Produção, Estoque, Financeiro, Campo) em PDF + Central de Ajuda.