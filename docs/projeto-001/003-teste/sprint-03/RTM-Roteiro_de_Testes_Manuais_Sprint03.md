# 📋 RTM — Roteiro de Testes Manuais — Sprint 03

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 03 — Clientes, Motor de Orçamentos, Templates de Esquadrias e E2E Cypress |
| **Documento Equivalente BDD** | [`TEA-Testes_de_Aceitacao_Sprint03.md`](./TEA-Testes_de_Aceitacao_Sprint03.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint03.md`](./RET-Relatorio_Execucao_Testes_Sprint03.md) |
| **Perfil Executor** | Product Owner (PO), Analista de QA e Homologadores de Negócio |
| **Ambiente de Teste** | Homologação Local (`http://localhost:5173`) |
| **Data de Emissão** | 31/08/2026 |

---

## 1. Instruções para os Homologadores

Este roteiro guia a validação manual dos novos fluxos de **Clientes**, **Cálculo de Orçamentos**, **Studio CAD de Esquadrias** e da suíte expandida de **Catálogo** entregues na Sprint 03. Os passos abaixo refletem tanto os testes unitários do motor quanto as 23 suítes E2E construídas em Cypress.

### Pré-requisitos de Ambiente:
1. Backend ativo e migrado: `mvn spring-boot:run` (PostgreSQL na porta 5432)
2. Frontend ativo: `npm run dev`
3. Acesso à aplicação via navegador moderno (Chrome, Edge ou Firefox)

---

## 2. Fichas Operacionais de Execução Manual

### 🧪 Cenário RTM-S03-01: Cadastro e Busca Paginada de Clientes (PF e PJ)

* **Objetivo:** Validar o registro de clientes com máscaras de CPF/CNPJ, validação de unicidade e busca em tempo real com debounce.
* **Equivalente Automatizado:** `ClientControllerTest` / `ClientServiceTest`
* **Ponto de Partida:** Rota `/clientes`

#### 👣 Passos de Execução:
1. **Acessar a Área de Clientes:** Clicar no menu lateral "Clientes" ou navegar até `/clientes`.
2. **Abrir Novo Cliente:** Clicar no botão `[data-testid="btn-novo-cliente"]` ou `[data-cy="new-client-button"]`.
3. **Selecionar Tipo Pessoa Física:** Marcar o seletor `PF`.
4. **Preencher os Dados:**
   * Campo Nome: `Carlos Alberto da Silva`
   * Campo CPF: Digitar `11144477705` (conferir se a máscara formata automaticamente para `111.444.777-05`).
   * Campo Telefone / WhatsApp: `(83) 98888-7777`
   * Campo E-mail: `carlos.silva@exemplo.com`
5. **Salvar Cliente:** Clicar no botão `[data-testid="btn-salvar-cliente"]`.
6. **Validar Toast e Grid:** Confirmar que surge toast verde `"Cliente cadastrado com sucesso!"` e o cliente aparece no topo da tabela.
7. **Testar Busca com Debounce:** No campo `[data-testid="input-busca-cliente"]`, digitar `Carlos` e aguardar 300ms. A tabela deve filtrar instantaneamente sem piscar a tela.

#### ✅ Critérios de Aceitação:
- [ ] A máscara de CPF impede inserção de letras ou dígitos a mais que 11 caracteres.
- [ ] O backend rejeita a tentativa de cadastrar o mesmo CPF novamente com status `409 Conflict`.
- [ ] A paginação mantém os botões "Próxima" e "Anterior" operacionais quando a lista excede 10 registros.

---

### 🧪 Cenário RTM-S03-02: Simulação e Criação de Orçamento com Motor de Cálculo

* **Objetivo:** Validar o motor de cálculo gerando o orçamento, aplicando as fórmulas dimensionais ($4W+6H$), área de vidro e markup.
* **Equivalente Automatizado:** `BudgetIntegrationTest` / `BudgetQuantityServiceTest`
* **Ponto de Partida:** Rota `/orcamentos/novo`

#### 👣 Passos de Execução:
1. **Iniciar Novo Orçamento:** Acessar a tela `/orcamentos/novo`.
2. **Vincular o Cliente:** No campo de seleção de cliente, escolher `Carlos Alberto da Silva`.
3. **Adicionar Item de Esquadria:** Clicar em `[data-testid="btn-adicionar-item"]`.
4. **Informar Medidas de Vão:**
   * Largura ($W$): Digitar `1200` (mm)
   * Altura ($H$): Digitar `1000` (mm)
5. **Selecionar Insumos Base:**
   * Vidro: `Vidro Canelado 4mm Incolor`
   * Perfil: `Perfil Linha Suprema`
6. **Verificar Cálculos em Tempo Real:**
   * Área calculada de vidro: conferir se exibe $1,20 m^2$.
   * Total de barras/perfis calculados com folgas.
7. **Configurar Markup:** Definir markup comercial de `40%`.
8. **Salvar Proposta:** Clicar no botão `[data-testid="btn-salvar-orcamento"]`.

#### ✅ Critérios de Aceitação:
- [ ] O valor total de venda reflete com precisão centesimal a fórmula: $\text{Custo Total} \times (1 + \text{Markup})$.
- [ ] O status inicial da proposta é gravado como `DRAFT` (Rascunho).
- [ ] O orçamento recebe um código sequencial identificador legível (ex: `ORC-0001`).

---

### 🧪 Cenário RTM-S03-03: Renderização Vetorial CAD e Cotagem de Templates de Esquadria

* **Objetivo:** Validar a fidelidade visual dos 10 templates paramétricos em SVG, cotas milimétricas e indicação de sentidos de abertura.
* **Equivalente Automatizado:** `WindowSvgPreview.test.tsx` (QA-01.2)
* **Ponto de Partida:** Rota `/produtos/novo`

#### 👣 Passos de Execução:
1. **Acessar o Construtor de Produtos:** Navegar até `/produtos/novo`.
2. **Selecionar o Template:** Escolher o modelo "Janela 2 Folhas de Correr" no seletor de tipologias.
3. **Alterar Medidas:**
   * Alterar largura para `1500 mm` e altura para `1200 mm`.
4. **Inspecionar o Painel de Preview SVG:**
   * Verificar se o SVG redimensiona mantendo a proporção visual correta.
   * Verificar as cotas de largura e altura nos eixos superior e lateral do desenho.
   * Verificar se os puxadores e furações técnicas estão posicionados nas folhas móveis.
5. **Testar Alerta de Vão Mínimo:** Reduzir a largura para `250 mm` e verificar a exibição de aviso visual alertando vão subdimensionado.

#### ✅ Critérios de Aceitação:
- [ ] O componente SVG não apresenta distorção de aspect ratio ao redimensionar a janela.
- [ ] O nome do produto respeita o limite máximo de 120 caracteres defensivos.
- [ ] Os badges de insumos obrigatórios (`VIDRO`, `PERFIL`, `FERRAGEM`) são atualizados de acordo com o template.

---

### 🧪 Cenário RTM-S03-04: Seleção de Esquadria via Modal de Orçamento (`ProductPickerModal`)

* **Objetivo:** Validar a busca, filtro por categorias e injeção do produto configurado no orçamento.
* **Equivalente Automatizado:** `ProductPickerModal.test.tsx`
* **Ponto de Partida:** Rota `/orcamentos/novo`

#### 👣 Passos de Execução:
1. **Abrir Modal de Seleção:** Dentro do assistente de orçamentos, clicar em "Buscar no Catálogo".
2. **Filtrar por Categoria:** No dropdown de categorias, selecionar "Janelas de Correr".
3. **Visualizar Miniaturas SVG:** Confirmar que os cards exibem miniaturas SVG correspondentes e badges coloridos de insumos.
4. **Selecionar Produto:** Clicar no botão "Selecionar" no card da Janela 2 Folhas.
5. **Confirmar Injeção:** Observar que o modal fecha e todos os parâmetros e opções padrão da esquadria preenchem o item do orçamento.

#### ✅ Critérios de Aceitação:
- [ ] O modal possui campo de busca rápida com filtragem reativa instantânea.
- [ ] Ao fechar o modal sem selecionar, os dados previamente preenchidos no orçamento não são perdidos.

---

### 🧪 Cenário RTM-S03-05: Navegação, Filtro por Status e Debounce na Suíte Cypress (Catálogo)

* **Objetivo:** Reproduzir manualmente a verificação das 23 specs Cypress de catálogo, testando filtros de status e alternância de abas.
* **Equivalente Automatizado:** `cypress/e2e/catalog/catalog-navigation.cy.ts` e `catalog-*-status-filter.cy.ts`
* **Ponto de Partida:** Rota `/`

#### 👣 Passos de Execução:
1. **Alternar Abas:** Clicar sequencialmente em `[data-cy="catalog-tab-glasses"]`, `[data-cy="catalog-tab-profiles"]`, `[data-cy="catalog-tab-films"]` e `[data-cy="catalog-tab-hardwares"]`.
2. **Aplicar Filtro de Status:**
   * Na aba Perfis, alterar o filtro de status para "Inativos".
   * Confirmar que a tabela exibe apenas itens inativados (badge cinza/vermelho).
   * Retornar o filtro para "Ativos" e confirmar o restabelecimento da lista.
3. **Abrir Detalhes de Item:** Clicar no botão de visualização de detalhes e constatar a abertura do painel lateral/modal com todos os atributos técnicos.

#### ✅ Critérios de Aceitação:
- [ ] A navegação entre abas não causa reload da página (Single Page Application fluida).
- [ ] A alteração de status (ativar/desativar) atualiza o badge imediatamente sem quebra de estado.

---

## 3. Matriz Defensiva de Defeitos e Comportamentos Anômalos (RBD Sprint 03)

| Sintoma Observado | Causa Mais Provável | Ação de Contingência / Diagnóstico |
|---|---|---|
| CPF com pontuação inválida gera erro 400 | Frontend enviou máscara formatada para API que espera dígitos puros | O sanitizador deve remover caracteres não-numéricos antes do POST. |
| Modal do Studio CAD corta a visualização em telas pequenas | Resolução mobile ($< 768\text{px}$) com overflow escondido | Utilize o scroll horizontal ou reduza o zoom do navegador para homologação. |
| Preço de orçamento divergente em dízimas periódicas | Uso indevido de float/double ao invés de `BigDecimal` | Verifique o `BudgetPricingService`; todos os arredondamentos usam `RoundingMode.HALF_EVEN`. |
| Busca de clientes não dispara após digitação rápida | Debounce configurado com tempo excessivo ($> 800\text{ms}$) | Aguarde a pausa na digitação; o gatilho reativo dispara após 300ms de inatividade. |
