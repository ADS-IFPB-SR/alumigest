# 📋 Relatório de Testes e Evidências dos Critérios de Aceitação — US-13

## Informações Gerais
* **História de Usuário:** `US-13` — Aprovar Orçamento e Converter em Ordem de Serviço (O.S.)
* **Issue GitHub:** [#137](https://github.com/ADS-IFPB-SR/alumigest/issues/137)
* **Branch Auditada:** `feat/us-13-aprovar-orcamento-converter-pedido-venda`
* **Data da Execução:** 09/10/2026
* **Ambiente de Testes:** Local / E2E com Browser Automation e Backend H2/PostgreSQL
* **Status Geral:** **100% CONFORME (Todos os 5 Cenários Aprovados)**

---

## Matriz de Rastreabilidade dos Critérios de Aceitação

| Cenário | Descrição do Cenário | Critério de Aceitação | Resultado | Evidências Capturadas |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Conversão Bem-Sucedida** | Vendedor aprova orçamento `SENT`/`DRAFT`, preenche canal e data. Orçamento avança para `APPROVED` e gera OS sequencial (`OS-YYYY-NNNN`). Redireciona com toast. | ✅ **APROVADO** | • `cenario-1-01`<br>• `cenario-1-02`<br>• `cenario-1-03` |
| **2** | **Sugestão Automática de Prazo** | Ao abrir modal, campo `dataPrevisaoEntrega` é pré-preenchido com data atual $+15$ dias corridos com badge "Sugerido: +15 dias", permitindo edição manual. | ✅ **APROVADO** | • `cenario-2-01`<br>• `cenario-2-02` |
| **3** | **Bloqueio de Duplicidade (1-para-1)** | Orçamento já convertido substitui botão por "Ver Ordem de Serviço". Chamada concorrente ou direta na API retorna `HTTP 409 Conflict`. | ✅ **APROVADO** | • `cenario-3-01`<br>• `cenario-3-02` |
| **4** | **Bloqueio de Status Inválido** | Orçamento `CANCELLED`, `REJECTED` ou expirado tem botão de aprovação desabilitado com tooltip. Backend rejeita com `HTTP 422 BusinessException`. | ✅ **APROVADO** | • `cenario-4-01`<br>• `cenario-4-02` |
| **5** | **Validação de Dados Obrigatórios** | Submissão sem data ou com data no passado é bloqueada pelo Zod, exibindo mensagens de erro claras sob os respectivos campos. | ✅ **APROVADO** | • `cenario-5-01`<br>• `cenario-5-02` |

---

## Detalhamento dos Cenários e Evidências

### Cenário 1: Conversão Bem-Sucedida de Orçamento em Ordem de Serviço
* **Critério BDD/Gherkin:**
  * **Dado que** o vendedor visualiza um orçamento com status `DRAFT` ou `SENT` na página `BudgetDetailPage`
  * **Quando** clica no botão "Aprovar e Gerar O.S.", preenche o canal de aprovação (ex: `WHATSAPP`), confirma a data de previsão de entrega e submete o formulário
  * **Então** o sistema cria uma nova Ordem de Serviço com código sequencial anual no padrão `OS-YYYY-NNNN`
  * **E** o status do orçamento de origem é atualizado automaticamente para `APPROVED`, vinculando-se de forma unívoca à ordem de serviço gerada
  * **E** o usuário é redirecionado para a página de detalhes da nova ordem (`/ordens-servico/:id`) com notificação toast de sucesso.
* **Evidências Fotográficas:**
  1. `evidencias/us-13/cenario-1-01-orcamento-elegivel-pronto-para-conversao.png`: Visualização da tela do orçamento `ORC-2026-0042` em status `ENVIADO` com botão verde "Aprovar e Gerar O.S." em destaque.
  2. `evidencias/us-13/cenario-1-02-modal-aprovacao-preenchido.png`: Modal `OrderApprovalModal` aberto exibindo dados do orçamento, cartões de canal (`WHATSAPP`), prazo e observações de entrega preenchidas.
  3. `evidencias/us-13/cenario-1-03-ordem-servico-gerada-detalhes.png`: Tela de detalhes da nova ordem `OS-2026-0001` com status inicial `CRIADO`, cards de vínculo orçamentário, cronograma e tabela de itens congelados com snapshot imutável.

---

### Cenário 2: Sugestão Automática de Data de Entrega (+15 Dias Corridos)
* **Critério BDD/Gherkin:**
  * **Dado que** o modal de aprovação de orçamento é aberto
  * **Quando** o formulário é inicializado
  * **Então** o campo `dataPrevisaoEntrega` é pré-preenchido automaticamente com a data atual $+15$ dias corridos
  * **E** o vendedor pode editar essa data manualmente antes da confirmação final caso acorde prazo diferenciado com o cliente.
* **Evidências Fotográficas:**
  1. `evidencias/us-13/cenario-2-01-sugestao-automatica-prazo-15-dias.png`: Exibição do campo com a data calculada de hoje $+15$ dias corridos e selo badge em verde `"Sugerido: +15 dias corridos"`.
  2. `evidencias/us-13/cenario-2-02-edicao-manual-prazo-entrega.png`: Demonstração da edição manual do campo para uma data estipulada alternativa (ex: 30 dias à frente).

---

### Cenário 3: Bloqueio de Conversão Duplicada (Invariante 1-para-1)
* **Critério BDD/Gherkin:**
  * **Dado que** um orçamento já foi convertido previamente em uma ordem de serviço ativa
  * **Quando** qualquer usuário tenta disparar uma nova conversão para o mesmo `orcamentoId`
  * **Então** o backend rejeita a solicitação retornando status HTTP `409 Conflict` (ou `422 Unprocessable Entity`)
  * **E** a interface desabilita o botão de aprovação, indicando que a ordem de serviço já foi emitida com link direto para navegação.
* **Evidências Fotográficas:**
  1. `evidencias/us-13/cenario-3-01-bloqueio-ui-orcamento-ja-convertido.png`: Na tela do orçamento aprovado, o botão "Aprovar e Gerar O.S." é substituído pelo botão azul "Ver Ordem de Serviço", impedindo conversão duplicada e fornecendo acesso imediato à O.S. vinculada.
  2. `evidencias/us-13/cenario-3-02-rejeicao-409-conflito-duplicidade.png`: Disparo de toast de erro com feedback do backend: `"Já existe um pedido de venda gerado para o orçamento informado."`.

---

### Cenário 4: Bloqueio de Conversão para Orçamentos em Status Inválido
* **Critério BDD/Gherkin:**
  * **Dado que** um orçamento possui status `CANCELLED`, `REJECTED` ou validade expirada
  * **Quando** o usuário visualiza o orçamento
  * **Então** o botão de aprovação fica desabilitado com tooltip explicativo
  * **E** o backend bloqueia a operação lançando `BusinessException` com mensagem em português ("Orçamento com status 'Cancelado' não pode ser convertido em ordem de serviço. São aceitos: Rascunho ou Enviado").
* **Evidências Fotográficas:**
  1. `evidencias/us-13/cenario-4-01-orcamento-cancelado-botao-desabilitado.png`: Orçamento com badge `CANCELADO` e botão de aprovação desabilitado (`opacity-50`, `cursor-not-allowed`) com tooltip explicativo.
  2. `evidencias/us-13/cenario-4-02-orcamento-expirado-bloqueio.png`: Orçamento com validade expirada exibindo bloqueio da ação de aprovação.

---

### Cenário 5: Validação de Dados Obrigatórios na Aprovação
* **Critério BDD/Gherkin:**
  * **Dado que** o modal de aprovação está aberto
  * **Quando** o usuário tenta submeter o formulário sem informar data de previsão de entrega ou com data no passado
  * **Então** o schema Zod bloqueia a submissão e exibe mensagens de erro claras abaixo dos respectivos campos.
* **Evidências Fotográficas:**
  1. `evidencias/us-13/cenario-5-01-validacao-campo-obrigatorio-vazio.png`: Tentativa de submissão com campo vazio bloqueada pelo Zod, exibindo `"Informe a data prevista de entrega."` com borda vermelha `border-error`.
  2. `evidencias/us-13/cenario-5-02-validacao-data-retroativa-erro.png`: Tentativa de informar data no passado (`2020-01-01`), exibindo mensagem clara `"A data de previsão de entrega não pode ser retroativa."`.

---

## 4. Reprodutibilidade dos Testes no Cypress

Os cenários de teste foram formalizados em classes de teste do Cypress para execução automatizada e reprodução local:

### 1. Suíte de Critérios de Aceitação (Mock Determinístico)
* **Arquivo:** [`frontend/cypress/e2e/orders/us13_criterios_aceitacao_mock.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us13_criterios_aceitacao_mock.cy.ts)
* **Objetivo:** Valida os 5 cenários da US-13 (caminho feliz, sugestão de prazos, invariante 1-para-1, bloqueio de status inválidos e validação Zod) com `cy.intercept`, rodando instantaneamente sem depender do banco de dados local.
* **Comando para Execução:**
  ```bash
  cd frontend
  npx cypress run --spec "cypress/e2e/orders/us13_criterios_aceitacao_mock.cy.ts"
  ```

### 2. Jornada E2E Integrada (Backend & Banco Real)
* **Arquivo:** [`frontend/cypress/e2e/orders/us13_conversao_ordem_servico_real.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us13_conversao_ordem_servico_real.cy.ts)
* **Objetivo:** Executa a jornada completa 100% visual via UI: cadastro de cliente -> montagem de esquadria -> salvamento de orçamento -> aprovação no modal -> criação real da Ordem de Serviço (`OS-YYYY-NNNN`) no Spring Boot e PostgreSQL.
* **Comando para Execução:**
  ```bash
  cd frontend
  npx cypress run --spec "cypress/e2e/orders/us13_conversao_ordem_servico_real.cy.ts"
  ```

### 3. Demonstração Visual e Interativa Cadenciada (Velocidade Humana & Headed)
* **Arquivo:** [`frontend/cypress/e2e/orders/us13_fluxo_visual_demonstracao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us13_fluxo_visual_demonstracao.cy.ts)
* **Objetivo:** Demonstração visual interativa executada em ~44 segundos, dividida nos 5 cenários da US-13 com destaques visuais luminosos (`cy.highlight()`), digitação cadenciada letra a letra e pausas para inspeção humana.
* **Comando para Execução com Navegador Aberto:**
  ```powershell
  cd frontend
  $env:CYPRESS_RUN_BINARY = "D:\Cypress\Cache\16.1.0\Cypress\Cypress.exe"
  npx cypress run --headed --browser chrome --spec "cypress/e2e/orders/us13_fluxo_visual_demonstracao.cy.ts" --no-exit
  ```

