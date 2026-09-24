# PIT — Plano de Iteração — Sprint 03

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 03 — Clientes (Backend), Motor de Orçamentos e Interfaces Comerciais |
| **Período** | 18/08/2026 a 01/09/2026 (15 dias) |
| **Gerente da Sprint (LP)** | Italo Jefferson Lima dos Santos - Scrum Master & Backend |
| **Versão** | 2.2 (Atualizado com inclusão da US-04 e alinhamento com GitHub Board) |

---

## 1. Objetivo da Sprint

Implementar a **API de Clientes no Backend** (PF/PJ) para suporte ao módulo comercial, o **Motor de Cálculo de Orçamentos** com suporte a Templates Paramétricos de Esquadrias (portas de correr, pivotantes, boxes e janelas), seleção dinâmica de insumos por categoria, fórmulas matemáticas de corte e área (vidro m², perfil linear, ferragens por unidade/par/metro e películas), a **API REST de Orçamentos** com máquina de estados (DRAFT → SENT → APPROVED → CANCELLED) e as **Interfaces Frontend de Criação/Listagem de Orçamentos e Templates de Produtos**.

---

## 2. Backlog da Sprint (Planejado vs. Executado)

### 2.1 Módulo de Clientes — Backend (EP-04)

> 📌 **Alinhamento de Escopo:** Conforme deliberado no planejamento de 21/08, a Sprint 3 contemplou **exclusivamente a camada de API e persistência Backend de Clientes**, provendo suporte para o fluxo de orçamentos. A interface visual de clientes ficou para etapa posterior.

| ID / Issue | User Story / Demanda | Responsável | Pontos | Prioridade | Status Real |
|---|---|---|---|---|---|
| US-01 / #61 | Criar entidade Client, migration Flyway, Repository e DTOs | José Guylherme | 3 | 🔴 Must | 🟢 Concluído ([PR #79](https://github.com/ADS-IFPB-SR/alumigest/pull/79)) |
| US-01 / #61 | Implementar Service e Controller REST de Clientes (`/api/v1/customers`) | José Guylherme | 5 | 🔴 Must | 🟢 Concluído ([PR #79](https://github.com/ADS-IFPB-SR/alumigest/pull/79)) |

---

### 2.2 Motor de Cálculo e Orçamentos — Backend (EP-05)

| ID / Issue | User Story / Demanda | Responsável | Pontos | Prioridade | Status Real |
|---|---|---|---|---|---|
| US-05.1 / #80 | Entidades JPA de Orçamento (`Budget`, `BudgetItem`, `BudgetItemOption`) e Migration V9 | Maylson / Nichollas | 5 | 🔴 Must | 🟢 Concluído ([PR #108](https://github.com/ADS-IFPB-SR/alumigest/pull/108)) |
| US-05.2 / #81 | DTOs de Request/Response, Mappers MapStruct e Validações JSR-380 | Maylson Rodrigues | 3 | 🔴 Must | 🟢 Concluído ([PR #112](https://github.com/ADS-IFPB-SR/alumigest/pull/112)) |
| US-05.3 / #82 | `BudgetService`, Gerador de Código Sequencial e Máquina de Estados | Maylson Rodrigues | 5 | 🔴 Must | 🟢 Concluído ([PR #113](https://github.com/ADS-IFPB-SR/alumigest/pull/113)) |
| US-05.4 / #83 | `BudgetController`, Endpoints REST e Testes Automatizados (136 testes) | Guilherme Kauã | 5 | 🔴 Must | 🟢 Concluído ([PR #116](https://github.com/ADS-IFPB-SR/alumigest/pull/116)) |
| US-06.1 / #90 | Motor de Quantidades: Cálculo de Insumos por Template (`BudgetQuantityService`) | Nichollas Cavalcante | 5 | 🔴 Must | 🟢 Concluído ([PR #117](https://github.com/ADS-IFPB-SR/alumigest/pull/117)) |
| US-06.2 / #91 | Motor de Precificação: Totais, Markup e Margem (`BudgetPricingService`) | Nichollas Cavalcante | 5 | 🔴 Must | 🟢 Concluído ([PR #117](https://github.com/ADS-IFPB-SR/alumigest/pull/117)) |
| US-06.3 / #92 | Integração do Motor no Fluxo de Orçamentos e Testes E2E (141 testes) | Nichollas Cavalcante | 3 | 🔴 Must | 🟢 Concluído ([PR #117](https://github.com/ADS-IFPB-SR/alumigest/pull/117)) |

---

### 2.3 Refatoração de Produtos — Backend (Templates de Esquadria)

| ID / Issue | User Story / Demanda | Responsável | Pontos | Prioridade | Status Real |
|---|---|---|---|---|---|
| US-03 / #62 | Suporte a Templates Paramétricos e Categorias Obrigatórias na Entidade `Product` | Italo Jefferson | 5 | 🔴 Must | 🟢 Concluído ([PR #104](https://github.com/ADS-IFPB-SR/alumigest/pull/104)) |
| Refactor / #119 | Remoção do `laborCost` do Catálogo (migração da mão de obra para o Orçamento) | Italo Jefferson | 2 | 🟡 Should | 🟢 Concluído ([PR #119](https://github.com/ADS-IFPB-SR/alumigest/pull/119) / [#120](https://github.com/ADS-IFPB-SR/alumigest/pull/120)) |

