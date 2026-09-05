# 📋 Changelog — AlumiGest

Todas as alterações notáveis, adições e correções deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adere ao [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

---

## [Unreleased] — Sprint 04 (Em Planejamento / Execução)

### 🚀 Planejado / Em Desenvolvimento
- **Aplicação de Descontos e Condições Comerciais (US-09 / Issue #133):** Descontos em % e R$, taxas de frete e instalação, validade da proposta e recálculo reativo.
- **Emissão de Orçamento em PDF — Via Comercial e WhatsApp (US-10 / Issue #134):** Geração de proposta formal em PDF via OpenPDF e formatação de texto para envio via WhatsApp.
- **Emissão de Orçamento em PDF — Via Técnica de Oficina (US-11 / Issue #135):** Romaneio e layout técnico de produção com cotas milimétricas, sentidos de abertura e supressão de valores financeiros.
- **Homologação Integrada da Release 1 v1.0.0 (US-12 / Issue #136):** Testes integrados ponta a ponta (Insumos ➔ Produto ➔ Orçamento ➔ PDF Comercial/Técnico).

### 📊 Governança & Planejamento
- **Matriz Mestre de Estimativas do Backlog Geral (US-01 a US-45):** Elaboração do documento canônico [`docs/planejamento/estimativa-backlog-geral.md`](docs/planejamento/estimativa-backlog-geral.md) com pontuação pela escala Fibonacci (1 a 13 pts), justificativas arquiteturais e espaço para consenso de Planning Poker da equipe (total sugerido: 279 pts / média de ~17.4 pts/sprint).
- **Consolidação do Escopo:** Formalização do descarte de 7 histórias de negócio (antigas US-17, US-19, US-23, US-25, US-34, US-36 e US-37), mantendo o fluxo ágil focado em 45 User Stories ativas cadastradas no GitHub remoto.

---

## [0.3.0] - 2026-09-01 — Baseline Sprint 03 (B-ALG-v0.3.0-S03-01)

### ✨ Adicionado (Added)
- **Motor de Cálculo Físico e Precificação de Orçamentos (Backend - PR #116, #117):**
  - Implementação do padrão de projeto *Strategy* para cálculo dinâmico de materiais (`GlassCalculator`, `AluminumCalculator`, `FilmCalculator`, `HardwareCalculator` instanciados via `MaterialCalculatorFactory`).
  - Fórmulas matemáticas paramétricas considerando área de vidro em $m^2$ (com margem de segurança e arredondamento), perfis lineares com perímetro e montantes ($4W+6H$), componentes de ferragens e películas.
  - Endpoints REST para `/api/v1/budgets` e `/api/v1/budgets/recalcular` com paginação, filtros e cálculo prévio de propostas.
- **Entidades e Máquina de Estados de Orçamentos (Backend - PR #108, #112, #113):**
  - Criação do modelo relacional de propostas: `tb_budgets`, `tb_budget_items`, `tb_budget_item_options` e `tb_budget_item_components` com chaves estrangeiras e integridade referencial.
  - Ciclo de vida da proposta com enum `BudgetStatus`: `DRAFT` (Rascunho), `SENT` (Enviado), `APPROVED` (Aprovado), `REJECTED` (Rejeitado) e `CANCELLED` (Cancelado).
  - Camada de serviço de orçamentos com DTOs tipados, mappers e validações de consistência.
- **Gestão de Clientes PF e PJ (Backend - PR #79):**
  - Criação da tabela `tb_customers` (Migration Flyway `V7`).
  - Validação estrita de documentos CPF e CNPJ via Jakarta Bean Validation.
  - Endpoints REST `/api/v1/customers` com paginação, ordenação e busca instantânea por nome ou documento.
- **Templates Paramétricos de Esquadrias (Backend - PR #104):**
  - Suporte a templates paramétricos com tipos `JSONB` no PostgreSQL mapeados via Hibernate `@JdbcTypeCode(SqlTypes.JSON)` (Migration Flyway `V8`).
  - Definição estrutural de modelos para Portas, Janelas, Maxim-ar e Basculantes.
- **Wizard de Orçamentos e Seletor de Clientes (Frontend - PR #110):**
  - Desenvolvimento do fluxo wizard em etapas (`BudgetWizardPage`, `WindowBuilderModal`) com layout em 2 colunas.
  - Pré-visualização gráfica paramétrica SVG de esquadrias com cotas dinâmicas e suporte a modo de exibição em tela cheia.
  - Componentes `CustomerSelector` e `CustomerQuickCreateModal` integrados diretamente à API de clientes.
- **Listagem de Orçamentos (Frontend - PR #111):**
  - Tela de listagem e acompanhamento comercial (`BudgetsListPage`) com paginação, filtros por status e busca textual.
- **Pipeline CI/CD com SonarQube Self-Hosted (PR #78):**
  - Workflows automatizados no GitHub Actions (`ci.yml`, `sonar-backend.yml`, `sonar-frontend.yml`) com quality gate rigoroso.
  - Geração e publicação de relatórios independentes de cobertura de testes: JaCoCo para o backend e lcov para o frontend.
  - Configuração explícita do plugin `sonar-maven-plugin` no `pom.xml`.
- **Testes Automatizados E2E e Integração (PR #103, #115, #118):**
  - Criação de 23 suítes de testes automatizados Cypress E2E cobrindo o catálogo de materiais (vidros, perfis, ferragens, películas) e o fluxo integrado de orçamentos.
  - 141 testes automatizados JUnit 5 no backend atingindo 93,4% de cobertura no SonarQube.
- **Consolidação de Governança e Engenharia de Software (PR #74, #121):**
  - Sincronização e atualização de 28 documentos técnicos institucionais em `/docs`: `REQ` v2.0, `RN` v3.0, `UCS` v2.0, `API` v3.0, `MER/DER` v3.0, `ARQ` v2.0 e `PAD` v2.0.
  - Atas completas de Planning, Dailies, Review e Retrospectiva da Sprint 3 em `/docs/projeto-001/001-atas-reuniao/`.
  - Homologação de 20 cenários de aceitação documentados no `TEA-03`.

### 🔄 Modificado / Refatorado (Changed)
- **Desacoplamento de Custo de Mão de Obra (PR #119, #120):**
  - Remoção da coluna e atributo `labor_cost` da tabela `tb_products` (Migration Flyway `V10`), convertendo o catálogo de produtos em modelos paramétricos base e transferindo a composição de mão de obra para a proposta comercial (`BudgetItem`).
- **Padronização de Nomenclatura:**
  - Unificação de identificadores e status de orçamentos para inglês nos contratos de API e modelos TypeScript (PR #111).

---

## [0.2.2] - 2026-08-20 — Hotfix Criptografia HTTP (Tag v0.2.2-sprint2)

### 🐛 Corrigido (Fixed)
- **Fallback de Identificadores de UI (Frontend - PR #59, #60):** Implementação de fallback para `Math.random()` na geração de IDs de interface quando `crypto.randomUUID()` é bloqueado pelo navegador em ambientes de rede local ou conexões HTTP sem certificado SSL.

---

## [0.2.1] - 2026-08-19 — Dockerização Completa e Suporte Coolify (Tag v0.2.1-sprint2)

### ✨ Adicionado (Added)
- **Dockerização Multi-Stage do Backend (PR #55):** Dockerfile otimizado com Java 21 / Spring Boot, Maven e Eclipse Temurin.
- **Dockerização Multi-Stage do Frontend (PR #55):** Dockerfile com Node.js/Vite e Nginx configurado com proxy reverso e suporte a rotas SPA (`try_files $uri $uri/ /index.html`).
- **Orquestração com Docker Compose (PR #55):** Arquivo `docker-compose.yml` integrando os serviços de Backend, Frontend, PostgreSQL 16 e pgAdmin, acompanhado de `.env.example`.

### 🐛 Corrigido (Fixed)
- **Compatibilização de Portas para Coolify (PR #55, #58):** Ajuste nos binds e exposição de portas para evitar conflitos com a porta do host em ambientes de deploy automatizado.
- **Tratamento de Payload da API no Frontend (PR #56):** Correção no unwrap dos dados recebidos da API nos módulos de produtos e categorias para compatibilidade estrita com o envelope `ApiResponse<T>`.
- **Build TypeScript no CI (PR #55):** Remoção de imports React não utilizados que causavam falhas de compilação estrita no pipeline.

---

## [0.2.0] - 2026-08-18 — Baseline Sprint 02: Catálogo de Materiais e Fichas Técnicas (B-ALG-v0.2.0-S02-01 / Tag v0.2.0-sprint2)

### ✨ Adicionado (Added)
- **Catálogo Genérico de Insumos (Backend - Issues #11, #12, #13, #14, #15):** Implementação do padrão *Type-Object Pattern* permitindo CRUD completo de Vidros, Perfis de Alumínio, Películas e Ferragens com campos dinâmicos e controle de exclusão lógica (soft delete).
- **Cadastro de Ficha Técnica de Produtos (BOM) (Backend - Issues #30, #31):** Migração do campo `category` para a nova entidade `ProductCategory` (Migration Flyway `V4`) e implementação do motor de Fichas Técnicas (`ProductItem`) permitindo agrupamento de itens e amarração entre produto final e insumos.
- **Validação e Tratamento Global de Erros (Backend):** Implementação de `GlobalExceptionHandler`, validação estrita de código NCM (`@Pattern` exigindo exatos 8 dígitos numéricos) e bloqueio de fichas técnicas vazias e preços negativos.
- **Documentação Swagger / OpenAPI:** Configuração do `springdoc-openapi` com anotações `@Tag` e `@Operation`.
- **Padronização de Respostas (Backend):** Criação das classes genéricas utilitárias `ApiResponse<T>` e `PageResponse<T>`.
- **Interface de Gestão do Catálogo (Frontend - Issue #16, PR #40):** Telas em abas modulares (`MaterialsCatalog.tsx`) com interface unificada e responsiva em Tailwind CSS para gestão de insumos utilizando modais reutilizáveis.
- **Interface de Ficha Técnica de Produtos (Frontend - Issue #32, PR #51):** Interface completa do construtor de produtos (`ProductBuilderPage.tsx`, `ProductTechSheet.tsx`, `ProductCostSummary.tsx`).
- **Validação com Zod e React Hook Form (Frontend - PR #77):** Refatoração dos modais do catálogo com validação em tempo real e correção de máscara na tabela de ferragens.
- **Pipeline CI e Suíte de Testes (Issue #17, PR #53):** Escrita e refatoração de testes para *Controllers* e *Services* de materiais e produtos com extração de interfaces (`IGlassService`, `IProductService`) e execução com sucesso no pipeline de CI.
- **Documentação Técnica e Governança:** Elaboração da Ata de Planning da Sprint 02 (`ATA-Sprint_02_Planning.md`), DER do Catálogo (`DER-Catalogo_Materiais.md`) e casos de teste de aceitação `TEA-Sprint02`.

---

## [0.1.0] - 2026-08-04 — Baseline Inicial (B-ALG-v0.1.0-S01-01)

### ✨ Adicionado (Added)
- **Estrutura Monorepo:** Configuração da árvore de diretórios padronizada com pastas para `/docs/sistema`, `/docs/projeto-001`, `/backend` e `/frontend`.
- **Plano de Gerência de Configuração (PGC):** Versão inicial `PGC-Plano_de_Gerencia_de_Configuracao_AlumiGest.docx` com papéis (PO, Gerente de Projeto, QA, DEV), políticas de branch (Git Flow), convenções de nomenclatura e plano de ferramentas (Git, GitHub, IntelliJ, VS Code, Read.ai e Changelog).
- **Plano de Projeto (PPJ):** Versão inicial `PPJ-Plano_de_Projeto_AlumiGest.pptx` contendo EAP, cronograma de releases, estimativas, matriz de riscos e alinhamento com a Resolução CNE/CES nº 7/2018 (Extensão Universitária).
- **Governança no GitHub:** 
  - Templates de Pull Request (`.github/PULL_REQUEST_TEMPLATE.md`) com checklist de Definition of Done (DoD).
  - Templates de Issues para Relato de Bug (`bug_report.md`) e Nova Funcionalidade (`feature_request.md`).
  - Quadro Kanban no GitHub Projects (`AlumiGest - Gestão Ágil`) com campos personalizados de Sprint, Módulo e Tipo.
  - Regras de proteção de branches (*Rulesets*) configuradas para as branches `main` e `develop`.
- **Filtros e Configurações:** Arquivo `.gitignore` unificado para Java 21, Spring Boot, Node.js, TypeScript e IDEs.
- **Documentação de Apresentação:** `README.md` institucional e documentações técnicas em `/backend` e `/frontend`.
