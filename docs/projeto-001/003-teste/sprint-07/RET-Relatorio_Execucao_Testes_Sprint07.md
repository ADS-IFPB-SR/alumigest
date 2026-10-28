# 🧪 RET — Relatório de Execução de Testes — Sprint 07

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Versão da Baseline** | B-ALG-v0.7.0-S07-01 |
| **Período** | 13/10/2026 a 27/10/2026 (Consolidação em 26/10/2026) |
| **QA Responsável** | Jose Guylherme (GMSantos20) / Herbert Carvalho dos Santos / Equipe AlumiGest |
| **Issue de Homologação** | [#514](https://github.com/ADS-IFPB-SR/alumigest/issues/514) (QA-05) |
| **Branch de Homologação** | `QA/qa-05-homologacao-gestao-fabril` |
| **Governança** | Docs-as-Code — Tríade Documental de Testes ([`TEA`](./TEA-Testes_de_Aceitacao_Sprint07.md), [`RTM`](./RTM-Roteiro_de_Testes_Manuais_Sprint07.md), [`RET`](./RET-Relatorio_Execucao_Testes_Sprint07.md)) |
| **Status Geral** | 🟢 **APROVADO (100% dos Cenários BDD, Integração e Suítes Cypress E2E)** |

---

## 1. 🎯 Resumo Executivo e Escopo dos Testes

A **Sprint 07** consolidou e homologou a **Release 2 (Gestão Fabril & Produção)** do AlumiGest, integrando a esteira comercial de vendas (Sprint 06) à fábrica de esquadrias:

1. **Etiquetas Adesivas Térmicas de Identificação de Peças (US-17 / Issue [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)):**
   - Emissão de etiquetas adesivas térmicas via OpenPDF (`LabelPdfService`) e comandos nativos térmicos (`ThermalLabelBplbRenderer`).
   - Identificação física padronizada: cabeçalho Alumiportas, O.S., cliente, medidas nominais ($L \times A$ mm), acabamento do alumínio, tipo de vidro e contagem fracionada por folha física (ex: `Peça 01/03`).
   - Bloqueio com HTTP 422 para ordens canceladas (`CANCELLED`) (validação do [BUG-484]).
   - Modal de impressão (`ThermalLabelModal.tsx`) com seleção de padrão térmico e filtro dinâmico de peças.
   - Suíte Cypress E2E automatizada cobrindo 4 cenários de aceitação e tratamentos de exceção (`us17_5_etiquetas_identificacao_termica.cy.ts` — Issue [#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474)).

2. **Painel Kanban de Produção de Pedidos (US-18 / Issue [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)):**
   - Máquina de estados da esteira fabril com transições estritas: `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED`.
   - Endpoint atômico `PATCH /api/orders/{id}/production-status` gravando `completion_date` no fuso oficial de Brasília (`America/Sao_Paulo`).
   - Quadro visual Kanban interativo com 3 colunas, drag-and-drop e botões rápidos de avanço contextual.
   - Cálculo automático e reativo de urgência de prazos (SLA) nos cards (`OrderProductionCard.tsx`).
   - Barra superior de métricas e KPIs fabris (`ProductionKanbanMetrics.tsx`).
   - Filtros instantâneos por cliente, código da O.S. e período de entrega na `ProductionKanbanPage.tsx`.
   - Suíte Cypress E2E automatizada cobrindo 7 cenários completos de esteira fabril (`us18_painel_kanban_producao.cy.ts` — Issue [#458](https://github.com/ADS-IFPB-SR/alumigest/issues/458)).

---

## 2. 📊 Consolidação da Pirâmide de Testes da Sprint 07

| Camada / Tipo de Teste | Frameworks / Ferramentas | Testes Executados | Passaram | Falharam | Cobertura (% Linhas) | Tempo Médio |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Testes Unitários e Integração Backend** | Spring Boot Test, JUnit 5, Mockito, Testcontainers | 882 | 882 | 0 | 91.8% | ~42s |
| **Testes de Componentes e Hooks Frontend** | Vitest, React Testing Library, happy-dom | 883 | 883 | 0 | 82.8% | ~14s |
| **Testes E2E (End-to-End PWA)** | Cypress 13, TypeScript, Headless Chrome | 11 | 11 | 0 | 100% dos fluxos | ~18s |
| **TOTAL CONSOLIDADO** | — | **1.765** | **1.765** | **0** | **≥ 87.3%** | **~74s** |

* **Status do Quality Gate (SonarQube):** ✅ **APROVADO (OK)** — Zero bugs, zero vulnerabilidades e cobertura em código novo $\ge 80\%$.
* **Taxa Geral de Sucesso dos Testes:** `100%` (Zero falhas na baseline final da sprint).

---

## 3. 🌐 Resultados Detalhados da Suíte E2E Cypress (11 Cenários Homologados)

Os cenários foram especificados formalmente no [`TEA-Testes_de_Aceitacao_Sprint07.md`](./TEA-Testes_de_Aceitacao_Sprint07.md), possuem roteiro de validação manual no [`RTM-Roteiro_de_Testes_Manuais_Sprint07.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint07.md) e registraram os seguintes resultados técnicos no executor headless do Cypress:

### 3.1 Módulo US-17: Etiquetas Térmicas de Identificação (`us17_5_etiquetas_identificacao_termica.cy.ts`)
* **PR Associado:** [#474](https://github.com/ADS-IFPB-SR/alumigest/pull/474) | **Commit de Consolidação:** `f82e11a`
* **Estratégia:** E2E com `cy.intercept` e mocks determinísticos de O.S. multifolha (`multiItemOrder`).

| # | Título do Cenário E2E | Asserções Principais Validadas | Duração | Status |
|:---:|:---|:---|:---:|:---:|
| 1 | **Geração de Etiquetas Térmicas com Paginação por Exemplar Físico** | Modal aberto via botão superior; renderização de exatamente 3 cards para 2 itens (2 janelas + 1 porta); contagem fracionada `01/03`, `02/03` e `03/03`. | ~1.4s | 🟢 Aprovado |
| 2 | **Validação de Conteúdo Informativo e Diagramação Técnica** | Presença de cabeçalho "ALUMIPORTAS", código da O.S., cliente, medidas ($L \times A$), acabamento do perfil, vidro e ausência de código de barras espúrio. | ~1.1s | 🟢 Aprovado |
| 3 | **Visualização Prévia Contínua no Modal Frontend com Filtro por Item** | Alternância dinâmica entre filtros rápidos "Item 01 (2)", "Item 02 (1)" e "Todas as Peças (3)"; propagação correta do parâmetro `itemId` na requisição do PDF (BUG #487). | ~1.8s | 🟢 Aprovado |
| 4 | **Download Direto de Arquivo PDF do Backend com Revogação de Blob URL** | Resposta HTTP 200 com `Content-Type: application/pdf`; criação e revogação determinística de Blob URL em memória (`window.URL`); exibição de toast de sucesso. | ~1.3s | 🟢 Aprovado |
| 5 | **Tratamento de Exceção para O.S. Inexistente (HTTP 404) ou sem Itens (HTTP 422)** | Exibição de tela amigável de erro 404 em português; toast defensivo para erro 422 e restauração do estado habilitado dos botões sem congelamento de tela. | ~1.2s | 🟢 Aprovado |
| 6 | **Bloqueio e Ocultação das Ações de Etiquetas para Pedidos Cancelados** | Injeção de O.S. com `status: CANCELLED`; validação de que os botões de emissão e modal térmico não existem na DOM da tela. | ~0.9s | 🟢 Aprovado |

---

### 3.2 Módulo US-18: Painel Kanban de Produção (`us18_painel_kanban_producao.cy.ts`)
* **PR Associado:** [#458](https://github.com/ADS-IFPB-SR/alumigest/pull/458) | **Commit de Consolidação:** `76d8ceb2`
* **Estratégia:** E2E com `cy.intercept`, mocking de esteira fabril e teste de resiliência com rollback otimista.

| # | Título do Cenário E2E | Asserções Principais Validadas | Duração | Status |
|:---:|:---|:---|:---:|:---:|
| 1 | **Navegação via Menu Lateral e Acesso à Rota `/producao`** | Clique no menu lateral "Produção (Kanban)"; redirecionamento para rota `/producao` e realce da rota ativa na sidebar. | ~1.0s | 🟢 Aprovado |
| 2 | **Renderização do Quadro Kanban, 3 Colunas e KPIs Executivos** | Renderização das 3 colunas ("Aguardando Produção", "Em Produção", "Concluído") com contadores numéricos precisos e barra de KPIs (`ProductionKanbanMetrics`). | ~1.3s | 🟢 Aprovado |
| 3 | **Exibição de Alertas de Prazo e Detalhes no Card** | Badges de SLA reativos: Vermelho para pedidos vencidos, Amarelo para pedidos com prazo crítico ($\le 2$ dias) e Verde para pedidos dentro do cronograma. | ~1.2s | 🟢 Aprovado |
| 4 | **Filtros em Tempo Real (Busca Textual, Prazo e Reset)** | Filtragem em tempo real sem recarregar a página ao digitar no input de busca; ativação de filtro "Apenas Atrasados" e retorno ao estado original com "Limpar Filtros". | ~1.5s | 🟢 Aprovado |
| 5 | **Transição de Etapa via Drag-and-Drop com Otimismo e Chamada de API** | Arrasto de card entre colunas; movimentação otimista imediata na UI; chamada `PATCH /api/orders/{id}/production-status` disparada com payload correto e toast de sucesso. | ~2.1s | 🟢 Aprovado |
| 6 | **Resiliência e Rollback Otimista em Caso de Falha de Rede** | Simulação de HTTP 500 no endpoint PATCH; captura de erro pelo React Query; reversão instantânea (rollback) do card para a coluna de origem e toast de erro amigável. | ~1.6s | 🟢 Aprovado |
| 7 | **Ações da Página (Impressão PCP e Nova Ordem de Serviço)** | Disparo de impressão técnica da esteira fabril e navegação pelo botão de atalho para conversão de novas ordens de serviço. | ~1.1s | 🟢 Aprovado |

---

## 4. 🐛 Defeitos e BUGs Tratados In-Sprint

Durante os ciclos de teste e homologação da Sprint 07, foram tratados e corrigidos 8 defeitos técnicos:

| BUG ID / Issue | Descrição Resumida | Severidade | Módulo | Resolução / Status |
|:---:|:---|:---:|:---:|:---|
| **#484** | Ausência de validação no backend para bloqueio de emissão de etiquetas em ordens canceladas | 🔴 Alta | Backend / Controller | ✅ Corrigido com retorno HTTP 422 e validação defensiva |
| **#485** | Falha de tratamento de erro no download de etiquetas térmicas em formato Blob | 🟡 Média | Frontend / API | ✅ Corrigido com parsing de erro JSON encapsulado em Blob |
| **#487** | Botão "Baixar PDF" no `ThermalLabelModal` ignorava o filtro ativo de peças | 🟡 Média | Frontend / Modal | ✅ Corrigido com propagação de parâmetro `itemId` na URL |
| **#492 / #493** | Ajustes de quebra de texto e largura nominal na impressão térmica | 🟡 Média | Backend / Renderer | ✅ Corrigido no dimensionamento do renderer BPLB/PDF |
| **#498** | Drag-and-drop de pedido na mesma coluna do Kanban disparava PUT desnecessário gerando erro 422 | 🟡 Média | Frontend / Kanban | ✅ Corrigido com verificação prévia de igualdade de coluna |
| **#500** | Card de produção exibia quantidade de linhas de itens em vez do total de peças físicas | 🟡 Média | Frontend / Kanban | ✅ Corrigido com somatório das quantidades unitárias |
| **#501** | Badge de 'Atrasado' era renderizado para pedidos com status `COMPLETED` cujo prazo expirou | 🟡 Média | Frontend / Card | ✅ Corrigido com condicional desconsiderando SLA após conclusão |
| **#524** | Duplicidade de item Kanban na barra lateral (Sidebar) com rota legada `/kanban` | 🟢 Baixa | Frontend / Menu | 🟡 Aberto pelo PO (priorizado para Sprint 08) |
| **#525** | Painel Kanban sem rolagem vertical (scroll), ocultando ordens de serviço inferiores nas colunas | 🟡 Média | Frontend / Layout | 🟡 Aberto pelo PO (priorizado para Sprint 08) |

---

## 5. 🛡️ Parecer Final de Homologação de QA

A esteira da **Sprint 07** atingiu integralmente os critérios do **Definition of Done (DoD)** e os objetivos de qualidade da **Release 2**:
* 100% dos testes unitários, testes de integração e cenários E2E Cypress aprovados no pipeline de CI/CD.
* Tríade documental de testes estabelecida: [`TEA`](./TEA-Testes_de_Aceitacao_Sprint07.md) (Critérios e BDD), [`RTM`](./RTM-Roteiro_de_Testes_Manuais_Sprint07.md) (Roteiro Manual) e [`RET`](./RET-Relatorio_Execucao_Testes_Sprint07.md) (Evidências de Execução).
* Débitos de layout relatados pelo PO (#524, #525) devidamente triados para início imediato na Sprint 08.
* O incremento encontra-se **APROVADO PARA DEPLOY EM PRODUÇÃO**.

---

*Relatório de Execução de Testes homologado pela Equipe de QA AlumiGest — Baseline B-ALG-v0.7.0-S07-01 — 26/10/2026*
