# 📝 ATA DE SPRINT REVIEW & RETROSPECTIVA — SPRINT 06

**Projeto:** AlumiGest — Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Período avaliado:** 29 de setembro a 12 de outubro de 2026  
**Data de consolidação:** 13 de outubro de 2026  
**Horário e local:** Não informados no material de origem  
**Registro:** Compilação da Sprint Review e de sete contribuições individuais da retrospectiva<br>
**Branch de documentação:** `planejamento`

---

## 1. 👥 Participação e fonte dos registros

Foram recebidas **sete contribuições individuais** para a retrospectiva. Como os relatos não vieram acompanhados dos nomes dos participantes, esta ata os identifica como **Relato 1** a **Relato 7**, preservando o conteúdo e evitando atribuições incorretas.

A apuração da Sprint Review considerou também:

- o planejamento oficial da Sprint 06;
- o estado das issues **#355 a #366** no GitHub;
- as PRs associadas às histórias **US-13, US-14, US-15 e US-16**;
- as pendências de integração existentes em 13/10/2026.

---

## 2. 🎯 Pauta

1. Revisar o objetivo e o incremento produzido na Sprint 06.
2. Verificar o andamento das histórias US-13 a US-16.
3. Registrar entregas, pendências técnicas e situação das integrações.
4. Consolidar os pontos positivos e as oportunidades de melhoria relatados pela equipe.
5. Definir ações para reduzir bloqueios, melhorar o refinamento das tarefas e organizar o Gitflow.

---

## 3. 📦 Objetivo da Sprint 06

A Sprint 06 marcou a transição do AlumiGest da etapa comercial para o fluxo operacional de produção. O objetivo foi permitir que um orçamento aprovado se transformasse em uma **Ordem de Serviço (O.S.)**, preservando dados e preços, controlando o ciclo de vida do pedido e oferecendo documentação formal ao cliente.

O escopo foi composto por **12 fatias verticais**, estimadas em aproximadamente **38 horas e 31 Story Points**, distribuídas entre:

- **US-13:** aprovação de orçamento e conversão em Ordem de Serviço;
- **US-14:** snapshot imutável e bloqueio dos preços contratados;
- **US-15:** gestão de status, cancelamento e reabertura do orçamento;
- **US-16:** comprovante em PDF, contratos, navegação e testes de integração e sistema.

---

## 4. 🖥️ Sprint Review — resultados apurados

### 4.1 Situação das histórias e subtarefas

| História | Resultado apurado | Situação em 13/10/2026 |
|---|---|---|
| **US-13** | As cinco subtarefas, de #355 a #359, foram encerradas. A conversão, o modal de aprovação, a listagem e o detalhamento de ordens foram implementados. | PR consolidada **#423** mesclada em `develop` em 12/10/2026. A issue pai #137 ainda estava aberta. |
| **US-14** | A subtarefa #360 foi encerrada, com snapshot imutável, lock de preços e correções posteriores de regressão. | Implementação integrada à US-13 pela PR **#406**. Correções reunidas pela PR **#444** e encaminhadas a `develop` pela PR **#445**, ainda aberta na data desta ata. |
| **US-15** | As subtarefas #361 e #362 foram encerradas, cobrindo máquina de estados, cancelamento e reabertura manual do orçamento. | A US-15.1 foi reapresentada em uma branch limpa pela PR **#418**. A US-15.2 foi integrada à branch agregadora pela PR **#419**, mas ainda havia commits pendentes de integração final com `develop`. |
| **US-16** | As subtarefas #363, #364 e #365 foram encerradas, contemplando comprovante PDF, navegação/OpenAPI e testes MockMvc/H2. | A subtarefa **#366 (US-16.4)** permaneceu aberta. A branch agregadora da US-16 ainda possuía commits pendentes de integração final com `develop`. |

**Resumo quantitativo:** 11 das 12 subtarefas planejadas foram encerradas. A Sprint 06 terminou com a US-16.4 aberta e com integrações finais ainda pendentes.

### 4.2 Incrementos entregues

