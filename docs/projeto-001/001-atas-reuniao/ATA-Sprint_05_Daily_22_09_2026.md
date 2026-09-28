# 📝 ATA DE DAILY SCRUM (SPRINT 05)

Projeto: AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria

Data: 22 de setembro de 2026 (Terça-feira)

Modalidade: Não informada.

## 1. 👥 Participantes e Status de Presença

### Integrantes com atualizações registradas:

* Guilherme Kauã Matos da Silva — Desenvolvedor

* Joseph Nichollas — Desenvolvimento e DevOps

* Italo Jefferson — Desenvolvedor e DevOps

* Maylson da Silva Rodrigues — Desenvolvedor

* Herbert Carvalho dos Santos — Desenvolvedor

* Júlio Kennedy — Desenvolvedor

* José Guylherme dos Santos Melo — Product Owner (PO)

Observação: Não foram fornecidas informações suficientes para distinguir participantes da reunião síncrona, check-ins assíncronos e ausências.

## 2. 💬 Relatório de Progresso (Stand-up)

### 🧑‍💻 Guilherme Kauã Matos da Silva

🎯 Foco: Frontend, Ajustes de Pull Request e Documentação do Projeto

1️⃣ O que fez desde a última daily?

* Trabalhou na finalização das alterações relacionadas à tarefa cujo Pull Request já havia sido submetido.

* Deu continuidade aos ajustes necessários para concluir a implementação.

* Realizou atividades de documentação e planejamento, adicionando as atas de Daily Scrum ao planejamento do projeto.

2️⃣ O que vai fazer até a próxima daily?

* Concluir as alterações pendentes da tarefa em andamento.

* Assumir uma nova tarefa após finalizar as atividades atuais.

3️⃣ Impedimentos?

- Nenhum.

### 🧑‍💻 Joseph Nichollas

🎯 Foco: Backend, Code Review e Cobertura de Testes

1️⃣ O que fez desde a última daily?

Backend e implementação de endpoints:

