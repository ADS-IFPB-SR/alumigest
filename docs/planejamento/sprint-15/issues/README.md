# 📌 Issues de Implementação — Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-47: Executar Carga Inicial de Dados e Importador de Clientes via CSV

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-47.1](US-47.1-criar-package-br-edu-ifpb-alumigest-onboardin/issue.md) | Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding` | `sprint-15` | 🔲 Aberta |
| [US-47.2](US-47.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING` | `sprint-15` | 🔲 Aberta |
| [US-47.3](US-47.3-criar-record-clientimportsummaryresponse-tota/issue.md) | Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/` | `sprint-15` | 🔲 Aberta |
| [US-47.4](US-47.4-implementar-servico-clientcsvimportservice-im/issue.md) | Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java` | `sprint-15` | 🔲 Aberta |
| [US-47.5](US-47.5-criar-endpoint-post-api-onboarding-import-cli/issue.md) | Criar endpoint POST /api/onboarding/import-clients-csv no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java` | `sprint-15` | 🔲 Aberta |
| [US-47.6](US-47.6-criar-testes-unitarios-do-clientcsvimportserv/issue.md) | Criar testes unitários do `ClientCsvImportServiceTest` | `sprint-15` | 🔲 Aberta |
| [US-47.7](US-47.7-criar-modal-csvclientimportmodal-no-frontend-/issue.md) | Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx` | `sprint-15` | 🔲 Aberta |

## 📦 US-48: Homologação Integrada Ponta a Ponta da Release 3 (v3.0.0)

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-48.1](US-48.1-executar-e-validar-passo-1-criacao-de-orcamen/issue.md) | Executar e validar Passo 1: Criação de Orçamento com Desconto e 2 vias de PDF (R1 - Sprint 4) | `sprint-15` | 🔲 Aberta |
| [US-48.2](US-48.2-executar-e-validar-passo-2-conversao-em-pedid/issue.md) | Executar e validar Passo 2: Conversão em Pedido com Lock de Preços (R2 - Sprint 5) | `sprint-15` | 🔲 Aberta |
| [US-48.3](US-48.3-executar-e-validar-passo-3-cobranca-do-sinal-/issue.md) | Executar e validar Passo 3: Cobrança do Sinal 50% via PIX Dinâmico e Liberação (R3 - Sprint 9) | `sprint-15` | 🔲 Aberta |
| [US-48.4](US-48.4-executar-e-validar-passo-4-geracao-de-ops-ind/issue.md) | Executar e validar Passo 4: Geração de OPs individuais com Etiquetas QR Code (R2 - Sprint 6) | `sprint-15` | 🔲 Aberta |
| [US-48.5](US-48.5-executar-e-validar-passo-5-romaneio-de-oficin/issue.md) | Executar e validar Passo 5: Romaneio de Oficina e Lista de Corte em PDF (R2 - Sprint 7) | `sprint-15` | 🔲 Aberta |
| [US-48.6](US-48.6-executar-e-validar-passo-6-baixa-automatica-d/issue.md) | Executar e validar Passo 6: Baixa automática de estoque e registro de sucata (R2 - Sprint 8) | `sprint-15` | 🔲 Aberta |
| [US-48.7](US-48.7-executar-e-validar-passo-7-agendamento-da-ins/issue.md) | Executar e validar Passo 7: Agendamento da Instalação e Emissão de OS em PDF (R3 - Sprint 12) | `sprint-15` | 🔲 Aberta |
| [US-48.8](US-48.8-executar-e-validar-passo-8-execucao-de-campo-/issue.md) | Executar e validar Passo 8: Execução de Campo Offline no PWA com fotos e sincronização (R3 - Sprint 14) | `sprint-15` | 🔲 Aberta |
| [US-48.9](US-48.9-executar-e-validar-passo-9-baixa-do-saldo-fin/issue.md) | Executar e validar Passo 9: Baixa do Saldo Final 50% em Dinheiro e Fechamento de Caixa (R3 - Sprints 10 e 11) | `sprint-15` | 🔲 Aberta |
| [US-48.10](US-48.10-executar-e-validar-passo-10-auditoria-dos-kpi/issue.md) | Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13) | `sprint-15` | 🔲 Aberta |

## 📦 US-49: Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-49.1](US-49.1-criar-servico-operationalmanualpdfservice-ger/issue.md) | Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/OperationalManualPdfService.java` | `sprint-15` | 🔲 Aberta |
| [US-49.2](US-49.2-criar-endpoint-get-api-onboarding-manuals-rol/issue.md) | Criar endpoint GET /api/onboarding/manuals/{role}/pdf no `OnboardingController` | `sprint-15` | 🔲 Aberta |
| [US-49.3](US-49.3-criar-teste-unitario-do-operationalmanualpdfs/issue.md) | Criar teste unitário do `OperationalManualPdfServiceTest` | `sprint-15` | 🔲 Aberta |
| [US-49.4](US-49.4-criar-componente-helpcentermodal-e-pagina-hel/issue.md) | Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/` | `sprint-15` | 🔲 Aberta |
| [US-49.5](US-49.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `sprint-15` | 🔲 Aberta |
| [US-49.6](US-49.6-adicionar-botao-central-de-ajuda-manuais-no-c/issue.md) | Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend | `sprint-15` | 🔲 Aberta |
| [US-49.7](US-49.7-ratificar-termo-de-homologacao-da-release-3-v/issue.md) | Ratificar termo de homologação da Release 3 (v3.0.0) | `sprint-15` | 🔲 Aberta |

