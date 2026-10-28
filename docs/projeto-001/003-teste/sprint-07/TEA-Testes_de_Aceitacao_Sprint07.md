# 🧪 TEA — Testes de Aceitação — Sprint 07

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Período** | 13/10/2026 a 27/10/2026 (Consolidação em 26/10/2026) |
| **Versão da Baseline** | B-ALG-v0.7.0-S07-01 |
| **QA Responsável** | Jose Guylherme (GMSantos20) / Herbert Carvalho dos Santos / Equipe de QA AlumiGest |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Tríade Documental de Testes (`TEA`, `RTM`, `RET`) |
| **Status Geral** | 🟢 **100% HOMOLOGADO (Backend, Frontend e Suítes E2E Cypress)** |

---

## 1. 🎯 Objetivos de Qualidade e Critérios de Aceitação da Sprint 07

A **Sprint 07** consolidou a **Release 2 (Gestão Fabril & Produção)** do AlumiGest, focando na integração entre as ordens de venda comercial e o chão de fábrica:

1. **Etiquetas Adesivas Térmicas de Identificação de Peças (US-17 / Issue [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)):**
   - Emissão de etiquetas adesivas térmicas padronizadas (100×60 mm) via OpenPDF (`LabelPdfService`) e formato nativo de comandos térmicos (`ThermalLabelBplbRenderer`).
   - Identificação física com cabeçalho Alumiportas, número da O.S., nome do cliente, dimensões nominais ($L \times A$ mm), acabamento do alumínio, especificação do vidro e contagem fracionada por folha física (ex: `Peça 01/03`).
   - Bloqueio estrito com HTTP 422 para ordens canceladas (`CANCELLED`) (mitigação do defeito [BUG-484]).
   - Modal de impressão (`ThermalLabelModal.tsx`) com seleção de padrão térmico e filtro dinâmico de peças.

2. **Painel Kanban de Produção de Pedidos (US-18 / Issue [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)):**
   - Máquina de estados da esteira fabril com transições estritas: `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED`.
   - Endpoint atômico `PATCH /api/orders/{id}/production-status` gravando `completion_date` no timezone oficial de Brasília (`America/Sao_Paulo`).
   - Quadro visual Kanban com 3 colunas, drag-and-drop interativo e botões rápidos de avanço contextual.
   - Cálculo reativo de SLA/urgência de prazos nos cards (`OrderProductionCard.tsx`).
   - Barra superior de KPIs e métricas fabris (`ProductionKanbanMetrics.tsx`).
   - Filtros instantâneos por cliente, código da O.S. e período de entrega na `ProductionKanbanPage.tsx`.

---

## 2. 📋 Matriz BDD Canônica de Cenários E2E (End-to-End)

Em conformidade com a diretriz de **Tríade Documental de Testes**, todos os cenários automatizados em Cypress possuem especificação BDD formal, identificação de estratégia de execução (Full Stack Real vs. Mockado via `cy.intercept`), massa de teste associada e rastreabilidade direta com o código-fonte.

### 2.1 Cenários E2E de Etiquetas Térmicas (US-17 — `us17_5_etiquetas_identificacao_termica.cy.ts`)

