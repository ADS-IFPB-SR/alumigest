# 📋 Lista de Tarefas (Tasks) — Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-41: Executar Carga Inicial de Dados e Importador de Clientes via CSV

> **Descrição**: Carga de dados mestres de produção (perfis, vidros, ferragens) via Flyway V16 e ferramenta de importação em lote de clientes via planilha CSV.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-41.1** | [US-41.1](issues/US-41.1-criar-package-br-edu-ifpb-alumigest-onboardin/issue.md) Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding` | 🔲 Pendente |
| **US-41.2** | [US-41.2](issues/US-41.2-criar-migration-flyway-backend-src-main-resou/issue.md) Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING` | 🔲 Pendente |
| **US-41.3** | [US-41.3](issues/US-41.3-criar-record-clientimportsummaryresponse-tota/issue.md) Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/` | 🔲 Pendente |
| **US-41.4** | [US-41.4](issues/US-41.4-implementar-servico-clientcsvimportservice-im/issue.md) Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java` | 🔲 Pendente |
| **US-41.5** | [US-41.5](issues/US-41.5-criar-endpoint-post-api-onboarding-import-cli/issue.md) Criar endpoint POST /api/onboarding/import-clients-csv no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java` | 🔲 Pendente |
| **US-41.6** | [US-41.6](issues/US-41.6-criar-testes-unitarios-do-clientcsvimportserv/issue.md) Criar testes unitários do `ClientCsvImportServiceTest` | 🔲 Pendente |
| **US-41.7** | [US-41.7](issues/US-41.7-criar-modal-csvclientimportmodal-no-frontend-/issue.md) Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx` | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-41.1**: Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding`
- [ ] **US-41.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING`
- [ ] **US-41.3**: Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/`
- [ ] **US-41.4**: Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java`
- [ ] **US-41.5**: Criar endpoint POST /api/onboarding/import-clients-csv no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java`
- [ ] **US-41.6**: Criar testes unitários do `ClientCsvImportServiceTest`
- [ ] **US-41.7**: Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx`

---

## 📦 US-42: Homologação Integrada Ponta a Ponta da Release 3 (v3.0.0)

> **Descrição**: Execução do roteiro completo de homologação E2E (Orçamento -> Sinal PIX -> OP & QR Code -> Corte -> Estoque -> OS de Campo -> Saldo -> DRE).

| ID | Tarefa | Status |
|---|---|:---:|
| **US-42.1** | [US-42.1](issues/US-42.1-executar-e-validar-passo-1-criacao-de-orcamen/issue.md) Executar e validar Passo 1: Criação de Orçamento com Desconto e 2 vias de PDF (R1 - Sprint 4) | 🔲 Pendente |
| **US-42.2** | [US-42.2](issues/US-42.2-executar-e-validar-passo-2-conversao-em-pedid/issue.md) Executar e validar Passo 2: Conversão em Pedido com Lock de Preços (R2 - Sprint 5) | 🔲 Pendente |
| **US-42.3** | [US-42.3](issues/US-42.3-executar-e-validar-passo-3-cobranca-do-sinal-/issue.md) Executar e validar Passo 3: Cobrança do Sinal 50% via PIX Dinâmico e Liberação (R3 - Sprint 9) | 🔲 Pendente |
| **US-42.4** | [US-42.4](issues/US-42.4-executar-e-validar-passo-4-geracao-de-ops-ind/issue.md) Executar e validar Passo 4: Geração de OPs individuais com Etiquetas QR Code (R2 - Sprint 6) | 🔲 Pendente |
| **US-42.5** | [US-42.5](issues/US-42.5-executar-e-validar-passo-5-romaneio-de-oficin/issue.md) Executar e validar Passo 5: Romaneio de Oficina e Lista de Corte em PDF (R2 - Sprint 7) | 🔲 Pendente |
| **US-42.6** | [US-42.6](issues/US-42.6-executar-e-validar-passo-6-baixa-automatica-d/issue.md) Executar e validar Passo 6: Baixa automática de estoque e registro de sucata (R2 - Sprint 8) | 🔲 Pendente |
| **US-42.7** | [US-42.7](issues/US-42.7-executar-e-validar-passo-7-agendamento-da-ins/issue.md) Executar e validar Passo 7: Agendamento da Instalação e Emissão de OS em PDF (R3 - Sprint 12) | 🔲 Pendente |
| **US-42.8** | [US-42.8](issues/US-42.8-executar-e-validar-passo-8-execucao-de-campo-/issue.md) Executar e validar Passo 8: Execução de Campo Offline no PWA com fotos e sincronização (R3 - Sprint 14) | 🔲 Pendente |
| **US-42.9** | [US-42.9](issues/US-42.9-executar-e-validar-passo-9-baixa-do-saldo-fin/issue.md) Executar e validar Passo 9: Baixa do Saldo Final 50% em Dinheiro e Fechamento de Caixa (R3 - Sprints 10 e 11) | 🔲 Pendente |
| **US-42.10** | [US-42.10](issues/US-42.10-executar-e-validar-passo-10-auditoria-dos-kpi/issue.md) Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-42.1**: Executar e validar Passo 1: Criação de Orçamento com Desconto e 2 vias de PDF (R1 - Sprint 4)
- [ ] **US-42.2**: Executar e validar Passo 2: Conversão em Pedido com Lock de Preços (R2 - Sprint 5)
- [ ] **US-42.3**: Executar e validar Passo 3: Cobrança do Sinal 50% via PIX Dinâmico e Liberação (R3 - Sprint 9)
- [ ] **US-42.4**: Executar e validar Passo 4: Geração de OPs individuais com Etiquetas QR Code (R2 - Sprint 6)
- [ ] **US-42.5**: Executar e validar Passo 5: Romaneio de Oficina e Lista de Corte em PDF (R2 - Sprint 7)
- [ ] **US-42.6**: Executar e validar Passo 6: Baixa automática de estoque e registro de sucata (R2 - Sprint 8)
- [ ] **US-42.7**: Executar e validar Passo 7: Agendamento da Instalação e Emissão de OS em PDF (R3 - Sprint 12)
- [ ] **US-42.8**: Executar e validar Passo 8: Execução de Campo Offline no PWA com fotos e sincronização (R3 - Sprint 14)
- [ ] **US-42.9**: Executar e validar Passo 9: Baixa do Saldo Final 50% em Dinheiro e Fechamento de Caixa (R3 - Sprints 10 e 11)
- [ ] **US-42.10**: Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13)

