# 📋 Especificação Funcional — Sprint 03

> **Sprint:** 03 — Clientes, Motor de Orçamentos e Templates de Esquadrias  
> **Período:** 18/08/2026 a 31/08/2026  
> **Release:** Release 1 (v1.0.0) — Fundação & Cadastros  
> **Status:** 🟢 Concluída / Em Fechamento (Baseline `B-ALG-v0.3.0-S03-01`)  
> **Responsáveis:** Italo Santos (Scrum Master), José Guylherme (PO), Equipe AlumiGest  

---

## 1. 🎯 Objetivo da Sprint 3

Implementar a **Gestão de Clientes (PF/PJ)**, o **Motor de Cálculo Físico e Precificação de Orçamentos** (Pattern Strategy/Factory para vidros $m^2$, perfis lineares $4W+6H$, ferragens e películas), a **Máquina de Estados de Orçamentos** (`DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `APPROVED` $\rightarrow$ `CANCELLED`), a **Listagem Paginada de Orçamentos com Filtros no Frontend (PR #111)**, o **Wizard de Criação de Orçamento (PR #110)**, a **Integração do SonarQube no CI/CD (PR #78)** e a **Suíte Cypress E2E (PR #118)**.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-04: Gerenciar Clientes PF e PJ
- **Como** gestor da vidraçaria,
- **Quero** cadastrar, listar, editar, buscar e excluir clientes (PF com CPF e PJ com CNPJ),
- **Para que** eu possa vinculá-los aos orçamentos e ter controle dos dados cadastrais.

#### Sub-tarefas Técnicas:
- **US-04.1**: Backend: API CRUD de Clientes PF e PJ com validações CPF/CNPJ (#61 / PR #79)

---

### 📌 US-05: Refatorar Produtos com Templates Paramétricos de Esquadrias
- **Como** gestor da vidraçaria,
- **Quero** que os produtos suportem templates paramétricos de esquadrias com categorias de materiais e custo de mão de obra flexível,
- **Para que** o sistema calcule automaticamente os insumos necessários com base nas dimensões informadas.

#### Sub-tarefas Técnicas:
- **US-05.1**: Backend: Suporte a Templates Paramétricos na Entidade `Product` (#62 / PR #104)
- **US-05.2**: Backend: Refactor de Remoção do `laborCost` do Catálogo de Produtos (#119 / PR #119-#120)

---

### 📌 US-06: Criar e Gerenciar Orçamentos de Venda
- **Como** gestor da vidraçaria,
- **Quero** criar orçamentos selecionando cliente e esquadrias, visualizar a listagem paginada com filtros de status e acompanhar o ciclo de vida comercial,
- **Para que** eu tenha controle completo das propostas comerciais.

#### Sub-tarefas Técnicas:
- **US-06.1**: Backend: Entidades JPA e Migration Flyway V9 de Orçamentos (#80 / PR #108)
- **US-06.2**: Backend: Records Java DTOs, Mappers MapStruct e Validações (#81 / PR #112)
- **US-06.3**: Backend: `BudgetService`, Gerador de Código e Máquina de Estados (#82 / PR #113)
- **US-06.4**: Backend: `BudgetController`, Endpoints REST (`/recalcular`, `DELETE`) (#83 / PR #116)
- **US-06.5**: Frontend: Listagem de Orçamentos com Tabela, Paginação e Filtros (#66 / PR #111)
- **US-06.6**: Frontend: Wizard de Criação de Orçamento em 3 Etapas (#67 / PR #110)

---

### 📌 US-07: Motor de Cálculo Físico e Precificação de Orçamentos
- **Como** sistema de orçamentos,
- **Quero** calcular automaticamente as quantidades e custos de insumos usando fórmulas parametrizadas (vidro $m^2$, perfil $4W+6H$, ferragens UN/PAR/METRO, películas $m^2$),
- **Para que** o orçamento reflita com precisão o custo real dos materiais para cada esquadria.

#### Sub-tarefas Técnicas:
- **US-07.1**: Backend: Motor de Cálculo com Factory Strategy ($m^2$, $4W+6H$, Ferragens) (#90-#92 / PR #117)

---

### 📌 US-08: Pipeline CI/CD com SonarQube e Testes E2E Cypress
- **Como** equipe de desenvolvimento,
- **Quero** pipeline de CI/CD automatizado com SonarQube e suíte de testes E2E Cypress,
- **Para que** a qualidade do código e a estabilidade da aplicação sejam garantidas a cada release.

#### Sub-tarefas Técnicas:
- **US-08.1**: DevOps: Pipeline CI/CD com SonarQube segregado e JaCoCo (PR #78)
- **US-08.2**: QA: Suíte de Testes E2E com Cypress (23 specs) (#114 / PR #118)

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
