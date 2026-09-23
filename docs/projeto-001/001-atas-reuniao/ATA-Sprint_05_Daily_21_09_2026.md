# 📝 ATA DE DAILY SCRUM (SPRINT 05)

Projeto: AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria

Data: 21 de setembro de 2026 (Segunda-feira)

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

🎯 Foco: Frontend, Integração com API e Funcionalidades de Exportação e Compartilhamento de Orçamentos

1️⃣ O que fez desde a última daily?

* Iniciou a implementação da US-10.10 (#230), referente à integração do frontend com os endpoints de geração de PDF comercial e recuperação do resumo para WhatsApp.

* Trabalhou na implementação das funções no cliente Axios para consumir os endpoints responsáveis pelo download do PDF comercial e pela obtenção do resumo formatado para compartilhamento via WhatsApp.

2️⃣ O que vai fazer até a próxima daily?

* Concluir a implementação da US-10.10 (#230) ainda no dia 21/09.

* Assumir uma nova tarefa após a conclusão da implementação atual, dando continuidade às atividades previstas para a sprint.

3️⃣ Impedimentos?

- Nenhum.

### 🧑‍💻 Joseph Nichollas

🎯 Foco: Code Review e Backend (Endpoints de PDF Comercial)

1️⃣ O que fez desde a última daily?

Code reviews:

* US-09 (#133): Realizou code review do PR #293.

* US-10.4 (#224): Realizou code review do PR #298.

2️⃣ O que vai fazer até a próxima daily?

- Implementar o endpoint `GET /budgets/pdf/comercial` no controller, conforme a US-10.6 (#226).

3️⃣ Impedimentos?

- Nenhum.

### 🧑‍💻 Italo Jefferson

🎯 Foco: Code Review e Infraestrutura de Integração Contínua (CI)

1️⃣ O que fez desde a última daily?

Code review:

- Realizou code review da US-10.1, referente ao PR #297.

Integração contínua:

* Trabalhou na melhoria da pipeline de CI para executar testes automatizados e publicar relatórios em qualquer Pull Request.

* Registrou a atividade na issue #301, vinculada ao PR #302.

2️⃣ O que vai fazer até a próxima daily?

- Assumir uma tarefa disponível da US-10, dando continuidade às atividades de desenvolvimento da sprint.

3️⃣ Impedimentos?

- Nenhum.

### 🧑‍💻 Maylson da Silva Rodrigues

🎯 Foco: Backend (Geração e Estruturação do PDF Comercial)

1️⃣ O que fez desde a última daily?

* Concluiu a implementação da US-10.1 (#222), referente à configuração inicial da classe `BudgetPdfService`.

* Submeteu o Pull Request correspondente à implementação da estrutura inicial do serviço de geração de PDFs.

2️⃣ O que vai fazer até a próxima daily?

* Dar continuidade ao desenvolvimento da US-10.2 (#294), referente à implementação da tabela comercial e do resumo financeiro no PDF.

* Avançar na estruturação das informações comerciais e financeiras que compõem o documento.

3️⃣ Impedimentos?

- Nenhum.

### 🧑‍💻 Herbert Carvalho dos Santos

🎯 Foco: Frontend (Integração de Funcionalidades de PDF Comercial e Compartilhamento via WhatsApp)

1️⃣ O que fez desde a última daily?

* Trabalhou na implementação da US-10.11.

* Realizou uma correção no `BudgetCreateRequestDTO`.

2️⃣ O que vai fazer até a próxima daily?

* Aguardar a análise das implementações realizadas para dar continuidade à integração das funcionalidades recentemente desenvolvidas.

* Utilizar os recursos de geração de PDF comercial e compartilhamento via WhatsApp, conforme a disponibilidade e validação das implementações necessárias.

3️⃣ Impedimentos?

* Nenhum impedimento declarado.

* Dependência identificada: A continuidade das atividades está condicionada à análise das implementações e à disponibilidade dos recursos de PDF comercial e compartilhamento via WhatsApp.

### 🧑‍💻 Júlio Kennedy

🎯 Foco: Backend (Paginação e Rodapé do PDF) e Code Review

1️⃣ O que fez desde a última daily?

Backend e geração de PDF:

* Implementou a paginação automática e o rodapé no documento PDF utilizando `PdfPageEventHelper`.

* Registrou a implementação como parte da US-10.2 (#224), por meio do PR #298.

Code review e integração contínua:

- Realizou code review da implementação responsável por executar testes automatizados e publicar relatórios em qualquer Pull Request, referente à issue #301 e ao PR #302.

2️⃣ O que vai fazer até a próxima daily?

* Aplicar melhorias e ajustes na implementação da paginação automática e do rodapé do PDF.

* Dar continuidade ao refinamento da solução desenvolvida na US-10.2.

3️⃣ Impedimentos?

- Nenhum.

### 💼 José Guylherme dos Santos Melo (PO)

🎯 Foco: Desenvolvimento da US-10.3 e Organização dos Protótipos do Projeto

1️⃣ O que fez desde a última daily?

Desenvolvimento:

- Vinculou-se à US-10.3 e iniciou as atividades de implementação da tarefa.

Documentação e organização:

- Criou uma pasta no Google Drive para centralizar os protótipos do projeto, facilitando o acesso aos materiais de referência.

2️⃣ O que vai fazer até a próxima daily?

- Dar continuidade ao desenvolvimento da US-10.3, avançando na implementação das funcionalidades previstas para a tarefa.

3️⃣ Impedimentos?

- Nenhum.

## 3. 📊 Resumo Geral do Progresso da Sprint

Durante o período registrado, a equipe concentrou seus esforços na evolução das funcionalidades da US-10, especialmente na geração de documentos PDF comerciais, integração com o frontend, compartilhamento de orçamentos via WhatsApp e melhorias na infraestrutura de integração contínua.

Os principais avanços registrados foram:

* Estrutura inicial do PDF: Conclusão da implementação e submissão do PR referente à US-10.1, responsável pela configuração do `BudgetPdfService`.

* Paginação e rodapé: Implementação da paginação automática e do rodapé do documento PDF utilizando `PdfPageEventHelper`, com ajustes previstos para a próxima etapa.

* Integração frontend: Desenvolvimento das funções no cliente Axios para consumir os endpoints de download do PDF comercial e recuperação do resumo para WhatsApp.

* Endpoints backend: Planejamento da implementação do endpoint de obtenção do PDF comercial, conforme a US-10.6.

* Integração contínua: Avanço nas melhorias da pipeline para execução de testes e publicação de relatórios em qualquer Pull Request.

* Revisão de código: Realização de code reviews relacionados às funcionalidades de orçamento, geração de PDF e integração contínua.

* Organização do projeto: Criação de uma pasta no Google Drive para centralizar os protótipos utilizados como referência pela equipe.

## 4. 🚧 Impedimentos e Dependências

Impedimentos declarados: Nenhum integrante relatou impedimentos formais durante o período.

Dependência identificada:

- Herbert Carvalho dos Santos aguarda a análise das implementações e a disponibilidade das funcionalidades de PDF comercial e compartilhamento via WhatsApp para dar continuidade às atividades de integração.

Observação: A dependência foi registrada para acompanhamento, embora não tenha sido classificada como impedimento pelo integrante.

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

Concluir a US-10.10 e assumir uma nova tarefa.

|
|

Joseph Nichollas

|

Implementar o endpoint GET de PDF comercial na US-10.6.

|
|

Italo Jefferson

|

Assumir uma tarefa disponível da US-10.

|
|

Maylson Rodrigues

|

Avançar na tabela comercial e no resumo financeiro do PDF.

|
|

Herbert Carvalho

|

Aguardar a análise das implementações e prosseguir com a integração das funcionalidades.

|
|

Júlio Kennedy

|

Aplicar melhorias na paginação automática e no rodapé do PDF.

|
|

José Guylherme

|

Continuar o desenvolvimento da US-10.3.

|

## 6. 📌 Observações Finais

A equipe apresentou avanços nas atividades relacionadas à emissão de orçamentos em PDF, à integração entre backend e frontend e à melhoria dos processos de integração contínua.

As próximas atividades concentram-se na conclusão das implementações em andamento, na realização dos ajustes identificados durante as revisões de código e na integração das funcionalidades desenvolvidas.

Ponto de atenção para conferência: Os registros apresentam referências diferentes para a issue #224 e para a US-10.2. Joseph associa a issue #224 à US-10.4, enquanto Júlio a associa à US-10.2. Maylson, por sua vez, informa a issue #294 para a US-10.2. As referências foram mantidas conforme os relatos originais e devem ser conferidas no GitHub antes da publicação definitiva da ata.