- Conversão atômica de orçamento em Ordem de Serviço, com bloqueio de duplicidade.
- Geração de código sequencial anual no padrão `OS-YYYY-NNNN`.
- Modal de aprovação com canal, observações e previsão de entrega.
- Listagem paginada e página de detalhes das ordens.
- Snapshot dos itens e preservação dos valores contratados.
- Máquina de estados e cancelamento com justificativa.
- Reabertura manual do orçamento vinculado após cancelamento da O.S.
- Emissão de comprovante da ordem em PDF via OpenPDF.
- Navegação no sidebar e atualização dos contratos OpenAPI/Swagger.
- Testes de integração do backend com MockMvc e H2.
- Correções de concorrência, paginação, extração de puxadores, classificação de películas e exibição dos itens.

### 4.3 Qualidade e validação

A equipe relatou evolução na qualidade técnica por meio de:

- aumento da frequência e da qualidade dos code reviews;
- uso do SonarQube como apoio à identificação de problemas;
- ampliação dos testes automatizados no backend e no frontend;
- criação de testes de integração para os endpoints de ordens;
- documentação formal dos bugs encontrados durante a sprint.

Apesar desses avanços, também foi registrado que algumas tarefas e revisões foram concluídas sem executar a aplicação e verificar o comportamento funcional. Esse ponto foi tratado como oportunidade prioritária de melhoria.

---

## 5. 🔄 Retrospectiva — contribuições individuais

### 5.1 Relato 1

**O que funcionou bem**

- Boa organização da sprint.
- Participação e colaboração de toda a equipe.

**O que pode ser melhorado**

- Muitas tarefas permaneceram bloqueadas, deixando integrantes ociosos em alguns períodos.

### 5.2 Relato 2

**O que funcionou bem**

- A sprint foi mais organizada e teve uma carga de trabalho mais leve.

**O que pode ser melhorado**

- Nada a declarar.

### 5.3 Relato 3

**O que funcionou bem**

- Bom ritmo de trabalho.
- Melhoria na comunicação da equipe.
- Escopo bem definido.

**O que pode ser melhorado**

- Nenhum ponto crítico ou negativo foi identificado.

### 5.4 Relato 4

**O que funcionou bem**

- Maior presença e acompanhamento do Scrum Master.
- Boa produtividade da equipe.

**O que pode ser melhorado**

- Existência de tarefas bloqueadas durante a sprint.

### 5.5 Relato 5

**O que funcionou bem**

- Maior participação da equipe.
- Aumento dos code reviews e melhoria da qualidade com o apoio do SonarQube.
- Documentação dos bugs encontrados.

**O que pode ser melhorado**

- Algumas tarefas estavam subjetivas e precisavam de descrições mais detalhadas, como ocorria com as tarefas atômicas.
- Houve desorganização no Gitflow: a branch agregadora da US-15 não foi criada no momento adequado e existiram branches com histórico poluído, como a PR #417, que reuniu 44 commits misturados.
- Faltou alinhamento prévio das regras de negócio da US-15.2. A descrição permitia interpretações diferentes sobre reabertura automática, cancelamento simultâneo do orçamento ou manutenção do orçamento aprovado para reabertura manual.
- A ambiguidade da US-15.2 provocou retrabalho durante a implementação.

### 5.6 Relato 6

**O que funcionou bem**

- Constância na execução das tarefas durante a sprint.
- Boas decisões técnicas ao longo do desenvolvimento.

**O que pode ser melhorado**

- Algumas tarefas e revisões foram concluídas sem executar a aplicação para validar a implementação.
- Houve confusão no fluxo das PRs.
- No final da sprint, faltou mobilização conjunta da equipe para concluir a entrega.

### 5.7 Relato 7

**O que funcionou bem**

- Houve melhoria na comunicação da equipe, permitindo acompanhar com clareza o andamento de cada tarefa.

**O que pode ser melhorado**

- Nenhum ponto negativo adicional foi identificado.
- A equipe deve buscar uma forma de reduzir a quantidade de tarefas que bloqueiam outras tarefas.

---

## 6. 📊 Síntese da equipe

### 6.1 Pontos positivos recorrentes

