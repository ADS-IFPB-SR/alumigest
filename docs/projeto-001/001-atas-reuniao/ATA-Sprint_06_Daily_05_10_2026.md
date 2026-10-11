# 📝 ATA DE DAILY SCRUM (SPRINT 06)

Projeto: AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria

Data: 05 de outubro de 2026 (Segunda-feira)

Modalidade: Assíncrona (via canal de mensagens da equipe).

---

## 1. 👥 Participantes e Status de Presença

### Integrantes com atualizações registradas:

* Italo Jefferson Lima dos Santos — Desenvolvedor
* Joseph Nichollas Abreu Cavalcante — Desenvolvedor
* José Guylherme dos Santos Melo — Product Owner (PO)
* Júlio Kennedy — Desenvolvedor
* Guilherme Kauã Matos da Silva — Desenvolvedor
* Maylson da Silva Rodrigues — Desenvolvedor
* Herbert Carvalho dos Santos — Desenvolvedor

Observação: Todos os relatos foram enviados de forma assíncrona no canal da equipe. Não há registro de reunião síncrona nesta data.

---

## 2. 💬 Relatório de Progresso (Stand-up)

### 🧑‍💻 Italo Jefferson Lima dos Santos

🎯 Foco: Desenvolvimento Full-Stack (US-14.1) e Code Review

1️⃣ O que fez desde a última daily?

* Implementou a US-14.1 — Snapshot Imutável, Lock de Preços e Deep Copy de itens do pedido, referente à issue #360, submetida via PR #406.
* Realizou code review do PR #399 — fix(budgets) referente à issue #374.
* Realizou code review do PR #403 — feat(orders): [US-13.4] listagem paginada de pedidos de venda.

2️⃣ O que vai fazer até a próxima daily?

* Resolver algum bug disponível ou assumir uma nova task da sprint.

3️⃣ Impedimentos?

- Nenhum.

---

### 🧑‍💻 Joseph Nichollas Abreu Cavalcante

🎯 Foco: Code Review e Desenvolvimento Full-Stack (US-16.2)

1️⃣ O que fez desde a última daily?

Code review:

* Realizou code review do PR #407 — fix referente ao Bug [US-11] issue #384.

Desenvolvimento:

