# 🧪 TEA — Testes de Aceitação — Sprint 03

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 03 — Clientes, Motor de Orçamentos e Templates de Esquadrias |
| **Módulo** | Cadastro de Clientes, Motor de Precificação/Orçamentos e E2E |
| **Versão** | 2.0 (Consolidado com Resultados de Execução, SonarQube e Cypress) |
| **Data** | 31/08/2026 |
| **QA Responsável** | Herbert Carvalho dos Santos / Equipe AlumiGest |

---

## 1. 🎯 Objetivo da Sprint 3

Validar os critérios de aceitação do **Cadastro de Clientes** (PF/PJ), do **Motor de Cálculo de Orçamentos** (vidro $m^2$, perfil linear $4W+6H$, ferragens por UN/PAR/METRO, películas e mão de obra desacoplada) e da **Gestão de Status de Orçamentos** (`DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `APPROVED` $\rightarrow$ `CANCELLED`).

---

## 2. 📋 Cenários de Teste e Evidências de Execução

### TEA-S03-01: Cadastro de Clientes (PR #79)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Cliente PF | Dados válidos informados | POST `/api/v1/clients` | Cliente salvo com ID UUID e status ativo | `ClientServiceTest` ✅ Aprovado |
| 2 | Cadastro de Cliente PJ | Razão social e CNPJ informados | POST `/api/v1/clients` | Cliente PJ registrado com sucesso | `ClientServiceTest` ✅ Aprovado |
| 3 | Validação de CPF/CNPJ duplicado | Documento já cadastrado no banco | POST `/api/v1/clients` | Sistema rejeita com conflito (HTTP 409) | `ClientControllerTest` ✅ Aprovado |
| 4 | Busca paginada com filtro | Clientes persistidos | GET `/api/v1/clients?busca=silva` | Retorna lista paginada `PageResponse` | `ClientRepositoryTest` ✅ Aprovado |

---

### TEA-S03-02: Entidades e Migrations de Orçamento (PR #108 / Flyway V9)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Migrations de Orçamento (V9) | Flyway ativo no startup | Executa aplicação Spring Boot | Cria tabelas `tb_budgets`, `tb_budget_items` e `tb_budget_item_options` | Flyway Migration V9 ✅ Aprovado |
| 2 | Integridade referencial | Banco de dados instanciado | Valida constraints | FKs para `tb_customers`, `tb_products` e `tb_materials` operacionais | Testes de Integração JPA ✅ Aprovado |

---

### TEA-S03-03: Motor de Cálculo de Orçamento (PR #117 / Strategy Pattern)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Cálculo de vidro por $m^2$ (`RN-V02`) | Vidro 4mm, L=1200mm, A=2100mm, R$ 110/m² | Motor calcula área e custo | Área = 2,52 m², Subtotal = R$ 277,20 | `GlassQuantityCalculatorTest` ✅ Aprovado |
| 2 | Área mínima de faturamento (`RN-V03`) | Peça pequena L=300mm, A=400mm (0,12 m²) | Motor calcula área | Área faturada ajustada para **0,25 m²** | `GlassQuantityCalculatorTest` ✅ Aprovado |
| 3 | Perfil de correr 2F (`SLIDING_2_LEAF`) | Template 2F, L=1600mm, A=2100mm | Motor aplica $(4W+6H)/1000$ | Consumo linear = 19,00m | `ProfileQuantityCalculatorTest` ✅ Aprovado |
| 4 | Ferragem por par (`PAR`) | 1 Par de roldanas R$ 28,00/par | Motor computa quantidade | Custo = R$ 28,00 | `HardwareQuantityCalculatorTest` ✅ Aprovado |
| 5 | Escova de vedação por metro (`METRO`) | Escova R$ 3,50/m, $2 \times \text{Altura}$ | Motor calcula metragem | Consumo = 4,20m, Custo = R$ 14,70 | `HardwareQuantityCalculatorTest` ✅ Aprovado |
| 6 | Flexibilidade de preço (`RN-V04`) | Vidro com preço base R$ 110/m² | Preço ajustado para R$ 95/m² no item | Orçamento recalculado sem alterar catálogo | `BudgetPricingServiceTest` ✅ Aprovado |

---

### TEA-S03-04: Endpoints REST de Orçamentos (PR #116)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Criação de orçamento | Payload JSON válido com itens | POST `/api/v1/budgets` | Orçamento criado com status `DRAFT` e código `ORC-YYYYMMDD-NNNN` (HTTP 201) | `BudgetControllerTest` ✅ Aprovado |
| 2 | Consulta de detalhes | ID de orçamento existente | GET `/api/v1/budgets/{id}` | Retorna DTO completo com itens e opções (HTTP 200) | `BudgetControllerTest` ✅ Aprovado |
| 3 | Recálculo forçado | Orçamento em status `DRAFT` | POST `/api/v1/budgets/{id}/recalcular` | Recalcula quantidades e valores | `BudgetControllerTest` ✅ Aprovado |
| 4 | Cancelamento | Orçamento existente | DELETE `/api/v1/budgets/{id}` | Status alterado para `CANCELLED` (HTTP 204) | `BudgetControllerTest` ✅ Aprovado |

---

### TEA-S03-05: Gestão de Status e Congelamento (PR #113)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Transição `DRAFT` $\rightarrow$ `SENT` | Orçamento em elaboração | PATCH `/api/v1/budgets/{id}/status` (`SENT`) | Status atualizado para `SENT` | `BudgetServiceTest` ✅ Aprovado |
| 2 | Transição `SENT` $\rightarrow$ `APPROVED` | Proposta aceita pelo cliente | PATCH `/api/v1/budgets/{id}/status` (`APPROVED`) | Status atualizado e valores congelados | `BudgetServiceTest` ✅ Aprovado |
| 3 | Imutabilidade após aprovação | Orçamento `APPROVED` | Tenta editar orçamento ou itens | Sistema rejeita com erro semântico HTTP 422 | `BudgetServiceTest` ✅ Aprovado |

---

### TEA-S03-06: Frontend — Wizard e Listagem de Orçamentos

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Wizard de criação de orçamento | Usuário no fluxo de Novo Orçamento | Seleciona cliente, configura template e insumos | Interface exibe subtotal reativo em tempo real | PR #110 ✅ Aprovado e Mergeado |
| 2 | Listagem paginada de orçamentos | Tela de Orçamentos | Filtra por status `DRAFT` ou busca textual | Lista atualiza dinamicamente com paginação | PR #111 ✅ Aprovado e Mergeado |
| 3 | Testes E2E do Catálogo PWA | 23 specs Cypress automatizadas | Executa `cypress run` | Todos os fluxos de abas, modais e filtros aprovados | PRs #115 e #118 ✅ Aprovado |

---

## 3. 📊 Métricas Consolidadas de QA e SonarQube

| Métrica de Qualidade | Alvo do Projeto | Resultado Obtido na Sprint 3 | Status |
| :--- | :--- | :--- | :--- |
| **Testes Automatizados Backend** | > 100 testes | **141 testes (22 classes)** | 🟢 100% Passando |
| **Cobertura SonarQube (`BudgetService`)** | ≥ 80% | **93,4% de cobertura** | 🟢 Aprovado |
| **Vulnerabilidades SAST (SonarQube)** | 0 | **0 vulnerabilidades** | 🟢 Aprovado |
| **Bugs Bloqueantes (SonarQube)** | 0 | **0 bugs** | 🟢 Aprovado |
| **Specs Cypress E2E (Frontend)** | > 20 specs | **23 specs (100% sucesso)** | 🟢 Aprovado |
| **Cenários TEA Homologados** | 20 cenários | **20 Aprovados (100%)** | 🟢 100% Concluído |

---

*Relatório TEA homologado com as evidências do SonarQube e CI/CD — Versão 2.0 — 31/08/2026*
