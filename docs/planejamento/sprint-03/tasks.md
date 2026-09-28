# 📋 Lista de Tarefas (Tasks) — Sprint 03 — Clientes, Motor de Orçamentos e Templates

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

---

## 📦 US-04: Gerenciar Clientes PF e PJ

> **Descrição**: Implementar a gestão de clientes com validação de CPF/CNPJ, busca paginada e proteção contra duplicidade.

| ID | Issue / PR | Tarefa | Responsável | Status |
|---|---|---|---|:---:|
| **US-04.1** | [US-04.1](issues/US-04.1-crud-clientes-backend/issue.md) (#61 / PR #79) | Backend: API CRUD de Clientes PF e PJ com validações CPF/CNPJ | Maylson Rodrigues | ✅ Concluído |

### Detalhamento das Tarefas (Checklist):

- [x] **US-04.1**: Backend: API CRUD de Clientes PF e PJ com validações CPF/CNPJ (#61 / PR #79)

---

## 📦 US-05: Refatorar Produtos com Templates Paramétricos de Esquadrias

> **Descrição**: Adicionar suporte a templates paramétricos de esquadrias com configuração JSONB e remoção de custos fixos do catálogo.

| ID | Issue / PR | Tarefa | Responsável | Status |
|---|---|---|---|:---:|
| **US-05.1** | [US-05.1](issues/US-05.1-produtos-templates-parametricos/issue.md) (#62 / PR #104) | Backend: Suporte a Templates Paramétricos na Entidade `Product` | Italo Jefferson | ✅ Concluído |
| **US-05.2** | [US-05.2](issues/US-05.2-remover-labor-cost-catalogo/issue.md) (#119 / PR #119-#120) | Backend: Refactor de Remoção do `laborCost` do Catálogo de Produtos | Italo Jefferson | ✅ Concluído |

### Detalhamento das Tarefas (Checklist):

- [x] **US-05.1**: Backend: Suporte a Templates Paramétricos na Entidade `Product` (#62 / PR #104)
- [x] **US-05.2**: Backend: Refactor de Remoção do `laborCost` do Catálogo de Produtos (#119 / PR #119-#120)

---

## 📦 US-06: Criar e Gerenciar Orçamentos de Venda

> **Descrição**: Criação, cálculo, transição de estados, listagem paginada e wizard de criação de orçamentos.

| ID | Issue / PR | Tarefa | Responsável | Status |
|---|---|---|---|:---:|
| **US-06.1** | [US-06.1](issues/US-06.1-orcamento-entidades-jpa-migration-v9/issue.md) (#80 / PR #108) | Backend: Entidades JPA e Migration Flyway V9 de Orçamentos | Maylson / Nichollas | ✅ Concluído |
| **US-06.2** | [US-06.2](issues/US-06.2-orcamento-dtos-mappers-validacoes/issue.md) (#81 / PR #112) | Backend: Records Java DTOs, Mappers MapStruct e Validações | Maylson Rodrigues | ✅ Concluído |
| **US-06.3** | [US-06.3](issues/US-06.3-budget-service-maquina-estados/issue.md) (#82 / PR #113) | Backend: `BudgetService`, Gerador de Código e Máquina de Estados | Maylson Rodrigues | ✅ Concluído |
| **US-06.4** | [US-06.4](issues/US-06.4-budget-controller-endpoints-rest/issue.md) (#83 / PR #116) | Backend: `BudgetController`, Endpoints REST (`/recalcular`, `DELETE`) | Guilherme Kauã | ✅ Concluído |
| **US-06.5** | [US-06.5](issues/US-06.5-orcamentos-listagem-paginacao-frontend/issue.md) (#66 / PR #111) | Frontend: Listagem de Orçamentos com Tabela, Paginação e Filtros | Júlio Kennedy | ✅ Concluído |
| **US-06.6** | [US-06.6](issues/US-06.6-orcamento-wizard-criacao-frontend/issue.md) (#67 / PR #110) | Frontend: Wizard de Criação de Orçamento em 3 Etapas | Guilherme Kauã | ✅ Concluído |

### Detalhamento das Tarefas (Checklist):

- [x] **US-06.1**: Backend: Entidades JPA e Migration Flyway V9 de Orçamentos (#80 / PR #108)
- [x] **US-06.2**: Backend: Records Java DTOs, Mappers MapStruct e Validações (#81 / PR #112)
- [x] **US-06.3**: Backend: `BudgetService`, Gerador de Código e Máquina de Estados (#82 / PR #113)
- [x] **US-06.4**: Backend: `BudgetController`, Endpoints REST (`/recalcular`, `DELETE`) (#83 / PR #116)
- [x] **US-06.5**: Frontend: Listagem de Orçamentos com Tabela, Paginação e Filtros (#66 / PR #111)
- [x] **US-06.6**: Frontend: Wizard de Criação de Orçamento em 3 Etapas (#67 / PR #110)

---

## 📦 US-07: Motor de Cálculo Físico e Precificação de Orçamentos

> **Descrição**: Motor de cálculo com Strategy/Factory para quantificação precisa de vidros, perfis e componentes.

| ID | Issue / PR | Tarefa | Responsável | Status |
|---|---|---|---|:---:|
| **US-07.1** | [US-07.1](issues/US-07.1-motor-calculo-strategy-factory/issue.md) (#90-#92 / PR #117) | Backend: Motor de Cálculo com Factory Strategy ($m^2$, $4W+6H$, Ferragens) | Nichollas Cavalcante | ✅ Concluído |

### Detalhamento das Tarefas (Checklist):

- [x] **US-07.1**: Backend: Motor de Cálculo com Factory Strategy ($m^2$, $4W+6H$, Ferragens) (#90-#92 / PR #117)

---

## 📦 US-08: Pipeline CI/CD com SonarQube e Testes E2E Cypress

> **Descrição**: Automação de qualidade com análise estática de código e testes ponta a ponta com Cypress.

| ID | Issue / PR | Tarefa | Responsável | Status |
|---|---|---|---|:---:|
| **US-08.1** | [US-08.1](issues/US-08.1-pipeline-ci-sonarqube/issue.md) (PR #78) | DevOps: Pipeline CI/CD com SonarQube segregado e JaCoCo | Italo Jefferson | ✅ Concluído |
| **US-08.2** | [US-08.2](issues/US-08.2-suite-testes-e2e-cypress/issue.md) (#114 / PR #118) | QA: Suíte de Testes E2E com Cypress (23 specs) | Herbert Carvalho | ✅ Concluído |

### Detalhamento das Tarefas (Checklist):

- [x] **US-08.1**: DevOps: Pipeline CI/CD com SonarQube segregado e JaCoCo (PR #78)
- [x] **US-08.2**: QA: Suíte de Testes E2E com Cypress (23 specs) (#114 / PR #118)
