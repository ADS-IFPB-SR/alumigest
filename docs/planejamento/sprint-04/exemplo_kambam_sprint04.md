# 📋 Exemplo de Organização da Sprint 4 no GitHub Projects (Kanban)

Este documento ilustra detalhadamente como a **Sprint 04** do **AlumiGest** será visualizada, filtrada e gerenciada no **GitHub Projects / Kanban Board**, seguindo a hierarquia de **Issues Pai (User Stories)** e **Sub-Issues Decimais (Tasks Técnicas)**.

---

## 🎯 1. Princípios da Organização no GitHub Projects

1. **Visão Executiva (User Stories / Pais)**: O PO, Scrum Master e Stakeholders acompanham o progresso das **4 User Stories** da Sprint 4 em blocos funcionais com barra de progresso (`0/40`, `0/10`, `0/4`, `0/10`).
2. **Visão Operacional (Tasks / Filhas)**: Os desenvolvedores e testers movimentam os cards individuais das **64 sub-tarefas decimais** (`US-09.1` a `US-12.10`) entre as colunas do fluxo diário.
3. **Rastreabilidade Bidirecional**: Clicando na User Story Pai, vê-se o checklist completo de sub-issues; clicando em qualquer sub-issue, vê-se o link direto para a User Story Pai.

---

## 🖼️ 2. Visão do Quadro Kanban da Sprint 04

### 🏷️ Estrutura das Colunas
* 📋 **Sprint Backlog / Ready**: Itens planejados prontos para início.
* 🚀 **In Progress**: Tarefas em desenvolvimento ativo.
* 🔍 **In Review / PR Open**: Pull Requests abertos aguardando Code Review e CI/CD.
* 🧪 **QA / Testing**: Validação em ambiente de testes / Cenários BDD.
* ✅ **Done**: Entregas homologadas e mergeadas na branch de integração.

---

### 📊 Simulação Visual do Board Kanban (Início da Sprint 04)

