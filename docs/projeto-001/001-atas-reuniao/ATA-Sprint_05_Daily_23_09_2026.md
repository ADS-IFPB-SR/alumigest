# 📝 ATA DE DAILY SCRUM (SPRINT 05)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria

**Data:** 23 de setembro de 2026 (Quarta-feira)

**Modalidade:** Não informada.

## 1. 👥 Participantes e Status de Presença

### Integrantes com atualizações registradas:

* Guilherme Kauã Matos da Silva — Desenvolvedor
* Joseph Nichollas Abreu Cavalcante — Desenvolvimento e DevOps
* Italo Jefferson Lima dos Santos — Desenvolvedor e DevOps
* Maylson da Silva Rodrigues — Desenvolvedor
* Júlio Kennedy dos Santos Silva — Desenvolvedor
* José Guylherme dos Santos Melo — Product Owner (PO)
* Herbert Carvalho dos Santos — Desenvolvedor

**Observação:** Não foram fornecidas informações suficientes para distinguir participantes da reunião síncrona, check-ins assíncronos e ausências.

## 2. 💬 Relatório de Progresso (Stand-up)

### 🧑‍💻 Guilherme Kauã Matos da Silva

🎯 **Foco: Frontend, Integração e PDF Técnico**

### 1️⃣ O que fez desde a última daily?