- Sprint percebida como mais organizada, leve e produtiva.
- Bom ritmo de execução e constância das entregas.
- Comunicação mais fluida e maior participação da equipe.
- Maior presença do Scrum Master.
- Evolução dos code reviews e do controle de qualidade com SonarQube.
- Melhoria no registro e na documentação dos bugs.

### 6.2 Pontos de atenção recorrentes

- Tarefas bloqueadas provocaram espera e ociosidade.
- Algumas tarefas e regras de negócio não estavam suficientemente detalhadas.
- O fluxo de branches e PRs ficou confuso, com históricos misturados e integrações tardias.
- Faltou validação funcional da aplicação em parte das tarefas e revisões.
- A equipe não se mobilizou de forma suficiente para concluir todas as integrações no fechamento da sprint.

### 6.3 Causas identificadas

- Dependências sequenciais entre as histórias sem estratégia clara de desbloqueio.
- Definition of Ready insuficiente para tarefas com regras de negócio sensíveis.
- Ausência ou criação tardia de branches agregadoras.
- Falta de um checklist comum para submissão e revisão de PRs.
- Concentração das integrações e validações nos últimos dias da sprint.

---

## 7. ✅ Plano de ação

| Ação | Responsáveis | Prazo / gatilho | Evidência esperada |
|---|---|---|---|
| Adotar uma Definition of Ready com objetivo, regra de negócio, critérios de aceitação, dependências e exemplos. | Product Owner, Scrum Master e responsável técnico da tarefa | Antes de mover uma tarefa para a sprint | Issue refinada e validada pela equipe |
| Revisar diariamente tarefas bloqueadas e redistribuir trabalho quando o bloqueio superar uma daily. | Scrum Master e equipe | Durante cada daily | Bloqueio registrado com responsável e próximo passo |
| Criar as branches agregadoras de cada US antes do início das subtarefas. | Tech Lead | Antes do primeiro desenvolvimento da US | Branch publicada e indicada nas issues |
| Padronizar o Gitflow e conferir branch base, histórico e escopo antes de abrir uma PR. | Autor da PR e revisores | Em toda PR | Histórico limpo e PR limitada à tarefa correspondente |
| Exigir execução local da aplicação e dos testes afetados antes da aprovação. | Autor da tarefa e revisor | Antes do merge | Checklist da PR preenchido com evidências de validação |
| Refinar regras ambíguas com exemplos de fluxo e decisão registrada. | Product Owner, Scrum Master e desenvolvedores envolvidos | Antes da implementação | Critérios BDD e decisão anexados à issue |
| Reservar os dois últimos dias da sprint para integração, homologação e correções. | Toda a equipe | Fechamento de cada sprint | Branches agregadoras integradas e incremento demonstrável |
| Concluir a US-16.4 e integrar as pendências das US-14, US-15 e US-16 em `develop`. | Tech Lead e responsáveis pelas histórias | Antes da promoção da Release 2 | CI aprovado e PRs consolidadas mescladas |

---

## 8. 📌 Pendências registradas

1. Concluir e encerrar a **US-16.4 / issue #366**, incluindo os testes de sistema, a validação BDD e o quickstart.
2. Finalizar a integração das correções da US-14 por meio da PR #445.
3. Abrir e concluir a integração da branch agregadora da US-15 em `develop`.
4. Abrir e concluir a integração da branch agregadora da US-16 em `develop`.
5. Executar o pipeline completo e a validação funcional antes da promoção da Release 2.
6. Encerrar as issues pai #137, #139 e #140 somente após a homologação de todos os critérios de aceitação.

---

## 9. 🏁 Encerramento

A Sprint 06 apresentou evolução perceptível na organização, comunicação, participação e qualidade das revisões. O principal incremento de negócio — a transformação do orçamento em Ordem de Serviço com dados congelados e fluxo operacional — avançou de forma significativa.

O encerramento, porém, ocorreu com uma tarefa de homologação aberta e integrações pendentes. A equipe definiu como prioridade melhorar o refinamento das regras de negócio, controlar dependências e bloqueios, organizar o Gitflow e reservar capacidade explícita para integração e validação ao final das próximas sprints.

---

*Documento mantido pelo Time de Engenharia do AlumiGest — Outubro/2026.*