- US-10.6 (#226): Implementou o endpoint `GET /budgets/pdf/comercial` no controller, responsável pela disponibilização do PDF comercial de orçamentos.

Code reviews:

* US-10.10 (#230): Realizou code review do PR #303.

* US-10.8 (#228): Realizou code review do PR #307, referente à adição de testes unitários para o `BudgetPdfService`.

* US-10.11 (#231): Realizou code review do PR #305.

* US-10.4 (#224): Revisou as alterações solicitadas anteriormente no PR #298.

2️⃣ O que vai fazer até a próxima daily?

- Trabalhar no aumento da cobertura de testes do projeto, visando melhorar os indicadores de qualidade acompanhados pelo SonarQube.

3️⃣ Impedimentos?

- Existência de tarefas bloqueadas.

Observação: Não foram especificadas quais tarefas estão bloqueadas nem as respectivas causas.

### 🧑‍💻 Italo Jefferson

🎯 Foco: Code Review e Testes Unitários do Serviço de PDF

1️⃣ O que fez desde a última daily?

Code review:

- US-10.6 (#226): Realizou code review do PR #306, referente à implementação do endpoint de geração de PDF comercial.

Testes automatizados:

* US-10.8 (#228): Trabalhou na adição de testes unitários para a classe `BudgetPdfService`.

* Submeteu a implementação por meio do PR #307.

2️⃣ O que vai fazer até a próxima daily?

- Assumir uma nova tarefa disponível e dar continuidade às atividades de desenvolvimento previstas para a sprint.

3️⃣ Impedimentos?

- Nenhum.

### 🧑‍💻 Maylson da Silva Rodrigues

🎯 Foco: Backend (Geração de PDF Comercial e Endpoint de Resumo para WhatsApp)

1️⃣ O que fez desde a última daily?

* Concluiu a implementação da US-10.2 (#294), referente à construção da tabela comercial e do resumo financeiro no documento PDF.

* Finalizou os ajustes necessários na implementação, concluindo as atividades previstas para a tarefa.

2️⃣ O que vai fazer até a próxima daily?

* Iniciar a implementação da US-10.7 (#227).

* Adicionar o endpoint `GET /api/budgets/{id}/resumo-whatsapp` ao `BudgetController`, disponibilizando o resumo do orçamento para consumo pelo frontend.

3️⃣ Impedimentos?

- Nenhum.

### 🧑‍💻 Herbert Carvalho dos Santos

🎯 Foco: Frontend, Integração com Backend e Ajustes de Code Review

1️⃣ O que fez desde a última daily?

Ajustes de implementação:

- Realizou os ajustes solicitados durante a revisão de código da US-10.11.

Integração frontend e backend:

* Implementou a integração do serviço de geração de PDF do backend com o frontend.

* Implementou a integração do serviço de compartilhamento de orçamentos por meio da funcionalidade "Copiar para WhatsApp", conectando o frontend ao serviço disponibilizado pelo backend.

2️⃣ O que vai fazer até a próxima daily?

- Não informado.

3️⃣ Impedimentos?

- Não informado.

### 🧑‍💻 Júlio Kennedy

🎯 Foco: Backend, Integração de Branches e Geração de Resumo para WhatsApp

1️⃣ O que fez desde a última daily?

Integração de código:

* Realizou a sincronização da branch `feat/us-10-emitir-exportar-orcamento-pdf`.

* Identificou e resolveu conflitos de integração na branch.

Correções na geração de PDF e testes:

* Ajustou o fuso horário utilizado na exibição das informações do rodapé do documento PDF.

* Corrigiu a asserção relacionada à quantidade de páginas no teste automatizado do PDF.

2️⃣ O que vai fazer até a próxima daily?

- Implementar o método `gerarResumoWhatsApp` na classe `BudgetPdfService`, conforme a US-10.5 (#225).

3️⃣ Impedimentos?

- Nenhum.

### 💼 José Guylherme dos Santos Melo (PO)

🎯 Foco: Desenvolvimento da US-10.3 e Testes de Sistema

1️⃣ O que fez desde a última daily?

Desenvolvimento:

- Deu continuidade à implementação da US-10.3, avançando para a etapa de finalização da tarefa.

Testes automatizados:

- Trabalhou na elaboração e execução de testes adicionais em nível de sistema para validar as funcionalidades desenvolvidas.

2️⃣ O que vai fazer até a próxima daily?

* Concluir a implementação da US-10.3.

* Vincular-se a uma nova tarefa após finalizar as atividades atuais.

3️⃣ Impedimentos?

- Nenhum.

## 3. 📊 Resumo Geral do Progresso da Sprint

Durante o dia 22 de setembro de 2026, a equipe concentrou seus esforços na finalização das funcionalidades de geração de PDF comercial, integração entre frontend e backend, ampliação da cobertura de testes automatizados e resolução de pendências identificadas durante os processos de revisão de código.

Os principais avanços registrados foram:

* Geração de PDF comercial: Conclusão da US-10.2, contemplando a tabela comercial e o resumo financeiro no documento PDF.

* Disponibilização do PDF via API: Implementação do endpoint de geração de PDF comercial no controller, conforme a US-10.6.

* Integração frontend e backend: Avanço na integração dos serviços de geração de PDF e da funcionalidade "Copiar para WhatsApp".

* Testes automatizados: Adição de testes unitários para o `BudgetPdfService`, por meio do PR #307, e desenvolvimento de testes adicionais em nível de sistema.

* Qualidade de código: Realização de code reviews nos PRs #303, #305, #306, #307 e #298.

* Integração de branches: Sincronização e resolução de conflitos na branch de emissão e exportação de orçamentos em PDF.

* Correções no PDF: Ajustes no fuso horário do rodapé e na asserção de quantidade de páginas dos testes.

* Documentação: Atualização do planejamento do projeto com a inclusão das atas de Daily Scrum.

## 4. 🚧 Impedimentos e Dependências

Impedimentos declarados:

- Joseph Nichollas informou a existência de tarefas bloqueadas, sem especificar quais são ou detalhar suas causas.

Situação dos demais integrantes:

* Guilherme Kauã, Italo Jefferson, Maylson Rodrigues, Júlio Kennedy e José Guylherme declararam não possuir impedimentos.

* Herbert Carvalho não informou sua situação em relação a impedimentos.

Pontos de atenção:

* Identificar quais tarefas estão bloqueadas para Joseph Nichollas e quais ações são necessárias para sua liberação.

* Acompanhar a conclusão das alterações pendentes nos Pull Requests em revisão.

* Verificar a integração das funcionalidades de geração de PDF e compartilhamento via WhatsApp após a conclusão das implementações relacionadas.

## 5. 🎯 Encaminhamentos para a Próxima Daily

|
Responsável

|

Próxima atividade

|
| --- | --- |
|

Guilherme Kauã

|

Concluir as alterações pendentes e assumir uma nova tarefa.

|
|

Joseph Nichollas

|

Aumentar a cobertura de testes acompanhada pelo SonarQube.

|
|

Italo Jefferson

|

Assumir uma nova tarefa disponível.

|
|

Maylson Rodrigues

|

Iniciar a US-10.7, implementando o endpoint de resumo para WhatsApp.

|
|

Herbert Carvalho

|

Próxima atividade não informada.

|
|

Júlio Kennedy

|

Implementar o método `gerarResumoWhatsApp` na US-10.5.

|
|

José Guylherme

|

Concluir a US-10.3 e assumir uma nova tarefa.

|

## 6. 📌 Observações Finais

A equipe apresentou avanços na implementação das funcionalidades relacionadas à emissão e exportação de orçamentos, com destaque para a conclusão da estrutura comercial e financeira do PDF e a disponibilização do endpoint responsável por sua geração.

Também foram registradas atividades relevantes de integração entre frontend e backend, desenvolvimento de testes automatizados, revisão de código e resolução de conflitos entre branches.

As próximas atividades concentram-se na finalização das implementações em andamento, na ampliação da cobertura de testes e na disponibilização do serviço de geração de resumo para WhatsApp.

Ponto de atenção: O impedimento relatado por Joseph Nichollas deve ser acompanhado na próxima Daily para identificar as tarefas bloqueadas e verificar a necessidade de ações da equipe para sua resolução.

Observação sobre os registros: As referências de issues, User Stories e Pull Requests foram preservadas conforme os relatos fornecidos. A próxima atividade e a situação de impedimentos de Herbert não foram informadas e, portanto, permanecem sem definição nesta ata.