| # | Cenário E2E | Arquivo `.cy.ts` | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
| 1 | **Geração de Etiquetas Térmicas (100×60mm) com Paginação por Exemplar Físico de Peça** | [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) | E2E Mockado (`cy.intercept`) / Fixture `multiItemOrder` (3 peças físicas: 2 janelas + 1 porta) | O operador acessa a tela de detalhes de uma O.S. aprovada (`WAITING_PRODUCTION`) com múltiplos itens | Clica no botão "Imprimir Etiquetas" na toolbar superior | O modal térmico é renderizado exibindo exatamente 3 cards de etiquetas fracionadas (`01/03`, `02/03`, `03/03`) | 🟢 Aprovado |
| 2 | **Validação de Conteúdo Informativo e Diagramação Técnica das Etiquetas Térmicas** | [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) | E2E Mockado (`cy.intercept`) / Fixture `multiItemOrder` | O modal de etiquetas está aberto com os cards renderizados | O operador inspeciona a diagramação de cada etiqueta no modal | Exibe cabeçalho Alumiportas, O.S., Cliente, Medidas nominais ($L \times A$ mm), Cor do Perfil, Vidro e sem código de barras simulado invasivo | 🟢 Aprovado |
| 3 | **Visualização Prévia Contínua no Modal Frontend com Filtro por Item** | [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) | E2E Mockado (`cy.intercept`) / Fixture `multiItemOrder` | O modal térmico está visível com todas as 3 etiquetas da O.S. | O operador alterna entre os filtros rápidos "Item 01", "Item 02" e "Todas as Peças" e clica em "Baixar PDF" | A grade reage instantaneamente filtrando a quantidade correta de cards e a requisição do PDF propaga o parâmetro `itemId` | 🟢 Aprovado |
| 4 | **Download Direto de Arquivo PDF do Backend com Revogação de Blob URL** | [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) | E2E Mockado (`cy.intercept`) / Mock Blob PDF `%PDF-1.4` | O operador está na tela de detalhes da O.S. com espionagem ativa em `window.URL` | Clica na ação direta de baixar PDF de etiquetas | O endpoint `/labels-pdf` responde HTTP 200, o frontend dispara a criação e revogação determinística do Blob URL e exibe toast de sucesso | 🟢 Aprovado |
| 5 | **Tratamento de Exceção para O.S. Inexistente (HTTP 404) ou sem Itens (HTTP 422)** | [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) | E2E Mockado (`cy.intercept`) / Mock HTTP 404 e 422 ProblemDetail | O sistema recebe IDs inválidos ou O.S. sem itens elegíveis | O usuário navega para a rota ou dispara a geração de etiquetas | A aplicação exibe tela amigável de erro 404 e toast descritivo em português para erro 422, restaurando os botões sem crash | 🟢 Aprovado |
| 6 | **Bloqueio e Ocultação das Ações de Etiquetas para Pedidos Cancelados** | [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) | E2E Mockado (`cy.intercept`) / Fixture O.S. com `status: CANCELLED` | O operador acessa uma O.S. cancelada com justificativa registrada | A página `OrderDetailPage` é renderizada | Os botões "Imprimir Etiquetas" e de abertura do modal térmico são ocultados da interface | 🟢 Aprovado |

---

### 2.2 Cenários E2E do Painel Kanban de Produção (US-18 — `us18_painel_kanban_producao.cy.ts`)