* Implementou a US-16.2 (issue #364) — adicionando atalho de navegação na Sidebar, documentando os endpoints com anotações Swagger/OpenAPI, atualizando os contratos de API e implementando blindagem anticolisão na geração sequencial de códigos de pedido.

2️⃣ O que vai fazer até a próxima daily?

* Resolver algum bug disponível.

3️⃣ Impedimentos?

- Nenhum.

---

### 💼 José Guylherme dos Santos Melo

🎯 Foco: Correção de Bugs e Desenvolvimento (US-13.4)

1️⃣ O que fez desde a última daily?

Observação: Os relatos desta data consolidam entregas referentes ao dia 04/10 e 05/10.

* Corrigiu bug de razão social hardcodada no resumo para WhatsApp — fix(budget) via PR #400.
* Corrigiu erros de exibição no download de PDF — fix/pdf download error messages via PR #401.
* Contribuiu para a implementação da listagem paginada de pedidos de venda — feat(orders): [US-13.4] via PR #403.
* Adicionou alias /technical-pdf no controller de orçamentos — fix via PR #404.

2️⃣ O que vai fazer até a próxima daily?

* Realizar code review ou vincular-se a uma nova task disponível.

3️⃣ Impedimentos?

- Nenhum.

---

### 🧑‍💻 Júlio Kennedy

🎯 Foco: Correção de Bugs, Integração de PRs e Planejamento (Sprint 06)

1️⃣ O que fez desde a última daily?

Desenvolvimento:

* Resolveu bug e realizou alinhamento visual da esquadria sem puxador, referente à US-11.1.

Integração de PRs:

* Integrou os PRs #396 e #407 no fluxo de orçamentos e pedidos.

Code review:

* Realizou code review e validação técnica do PR referente à paridade de cálculo da mão de obra (PR #398).

Planejamento:

* Criou e detalhou 5 cards de bugs da Sprint 06 no GitHub — issues #408 a #412.

2️⃣ O que vai fazer até a próxima daily?

* Iniciar o desenvolvimento da US-15.2 — Reabertura de Orçamento após Cancelamento de Pedido.

3️⃣ Impedimentos?

* Conclusão da US-15.1 (dependência de desbloqueio).

---

### 🧑‍💻 Guilherme Kauã Matos da Silva

🎯 Foco: Documentação, Code Review e Correção de Bugs

1️⃣ O que fez desde a última daily?

Documentação:

* Adicionou atas de Review, Planning e Retrospective.

Code review:

* Realizou code review do PR #395.

Desenvolvimento:

* Concluiu a implementação completa do Bug-025 referente à issue #374.
* Iniciou o desenvolvimento do Bug-023 referente à issue #372.

2️⃣ O que vai fazer até a próxima daily?

* Realizar novo code review do PR #395 em razão das novas alterações.
* Concluir a implementação do Bug-023.
* Iniciar o desenvolvimento da US-16.1.

3️⃣ Impedimentos?

- Nenhum.

---

### 🧑‍💻 Maylson da Silva Rodrigues

🎯 Foco: Desenvolvimento (US-13.4)

1️⃣ O que fez desde a última daily?

* Finalizou a implementação da US-13.4 em colaboração com Italo Jefferson.

2️⃣ O que vai fazer até a próxima daily?

* Assumir outra task disponível.
* Realizar code review das issues [US-14.1] #360 e PR #405.

3️⃣ Impedimentos?

- Nenhum.

---

### 🧑‍💻 Herbert Carvalho dos Santos

🎯 Foco: Correção de Múltiplos Bugs (US-10, US-11)

1️⃣ O que fez desde a última daily?

* Submeteu PR com a correção dos seguintes bugs:
  * [Bug] [US-11.2] — Ausência do alias de rota /technical-pdf mapeado no BudgetController.
  * [Bug] [US-11.4 / US-11.5] — Resposta de erro empacotada como Blob sem tratamento de mensagem em downloadPdfTecnico.
  * [Bug] [US-10.8 / US-10.10] — Resposta de erro empacotada como Blob sem tratamento de mensagem no download de PDF comercial.
  * [Bug] [US-10.5 / US-10.4] — Razão social da empresa hardcodada no resumo para WhatsApp.

2️⃣ O que vai fazer até a próxima daily?

* Ajustar conflito de versões que bloqueia um dos PRs submetidos e assumir outra tarefa disponível.

3️⃣ Impedimentos?

- Nenhum (apenas conflito de versão a resolver).

---

## 3. 📊 Resumo Geral do Progresso da Sprint

Nesta daily, a equipe apresentou avanços expressivos em múltiplas frentes da Sprint 06:

* US-13.4 (Listagem de Pedidos): Implementação concluída colaborativamente por Maylson e Italo, com PR submetido e em revisão.
* US-14.1 (Snapshot Imutável): Implementação entregue por Italo via PR #406.
* US-16.2 (Sidebar + OpenAPI): Implementada por Joseph, incluindo blindagem anticolisão na geração de códigos.
* Correção de Bugs: Herbert e José Guylherme atuaram intensamente na resolução de bugs relacionados a PDF, alias de rotas e razão social hardcodada.
* Planejamento: Júlio Kennedy criou 5 novos cards de bugs na Sprint 06 (#408 a #412).
* Code Reviews: Atividades distribuídas entre Italo, Joseph, Guilherme e Júlio.

---

## 4. 🚧 Impedimentos e Dependências

| Integrante | Impedimento / Dependência |
|---|---|
| Júlio Kennedy | Aguarda conclusão da US-15.1 para iniciar US-15.2 |
| Herbert Carvalho | Conflito de versões em um dos PRs submetidos |

---

## 5. 🎯 Encaminhamentos para a Próxima Daily

| Responsável | Próxima atividade |
|---|---|
| Italo Jefferson | Resolver bug ou assumir nova task |
| Joseph Nichollas | Resolver algum bug disponível |
| José Guylherme | Code review ou nova task |
| Júlio Kennedy | Desenvolvimento da US-15.2 |
| Guilherme Kauã | Code review de #395, finalizar Bug-023, iniciar US-16.1 |
| Maylson Rodrigues | Nova task + code review de US-14.1 / PR #405 |
| Herbert Carvalho | Ajustar conflito de versões e aguardar task |

---

## 6. 📌 Observações Finais

A equipe demonstrou forte ritmo de entrega com múltiplos PRs submetidos e revisados no período. O impedimento mais relevante identificado é a dependência em cadeia entre as USs da Sprint 06, que está bloqueando membros sem tarefas disponíveis. O professor Ednaldo sinalizou que esse padrão de bloqueio será acompanhado de perto.

Ponto de atenção registrado: A falta de estimativa e registro formal de issues para testes manuais e automatizados (E2E) foi identificada como risco — atividades de teste não estimadas podem resultar em histórias consideradas concluídas sem cobertura adequada.