```
┌───────────────────────────────┬───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ 📋 SPRINT BACKLOG (64)        │ 🚀 IN PROGRESS (0)            │ 🔍 IN REVIEW / PR (0)         │ ✅ DONE (0)                   │
├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🟣 [USER STORY PAI]           │                               │                               │                               │
│ #130 US-09: Descontos e       │                               │                               │                               │
│ Condições Comerciais          │                               │                               │                               │
│ 🏷️ user-story, sprint-04, P1   │                               │                               │                               │
│ 🔘 0 of 40 sub-issues (0%)    │                               │                               │                               │
│ ───────────────────────────── │                               │                               │                               │
│ 🔹 #131 [US-09.1] Dep OpenPDF │                               │                               │                               │
│ 🏷️ task, backend, sprint-04    │                               │                               │                               │
│ ───────────────────────────── │                               │                               │                               │
│ 🔹 #132 [US-09.2] Logo static │                               │                               │                               │
│ 🏷️ task, backend, sprint-04    │                               │                               │                               │
│ ───────────────────────────── │                               │                               │                               │
│ 🔹 #133 [US-09.3] Flyway V8   │                               │                               │                               │
│ 🏷️ task, backend, database    │                               │                               │                               │
│ ───────────────────────────── │                               │                               │                               │
│ ... (US-09.4 a US-09.40)      │                               │                               │                               │
├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🟣 [USER STORY PAI]           │                               │                               │                               │
│ #170 US-10: Emitir PDF        │                               │                               │                               │
│ Comercial e WhatsApp          │                               │                               │                               │
│ 🏷️ user-story, sprint-04, P1   │                               │                               │                               │
│ 🔘 0 of 10 sub-issues (0%)    │                               │                               │                               │
│ ───────────────────────────── │                               │                               │                               │
│ 🔹 #171 [US-10.1] PdfService  │                               │                               │                               │
│ 🏷️ task, backend, pdf         │                               │                               │                               │
│ ... (US-10.2 a US-10.10)      │                               │                               │                               │
├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🟣 [USER STORY PAI]           │                               │                               │                               │
│ #181 US-11: Emitir PDF        │                               │                               │                               │
│ Técnico / Oficina             │                               │                               │                               │
│ 🏷️ user-story, sprint-04, P2   │                               │                               │                               │
│ 🔘 0 of 4 sub-issues (0%)     │                               │                               │                               │
│ ───────────────────────────── │                               │                               │                               │
│ 🔹 #182 [US-11.1] PdfTecnico  │                               │                               │                               │
│ ... (US-11.2 a US-11.4)       │                               │                               │                               │
├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ 🟣 [USER STORY PAI]           │                               │                               │                               │
│ #186 US-12: Homologação R1    │                               │                               │                               │
│ 🏷️ user-story, sprint-04, P2   │                               │                               │                               │
│ 🔘 0 of 10 sub-issues (0%)    │                               │                               │                               │
│ ───────────────────────────── │                               │                               │                               │
│ 🔹 #187 [US-12.1] mvn verify  │                               │                               │                               │
│ ... (US-12.2 a US-12.10)      │                               │                               │                               │
└───────────────────────────────┴───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 🗂️ 3. Visualização por Swimlanes (Agrupamento por US Pai)

No GitHub Projects, habilitando **"Group by: Parent Issue"**, o board se organiza automaticamente em raias horizontais (Swimlanes):

```
▼ 📦 US-09: Aplicar Descontos e Condições Comerciais no Orçamento (40 tasks)
  ├── [Ready]        US-09.7: Criar entidade JPA Budget
  ├── [In Progress]  US-09.3: Criar migration Flyway V8
  ├── [In Review]    US-09.1: Adicionar dependência OpenPDF (PR #125)
  └── [Done]         US-09.2: Adicionar logotipo da Alumiportas

▼ 📦 US-10: Emitir e Exportar Orçamento em PDF - Via Comercial (10 tasks)
  ├── [Ready]        US-10.3: Gerar resumo para WhatsApp
  └── [In Progress]  US-10.1: Criar BudgetPdfService comercial

▼ 📦 US-11: Emitir Orçamento em PDF - Via Técnica de Oficina (4 tasks)
  └── [Ready]        US-11.1: Implementar layout técnico sem valores monetários

▼ 📦 US-12: Homologação Integrada e Validação da Release 1 (10 tasks)
  └── [Ready]        US-12.1 a US-12.10: Testes E2E, SonarQube e Responsividade
```

---

## 🔍 4. Visualizações Recomendadas no GitHub Projects

Para atender tanto a gestão quanto a equipe técnica, configuram-se **3 abas de visualização**:

### 👁️ Aba 1: `Stories Board` (Visão PO / Gestão)
* **Filtro**: `label:user-story sprint:sprint-04`
* **Exibição**: Apenas os 4 cards principais de User Story com a barra de progresso das sub-tasks.
* **Objetivo**: Acompanhar o fechamento das entregas de valor para o cliente.

### 👁️ Aba 2: `Kanban Geral` (Visão Dev / Daily)
* **Filtro**: `label:task sprint:sprint-04`
* **Agrupamento**: `Group by: Parent Issue` ou `Group by: Status`
* **Exibição**: Todos os cards de sub-tarefas com seus responsáveis, badges de camada (`backend`, `frontend`, `qa`) e links para os PRs.

### 👁️ Aba 3: `Sprint Poker / Planning` (Visão Poker)
* **Filtro**: `sprint:sprint-04`
* **Exibição**: Modo Tabela (Table View) com colunas:
  * `Title` (Título da Tarefa)
  * `Estimate / Story Points` (Pontuação Poker: 1, 2, 3, 5, 8)
  * `Assignees` (Responsáveis)
  * `Module` (`Backend`, `Frontend`, `QA`, `DevOps`)
  * `Priority` (`P1 - Must Have`, `P2 - Should Have`)

---

## 📝 5. Anatomia de um Card Pai no GitHub

Ao abrir a **Issue Pai (`US-09`)** no GitHub, o corpo da issue exibe:

```markdown
# US-09: Aplicar Descontos e Condições Comerciais no Orçamento

## 🎯 Objetivo de Negócio
Como vendedor da Alumiportas, desejo aplicar descontos (percentual % ou valor fixo R$), adicionar taxas extras (instalação/frete), selecionar condições de pagamento padronizadas e definir o prazo de validade da proposta, para que o orçamento reflita fielmente o acordo comercial com o cliente.

## 👥 Sub-tarefas de Implementação (40 tasks)

### Fundação & Banco de Dados
- [x] #131 - [US-09.1] Adicionar dependência com.github.librepdf:openpdf:2.0.3 no pom.xml
- [x] #132 - [US-09.2] Adicionar logotipo da Alumiportas em static/logo-alumiportas.png
- [ ] #133 - [US-09.3] Criar migration Flyway V8__create_budgets_schema.sql
- [ ] #134 - [US-09.4] Criar enum BudgetStatus (RASCUNHO, ENVIADO, APROVADO, ...)
- [ ] #135 - [US-09.5] Criar enum DiscountType (PERCENTUAL, VALOR_FIXO)
- [ ] #136 - [US-09.6] Criar enum PaymentCondition
- [ ] #137 - [US-09.7] Criar entidade JPA Budget
- [ ] #138 - [US-09.8] Criar entidade JPA BudgetItem
...
### Backend — Service & Controllers
- [ ] #150 - [US-09.20] Criar BudgetService com lógica de criação e validade
- [ ] #151 - [US-09.21] Implementar método adicionarItem()
- [ ] #152 - [US-09.22] Implementar método aplicarDesconto()
...
### Frontend PWA
- [ ] #162 - [US-09.32] Criar componente BudgetStatusBadge
- [ ] #166 - [US-09.36] Criar componente DiscountPanel
- [ ] #168 - [US-09.38] Criar página BudgetCreatePage
```

---

## 🚀 6. Benefícios Práticos para a Sprint 4

1. **Zero Confusão de Camadas**: A `US-09` contém **tudo** necessário para a feature de descontos funcionar (Flyway, API, DTOs, Zod, React, Telas e Testes).
2. **Filtro Preciso**: Basta digitar `parent:"US-09"` na busca do board para ver exclusivamente as 40 tarefas de desconto, ou `parent:"US-10"` para ver as 10 tarefas do PDF comercial.
3. **Facilidade no Sprint Poker**: A equipe pode pontuar as sub-tarefas individualmente ou estimar o tamanho da US Pai com base no número de sub-issues filhas.
