# 📋 Especificação Funcional — Sprint 03

> **Sprint:** 03 — Clientes, Motor de Orçamentos e Templates de Esquadrias  
> **Período:** 18/08/2026 a 31/08/2026  
> **Release:** Release 1 (v1.0.0) — Fundação & Cadastros  
> **Status:** 🟢 Concluída / Em Fechamento (Baseline `B-ALG-v0.3.0-S03-01`)  
> **Responsáveis:** Italo Santos (Scrum Master), José Guylherme (PO), Equipe AlumiGest  

---

## 1. 🎯 Objetivo da Sprint 3

Implementar a **Gestão de Clientes (PF/PJ)**, o **Motor de Cálculo Físico e Precificação de Orçamentos** (Pattern Strategy/Factory para vidros $m^2$, perfis lineares $4W+6H$, ferragens e películas), a **Máquina de Estados de Orçamentos** (`DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `APPROVED` $\rightarrow$ `CANCELLED`), a **Listagem Paginada de Orçamentos com Filtros no Frontend (PR #111)**, a **Integração do SonarQube no CI/CD (PR #78)** e a **Suíte Cypress E2E (PR #118)**.

---

## 2. 👥 Histórias de Usuário & Entregas

### EP-04: Cadastro de Clientes — Backend
* **US-01 / #24-#27 (PR #79):** CRUD de Clientes PF e PJ com validação de CPF/CNPJ, busca paginada e proteção contra duplicidade.

### EP-05: Motor de Cálculo e Orçamentos — Backend
* **US-05.1 / #80 (PR #108):** Entidades JPA `Budget`, `BudgetItem`, `BudgetItemOption` e Migration Flyway V9.
* **US-05.2 / #81 (PR #112):** Records Java DTOs, Mappers MapStruct e Bean Validation JSR-380.
* **US-05.3 / #82 (PR #113):** `BudgetService`, Gerador de Código Sequencial (`ORC-YYYYMMDD-NNNN`) e Transições de Status.
* **US-05.4 / #83 (PR #116):** `BudgetController`, Endpoints REST (`POST /api/v1/budgets`, `POST /recalcular`, `DELETE`).
* **US-06 / #65, #90-#92 (PR #117):** Motor de Cálculo com Factory Strategy (`QuantityCalculatorStrategy`):
  * **Vidro ($m^2$):** Área real com piso mínimo de $0,25 m^2$.
  * **Perfil Linear:** Fórmula $4W+6H$ para esquadrias de 2 folhas.
  * **Ferragens:** Quantidades por UN, PAR ou METRO.
  * **Películas:** Aplicação por $m^2$ da área envidraçada.

### EP-06: Refatoração de Templates de Produtos — Backend
* **US-03 / #62 (PR #104):** Suporte a `template_type`, `template_config` (JSONB) e `category_requirements` na Entidade `Product`.
* **Refactor / #119-#120:** Remoção de `labor_cost` do catálogo de produtos (Flyway V10), tornando o custo de mão de obra flexível por item de orçamento.

### EP-07: Interfaces PWA de Orçamentos — Frontend
* **US-07 / #66 (PR #111):** Tela de Listagem de Orçamentos com Tabela, Paginação, Filtros de Status e Busca com Debounce. ✅ *(Mergeado)*
* **US-08 / #67 (PR #110):** Wizard de Criação de Orçamento em 3 Etapas com Subtotal Reativo. ✅ *(Mergeado)*

### EP-08: Qualidade e Infraestrutura
* **PR #78:** Pipeline CI/CD com SonarQube Community segregado para Backend (JaCoCo) e Frontend.
* **PR #115 / #118:** Suíte de Testes E2E Cypress com 23 specs para o Catálogo PWA.
* **141 Testes Automatizados** Backend (JUnit 5 + Mockito) com 93,4% de cobertura no `BudgetService`.

---

## 3. 🧪 Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Cálculo de Orçamento de Porta de Correr 2 Folhas (SLIDING_DOOR_2F)
  Dado um item de orçamento com L=1600mm e A=2100mm
  E vidro temperado 8mm incolor (R$ 140,00/m²)
  E perfil de alumínio linha Suprema (R$ 45,00/m)
  Quando o motor de cálculo executa a Strategy Factory
  Então a área do vidro é calculada como 3,36 m² (Custo: R$ 470,40)
  E o consumo linear de perfis é calculado como 19,00m (Custo: R$ 855,00)
  E o subtotal do item reflete a soma exata dos insumos e mão de obra

Cenário: Imutabilidade de Orçamento Aprovado
  Dado um orçamento com status APPROVED
  Quando uma requisição tenta alterar medidas ou insumos
  Então o sistema deve rejeitar a operação com HTTP 422 (Unprocessable Entity)
```

---

*Especificação homologada na Baseline da Sprint 3.*