| # | Cenário E2E | Arquivo `.cy.ts` | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
| 1 | **Navegação via Menu Lateral e Acesso à Rota `/producao`** | [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) | E2E Mockado (`cy.intercept`) / Mock de Pedidos Fabris | O usuário autenticado está em qualquer tela do sistema (ex: `/dashboard`) | Clica no item de menu "Produção (Kanban)" na barra lateral | O sistema redireciona com sucesso para a URL canônica `/producao`, destacando o item ativo na sidebar | 🟢 Aprovado |
| 2 | **Renderização do Quadro Kanban, 3 Colunas e KPIs Executivos** | [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) | E2E Mockado (`cy.intercept`) / Fixture com 4 pedidos em diferentes estágios | A rota `/producao` é carregada com a listagem de pedidos fabris | O quadro Kanban é renderizado | Exibe as colunas "Aguardando Produção", "Em Produção" e "Concluído", com contadores precisos e métricas de atraso/urgência | 🟢 Aprovado |
| 3 | **Exibição de Alertas de Prazo e Detalhes no Card** | [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) | E2E Mockado (`cy.intercept`) / Mock de datas: ontem (atrasado), amanhã (crítico), +15d (normal) | Cards com diferentes prazos de entrega estão posicionados nas colunas | O operador visualiza os cards | Badges de SLA são coloridos adequadamente (Vermelho para Atrasado, Amarelo para Crítico, Verde para No Prazo) | 🟢 Aprovado |
| 4 | **Filtros em Tempo Real (Busca Textual, Prazo e Reset)** | [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) | E2E Mockado (`cy.intercept`) / Fixture de pedidos diversos | O painel exibe múltiplos pedidos de diferentes clientes | O operador digita no campo de busca ou seleciona o filtro "Apenas Atrasados" | O quadro filtra instantaneamente os cards visíveis mantendo a reatividade sem reload e permite limpar com "Limpar Filtros" | 🟢 Aprovado |
| 5 | **Transição de Etapa via Drag-and-Drop com Otimismo e Chamada de API** | [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) | E2E Mockado (`cy.intercept`) / Endpoint `PATCH /api/orders/{id}/production-status` | Um pedido está na coluna "Aguardando Produção" | O operador arrasta o card para a coluna "Em Produção" ou clica no botão rápido "Iniciar Produção" | O card move-se instantaneamente (UI otimista), a requisição PATCH é disparada e toast de confirmação é exibido | 🟢 Aprovado |
| 6 | **Resiliência e Rollback Otimista em Caso de Falha de Rede** | [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) | E2E Mockado (`cy.intercept`) / Simulação de falha HTTP 500 no endpoint PATCH | Um pedido está na coluna "Aguardando Produção" e a rede apresenta instabilidade | O operador tenta mover o card para a coluna "Em Produção" | O sistema exibe toast de erro em português e restaura imediatamente o card para a coluna original de origem | 🟢 Aprovado |
| 7 | **Ações da Página (Impressão PCP e Nova Ordem de Serviço)** | [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) | E2E Mockado (`cy.intercept`) / Roteamento e hooks de impressão | O operador está na página `/producao` | Clica em "Imprimir Quadro (PCP)" ou no atalho para "Nova Ordem de Serviço" | A impressão da esteira fabril é disparada e o atalho redireciona para a listagem/conversão de pedidos | 🟢 Aprovado |

---

## 3. 🧪 Suíte de Testes Unitários e Integração Homologados

Além dos 11 cenários E2E, a Sprint 07 homologou 1.765 testes automatizados nas camadas inferiores da pirâmide:

| Camada | Escopo | Ferramentas | Testes | Aprovados | Cobertura |
|---|---|---|:---:|:---:|:---:|
| **Backend Unitário & Integração** | `LabelPdfService`, `ThermalLabelBplbRenderer`, `OrderController`, `OrderProductionStatus` | JUnit 5, Mockito, Testcontainers | 882 | 882 | 91.8% |
| **Frontend Componentes & Hooks** | `ThermalLabelModal`, `OrderProductionCard`, `ProductionKanbanBoard`, `useProductionKanban` | Vitest, React Testing Library | 883 | 883 | 82.8% |
| **E2E Cypress PWA** | Suítes completas de Etiquetas Térmicas (US-17) e Painel Kanban (US-18) | Cypress 13, TypeScript | 11 | 11 | 100% |

---

## 4. 🏁 Parecer de Homologação dos Critérios de Aceitação

* [x] **100% dos Critérios de Aceitação das US-17 e US-18 validados e aprovados.**
* [x] **Tríade documental estruturada:** `TEA-Testes_de_Aceitacao_Sprint07.md`, `RTM-Roteiro_de_Testes_Manuais_Sprint07.md` e `RET-Relatorio_Execucao_Testes_Sprint07.md`.
* [x] **Bugs identificados in-sprint (#484, #485, #487, #492, #498, #500, #501) corrigidos e cobertos por testes.**
* [x] **Débitos residuais de usabilidade (#524, #525) catalogados e priorizados para a Sprint 08.**

---

*Documento homologado pela Equipe de Engenharia e QA AlumiGest — Baseline B-ALG-v0.7.0-S07-01 — 26/10/2026*