---

### 2.4 Módulo de Orçamentos — Frontend (PWA)

| ID / Issue | User Story / Demanda | Responsável | Pontos | Prioridade | Status Real |
|---|---|---|---|---|---|
| US-08 / #67 | Wizard de Criação de Orçamento (3 etapas: Cliente, Insumos, Subtotal em tempo real) | Guilherme Kauã | 8 | 🔴 Must | 🟢 Concluído ([PR #110](https://github.com/ADS-IFPB-SR/alumigest/pull/110)) |
| US-07 / #66 | Tela de Listagem de Orçamentos com Tabela, Paginação e Filtros de Status | Júlio Kennedy | 5 | 🔴 Must | 🟢 Concluído ([PR #111](https://github.com/ADS-IFPB-SR/alumigest/pull/111)) |

---

### 2.5 Refatoração de Produtos e Templates SVG — Frontend (US-04)

> ⚠️ **Status no Board (GitHub):** As 3 sub-issues da **US-04** foram planejadas e atribuídas ao desenvolvedor Gabriel Nascimento, permanecendo na coluna **In Progress (Doing)** do GitHub Projects sem PR aberto. Ficaram como débito técnico para a próxima sprint.

| ID / Issue | User Story / Demanda | Responsável | Pontos | Prioridade | Status Real |
|---|---|---|---|---|---|
| US-04.1 / #87 | Componente SVG Paramétrico de Templates de Esquadrias (Frontend) | Gabriel Nascimento | 5 | 🔴 Must | 🟡 In Progress (Doing) / Não Entregue |
| US-04.2 / #88 | Formulário de Produto com Seleção de Template e Categorias (Frontend) | Gabriel Nascimento | 5 | 🔴 Must | 🟡 In Progress (Doing) / Não Entregue |
| US-04.3 / #89 | Refatorar Listagem de Produtos com Miniaturas SVG e Categorias (Frontend) | Gabriel Nascimento | 3 | 🟡 Should | 🟡 In Progress (Doing) / Não Entregue |

---

### 2.6 Qualidade, Testes e Infraestrutura (QA & DevOps)

| ID / Issue | Demanda | Responsável | Status Real |
|---|---|---|---|
| #114 / PR #115 / #118 | Testes E2E com Cypress para Gestão do Catálogo de Materiais | Herbert Carvalho | 🟢 Concluído |
| QA-01 / #71 / #99 / #101 | Suíte de Testes Unitários e de Integração de Produtos | Herbert Carvalho | 🟢 Concluído |
| #75 / PR #77 | Hotfix de Validação, Modais e Padronização em Caixa Alta (v0.2.3) | Nichollas Cavalcante | 🟢 Concluído |
| PR #78 | Pipeline CI/CD com SonarQube segregado para Frontend e Backend | Italo Jefferson | 🟢 Concluído |

---

## 3. 📦 Demandas Postergadas Formalmente para a Sprint 4

Conforme deliberação registrada em ata (21/08/2026), as seguintes demandas foram movidas para a Sprint 4 devido à complexidade da entrega do motor e estabilização de regras:
* **US-09 (#68):** Relatório Comercial Detalhado do Orçamento
* **US-10 (#69):** Romaneio de Peças para a Oficina (Sem Valores)
* **US-11 (#70):** Geração e Exportação de Proposta em PDF
* **QA-03 (#73):** Teste de Integração End-to-End do fluxo completo com PDF

---

## 4. Capacidade e Métricas da Sprint 3

| Métrica | Valor |
|---|---|
| **Tamanho da equipe** | 8 membros |
| **Story Points totais planejados** | **57 pts** |
| **Story Points entregues (Merged na develop)** | **44 pts (77,2%)** |
| **Story Points em Code Review** | **0 pts (0%)** |
| **Story Points não entregues / em andamento (US-04)** | **13 pts (22,8%)** |
| **Total de Testes Automatizados no Backend** | **141 testes (100% passando)** |

---

## 5. Definition of Done (DoD) — Status Final

- [x] Backend: API CRUD de Clientes implementada e testada (11 classes)
- [x] Backend: Motor de Cálculo de Orçamentos funcional e integrado (Vidros, Perfis, Ferragens e Películas)
- [x] Backend: Endpoints REST de Orçamentos com gestão de status e paginação
- [x] Backend: Refatoração de Templates de Produtos e remoção do `laborCost` do catálogo
- [x] Migrations do Flyway V8, V9 e V10 aplicadas com sucesso
- [x] Testes E2E Cypress implementados para o Catálogo de Materiais
- [x] Pipeline CI/CD com SonarQube operacional
- [ ] Frontend: Merge do Wizard de Orçamento ([PR #110](https://github.com/ADS-IFPB-SR/alumigest/pull/110))
- [ ] Frontend: Merge da Listagem de Orçamentos ([PR #111](https://github.com/ADS-IFPB-SR/alumigest/pull/111))
- [ ] Frontend: Implementação da Refatoração de Produtos e Templates SVG (US-04 — Débito Técnico)

---

*Plano de Iteração atualizado e homologado com base na auditoria do repositório — Sprint 03 — 31/08/2026*