---

## 📦 US-43: Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda

> **Descrição**: Manuais operacionais em PDF por perfil de usuário (Vendas, Fábrica, Almoxarifado, Financeiro, Campo) e Central de Ajuda contextual.

| ID | Tarefa | Status |
|---|---|:---:|
| **US-43.1** | [US-43.1](issues/US-43.1-criar-servico-operationalmanualpdfservice-ger/issue.md) Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/OperationalManualPdfService.java` | 🔲 Pendente |
| **US-43.2** | [US-43.2](issues/US-43.2-criar-endpoint-get-api-onboarding-manuals-rol/issue.md) Criar endpoint GET /api/onboarding/manuals/{role}/pdf no `OnboardingController` | 🔲 Pendente |
| **US-43.3** | [US-43.3](issues/US-43.3-criar-teste-unitario-do-operationalmanualpdfs/issue.md) Criar teste unitário do `OperationalManualPdfServiceTest` | 🔲 Pendente |
| **US-43.4** | [US-43.4](issues/US-43.4-criar-componente-helpcentermodal-e-pagina-hel/issue.md) Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/` | 🔲 Pendente |
| **US-43.5** | [US-43.5](issues/US-43.5-documentar-endpoints-no-openapi-swagger/issue.md) Documentar endpoints no OpenAPI/Swagger | 🔲 Pendente |
| **US-43.6** | [US-43.6](issues/US-43.6-adicionar-botao-central-de-ajuda-manuais-no-c/issue.md) Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend | 🔲 Pendente |
| **US-43.7** | [US-43.7](issues/US-43.7-ratificar-termo-de-homologacao-da-release-3-v/issue.md) Ratificar termo de homologação da Release 3 (v3.0.0) | 🔲 Pendente |

### Detalhamento das Tarefas (Checklist):

- [ ] **US-43.1**: Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/OperationalManualPdfService.java`
- [ ] **US-43.2**: Criar endpoint GET /api/onboarding/manuals/{role}/pdf no `OnboardingController`
- [ ] **US-43.3**: Criar teste unitário do `OperationalManualPdfServiceTest`
- [ ] **US-43.4**: Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/`
- [ ] **US-43.5**: Documentar endpoints no OpenAPI/Swagger
- [ ] **US-43.6**: Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend
- [ ] **US-43.7**: Ratificar termo de homologação da Release 3 (v3.0.0)