* Concluiu a implementação completa da **US-10.10 (#230)**, contando com o auxílio de Herbert Carvalho.
* Adicionou as atas de Daily Scrum ao planejamento do projeto, referente às atividades do dia 22/09.

### 2️⃣ O que vai fazer até a próxima daily?

* Trabalhar na **US-11.3**, responsável pela criação do endpoint:
  `GET /api/budgets/{id}/pdf/tecnico`
* Implementar o endpoint no `BudgetController`.

### 3️⃣ Impedimentos?

* Nenhum.

---

### 🧑‍💻 Joseph Nichollas Abreu Cavalcante

🎯 **Foco: Cobertura de Testes, Code Review e PDF Técnico**

### 1️⃣ O que fez desde a última daily?

**Cobertura de testes:**

* Trabalhou no aumento da cobertura de testes relacionadas às **US-10 e US-09**.

**Code review e melhorias:**

* Realizou code review da **US-11.1 (#283)**.
* Implementou melhorias relacionadas ao **PR #321**, referente à US-11.1.

### 2️⃣ O que vai fazer até a próxima daily?

* Trabalhar na **US-11.5 (#288)**.
* Adicionar o botão **"Emitir Via Técnica"** na `BudgetDetailPage`.
* Implementar a função `downloadPdfTecnico` para realizar o download do PDF técnico.

### 3️⃣ Impedimentos?

* Nenhum.

---

### 🧑‍💻 Italo Jefferson Lima dos Santos

🎯 **Foco: Code Review, Testes Automatizados e PDF Técnico**

### 1️⃣ O que fez desde a última daily?

**Code reviews:**

* Realizou code review da **US-10.11 (#226)**, relacionada ao **PR #308**.
* Realizou code review da **US-10.3 (#319)**.

**Testes automatizados:**

* Implementou uma suíte de testes de cobertura e garantia da qualidade para o catálogo de clientes, relacionada às **US-02 e US-04 (#315)**.

**PDF técnico:**

* Iniciou a implementação da **US-11.1 (#283)**, referente ao layout da Ficha Técnica e ao Sigilo Comercial no `BudgetPdfService`.

### 2️⃣ O que vai fazer até a próxima daily?

* Trabalhar na **US-10.12**.

### 3️⃣ Impedimentos?

* Nenhum.

---

### 🧑‍💻 Maylson da Silva Rodrigues

🎯 **Foco: Backend, Resumo para WhatsApp e Cobertura de Testes**

### 1️⃣ O que fez desde a última daily?

**Code review:**

* Realizou code review da **US-10.5 (#320)**.

**Implementação:**

* Concluiu a implementação da **US-10.7 (#227)**, referente à adição do endpoint:
  `GET /api/budgets/{id}/resumo-whatsapp`
* Finalizou e submeteu o Pull Request relacionado à funcionalidade.

### 2️⃣ O que vai fazer até a próxima daily?

* Iniciar a **US-10.9 (#229)**, referente à criação de testes para o resumo do WhatsApp e para o endpoint disponibilizado no `BudgetController`.
* Trabalhar na ampliação da cobertura de testes da funcionalidade.

### 3️⃣ Impedimentos?

* Nenhum.

---

### 🧑‍💻 Herbert Carvalho dos Santos

🎯 **Foco: Não informado**

### 1️⃣ O que fez desde a última daily?

* Nenhuma atividade registrada.

### 2️⃣ O que vai fazer até a próxima daily?

* Não informado.

### 3️⃣ Impedimentos?

* Não informado.

**Observação:** Herbert foi mencionado por Guilherme como apoio na implementação da **US-10.10 (#230)**, porém não registrou uma atualização individual de atividades para esta Daily.

---

### 🧑‍💻 Júlio Kennedy dos Santos Silva

🎯 **Foco: Resumo para WhatsApp e Testes do PDF Técnico**

### 1️⃣ O que fez desde a última daily?

* Implementou o método `gerarResumoWhatsApp` no `BudgetPdfService`, conforme especificado na **US-10.5 (#225)**.

### 2️⃣ O que vai fazer até a próxima daily?

* Criar testes automatizados para o PDF técnico.
* Validar, por meio dos testes da **US-11.4 (#285)**, a ausência de termos monetários no PDF técnico.

### 3️⃣ Impedimentos?

* Nenhum.

---

### 💼 José Guylherme dos Santos Melo (PO)

🎯 **Foco: Finalização da US-10.3 e Correções de Code Review**

### 1️⃣ O que fez desde a última daily?

* Concluiu a implementação da **US-10.3**.

### 2️⃣ O que vai fazer até a próxima daily?

* Corrigir as alterações solicitadas durante o processo de code review que ainda não foram aprovadas.
* Realizar os ajustes necessários para que a implementação seja aprovada.

### 3️⃣ Impedimentos?

* Nenhum.

## 3. 📊 Resumo Geral do Progresso da Sprint

Durante o dia **23 de setembro de 2026**, a equipe avançou principalmente na conclusão das funcionalidades relacionadas ao resumo de orçamento para WhatsApp, na implementação das primeiras funcionalidades do PDF técnico, na ampliação da cobertura de testes automatizados e na realização de code reviews.

Os principais avanços registrados foram:

* **US-10.10:** Guilherme concluiu a implementação da tarefa, contando com auxílio de Herbert.

* **US-10.7:** Maylson concluiu a implementação e o Pull Request do endpoint `GET /api/budgets/{id}/resumo-whatsapp`.

* **US-10.5:** Júlio concluiu a implementação do método `gerarResumoWhatsApp` no `BudgetPdfService`.

* **Cobertura de testes:** Joseph trabalhou no aumento da cobertura de testes relacionadas às **US-10 e US-09**.

* **US-10.9:** Maylson assumiu a próxima etapa de criação dos testes do resumo WhatsApp e do endpoint correspondente.

* **US-11.1:** Italo iniciou a implementação do layout da Ficha Técnica e do Sigilo Comercial no `BudgetPdfService`.

* **US-11.1:** Joseph realizou code review e implementou melhorias relacionadas ao **PR #321**.

* **US-11.3:** Guilherme assumiu a implementação do endpoint de geração do PDF técnico.

* **US-11.4:** Júlio assumiu a criação de testes automatizados para validar a ausência de termos monetários no PDF técnico.

* **US-11.5:** Joseph assumiu a implementação do botão **"Emitir Via Técnica"** e da função `downloadPdfTecnico` na `BudgetDetailPage`.

* **Testes automatizados:** Italo desenvolveu uma suíte de testes para cobertura e garantia da qualidade relacionada ao catálogo de clientes, contemplando as **US-02 e US-04 (#315)**.

* **Code reviews:** Foram realizados reviews relacionados às **US-10.5, US-10.11 e US-10.3**.

* **US-10.3:** José Guylherme concluiu a implementação e iniciou os ajustes solicitados durante o code review.

* **Documentação:** Guilherme adicionou as atas de Daily Scrum ao planejamento do projeto.

## 4. 🚧 Impedimentos e Dependências

### Impedimentos declarados:

* Guilherme Kauã: nenhum.
* Joseph Nichollas: nenhum.
* Italo Jefferson: nenhum.
* Maylson Rodrigues: nenhum.
* Júlio Kennedy: nenhum.
* José Guylherme: nenhum.
* Herbert Carvalho: não informado.

### Pontos de atenção:

* Acompanhar a implementação do fluxo completo de emissão do **PDF técnico**, envolvendo backend e frontend.
* Verificar a integração entre o endpoint `GET /api/budgets/{id}/pdf/tecnico` e a função `downloadPdfTecnico`.
* Acompanhar a implementação do botão **"Emitir Via Técnica"** na `BudgetDetailPage`.
* Acompanhar os testes da **US-11.4**, especialmente a validação da ausência de informações monetárias no PDF técnico.
* Acompanhar a implementação da **US-11.1**, relacionada ao layout da Ficha Técnica e ao Sigilo Comercial.
* Verificar a conclusão dos ajustes solicitados no code review da **US-10.3**.
* Acompanhar a criação dos testes da **US-10.9** para o resumo do WhatsApp e seu endpoint.
* Acompanhar a evolução da **US-10.12**.

## 5. 🎯 Encaminhamentos para a Próxima Daily

| Responsável           | Próxima atividade                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Guilherme Kauã**    | Implementar a US-11.3, criando o endpoint `GET /api/budgets/{id}/pdf/tecnico` no `BudgetController`.                   |
| **Joseph Nichollas**  | Implementar a US-11.5, adicionando o botão "Emitir Via Técnica" e a função `downloadPdfTecnico` na `BudgetDetailPage`. |
| **Italo Jefferson**   | Trabalhar na US-10.12.                                                                                                 |
| **Maylson Rodrigues** | Iniciar a US-10.9, criando testes do resumo WhatsApp e do endpoint no `BudgetController`.                              |
| **Herbert Carvalho**  | Próxima atividade não informada.                                                                                       |
| **Júlio Kennedy**     | Criar testes automatizados do PDF técnico pela US-11.4, validando a ausência de termos monetários.                     |
| **José Guylherme**    | Corrigir as alterações solicitadas no code review da US-10.3.                                                          |

## 6. 📌 Observações Finais

A Daily do dia **23 de setembro de 2026** registrou uma transição das funcionalidades relacionadas ao **PDF comercial e resumo para WhatsApp** para uma nova frente de desenvolvimento voltada ao **PDF técnico**.

A **US-10.7** foi concluída por Maylson, disponibilizando o endpoint de resumo para WhatsApp, enquanto Júlio finalizou a implementação do método `gerarResumoWhatsApp` no `BudgetPdfService`. Como próxima etapa, foram planejados testes automatizados para garantir o funcionamento dessa funcionalidade.

Paralelamente, a equipe iniciou uma nova frente relacionada ao **PDF técnico**. Guilherme assumiu a criação do endpoint da **US-11.3**, Italo trabalhou na **US-11.1**, relacionada ao layout da Ficha Técnica e Sigilo Comercial, e Júlio ficou responsável pelos testes da **US-11.4**, com foco na validação da ausência de informações monetárias.

Joseph também avançou nessa frente, realizando code review e melhorias relacionadas à **US-11.1 (#283)** e assumindo a **US-11.5 (#288)**, que contempla a adição do botão **"Emitir Via Técnica"** e da função `downloadPdfTecnico` na `BudgetDetailPage`.

Também houve continuidade nas atividades de **qualidade e revisão de código**, incluindo o aumento da cobertura de testes das US-09 e US-10, a criação de uma suíte de testes para o catálogo de clientes e a realização de diversos code reviews.

José Guylherme concluiu a implementação da **US-10.3**, permanecendo pendentes os ajustes solicitados durante o processo de code review.

**Observação sobre os registros:** As referências de User Stories, issues e Pull Requests foram preservadas conforme os relatos fornecidos. Herbert não registrou atividades próprias nesta Daily, embora tenha sido mencionado como apoio na implementação da US-10.10. As próximas atividades de Herbert não foram informadas.
