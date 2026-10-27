# 🧪 RET — Relatório de Execução de Testes — Sprint 07

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Período** | 13/10/2026 a 27/10/2026 (Consolidação em 25/10/2026) |
| **QA Responsável** | Equipe AlumiGest / QA Engineers |
| **Issue de Homologação** | [#514](https://github.com/ADS-IFPB-SR/alumigest/issues/514) (QA-05) |
| **Status Geral** | 🟢 **APROVADO (100% dos Cenários BDD, Integração e Suítes Cypress E2E)** |

---

## 1. 🎯 Escopo dos Testes da Sprint 07

A **Sprint 07** consolidou a **Release 2 (Gestão Fabril & Produção)** do AlumiGest, conectando o módulo de pedidos de venda (Sprint 06) à fábrica e oficina de esquadrias:

1. **Etiquetas Térmicas de Identificação de Peças (US-17 / Issue [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)):**
   - Emissão de etiquetas adesivas térmicas via OpenPDF (`LabelPdfService`) e formato nativo de comandos térmicos (`ThermalLabelBplbRenderer`).
   - Identificação padronizada: cabeçalho Alumiportas, O.S., cliente, medidas nominais (L x A mm), cor do alumínio, vidro e contagem de peças físicas fracionadas por folha.
   - Bloqueio com HTTP 422 para ordens canceladas (`CANCELLED`) (validação do [BUG-484]).
   - Modal de impressão (`ThermalLabelModal.tsx`) com seleção de padrão térmico e filtro de peças.
   - Suíte Cypress E2E com 4 cenários de aceitação (`frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts` — Issue [#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474)).

2. **Painel Kanban de Produção de Pedidos (US-18 / Issue [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)):**
   - Máquina de estados fabril com transições lineares estritas: `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED`.
   - Endpoint atômico `PATCH /api/orders/{id}/production-status` gravando `completion_date` com timezone de Brasília (`America/Sao_Paulo`).
   - Quadro visual Kanban com 3 colunas, drag-and-drop e botões rápidos de avanço.
   - Cálculo automático e reativo de urgência de prazos (SLA) nos cards (`OrderProductionCard.tsx`).
   - Barra superior de métricas fabris (`ProductionKanbanMetrics.tsx`).
   - Filtros instantâneos por cliente, código da O.S. e período de entrega na `ProductionKanbanPage.tsx`.
   - Suíte Cypress E2E cobrindo 7 cenários completos de esteira fabril (`frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts`).

---

## 2. 📋 Resultados dos Planos de Teste Executados

| Plano de Teste | Issue GitHub | Escopo | Status | Detalhes |
|---|:---:|---|:---:|---|
| **US-17.1 / US-17.2** | [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142) | Serviço OpenPDF de etiquetas e endpoint REST `labels-pdf` | 🟢 **APROVADO** | PRs #448, #449 mescladas |
| **US-17.3** | [#450](https://github.com/ADS-IFPB-SR/alumigest/issues/450) | Testes unitários de `LabelPdfService` (geração de bytes e paginação) | 🟢 **APROVADO** | Testes aprovados no CI |
| **US-17.4** | [#451](https://github.com/ADS-IFPB-SR/alumigest/issues/451) | Botão "Imprimir Etiquetas", modal térmico e fluxo de download | 🟢 **APROVADO** | PRs #451, #470 mescladas |
| **US-17.5** | [#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474) | Suíte E2E Cypress de etiquetas de identificação térmica | 🟢 **APROVADO** | 4 cenários aprovados |
| **US-18.1** | [#452](https://github.com/ADS-IFPB-SR/alumigest/issues/452) | Endpoint `PATCH` de status fabril e preenchimento de `completion_date` | 🟢 **APROVADO** | PRs #452, #472 mescladas |
| **US-18.2** | [#453](https://github.com/ADS-IFPB-SR/alumigest/issues/453) | Hook React Query `useProductionKanban` e serviços de API | 🟢 **APROVADO** | PRs #453, #488 mescladas |
| **US-18.3 / US-18.4** | [#454](https://github.com/ADS-IFPB-SR/alumigest/issues/454), [#455](https://github.com/ADS-IFPB-SR/alumigest/issues/455) | Componentes `OrderProductionCard` e `ProductionKanbanBoard` | 🟢 **APROVADO** | PRs #454, #455 mescladas |
| **US-18.5 / US-18.6** | [#456](https://github.com/ADS-IFPB-SR/alumigest/issues/456), [#457](https://github.com/ADS-IFPB-SR/alumigest/issues/457) | Página `ProductionKanbanPage`, filtros e rota de navegação | 🟢 **APROVADO** | PRs #456, #457 mescladas |
| **US-18.7** | [#458](https://github.com/ADS-IFPB-SR/alumigest/issues/458) | OpenAPI Swagger e testes unitários de transição fabril | 🟢 **APROVADO** | PR #481 mesclada |
| **QA-05** | [#514](https://github.com/ADS-IFPB-SR/alumigest/issues/514) | Homologação Integrada da Gestão Fabril (Etiquetas & Kanban) | 🟢 **APROVADO** | Homologação final concluída |

---

## 3. 🐛 Defeitos e BUGs Tratados In-Sprint

Durante a execução dos testes e validação da esteira da Sprint 07, foram tratados os seguintes apontamentos:

| BUG ID / Issue | Descrição Resumida | Severidade | Status | Resolução |
|:---:|:---|:---:|:---:|:---|
| **#484** | Ausência de validação no backend para bloqueio de emissão de etiquetas em ordens canceladas | 🔴 Alta | ✅ Corrigido | Validação no controller e service retornando HTTP 422 |
| **#485** | Falha de tratamento de erro no download de etiquetas térmicas em formato Blob | 🟡 Média | ✅ Corrigido | Parsing adequado de resposta de erro JSON encapsulada em Blob |
| **#487** | Botão "Baixar PDF" no `ThermalLabelModal` ignorava o filtro ativo de peças | 🟡 Média | ✅ Corrigido | Parâmetros de filtro propagados na chamada da API |
| **#492 / #493** | Ajustes de quebra de texto e largura nominal na impressão térmica | 🟡 Média | ✅ Corrigido | Redimensionamento das dimensões nominais no renderer BPLB/PDF |
| **#498** | Drag-and-drop de pedido na mesma coluna do Kanban disparava PUT desnecessário e gerava erro 422 | 🟡 Média | ✅ Corrigido | Verificação antecipada de igualdade de coluna de origem e destino |
| **#500** | Card de produção exibia quantidade de linhas de itens em vez do total de peças físicas | 🟡 Média | ✅ Corrigido | Soma correta do campo `quantidade` dos itens do pedido |
| **#501** | Badge de 'Atrasado' era renderizado para pedidos com status `COMPLETED` cujo prazo expirou | 🟡 Média | ✅ Corrigido | Condicional ajustada no `OrderProductionCard` para desconsiderar SLA após conclusão |
| **#524** | Duplicidade de item Kanban na barra lateral (Sidebar) apontando para rota legada `/kanban` | 🟢 Baixa | 🟡 Aberto (PO) | [Issue #524](https://github.com/ADS-IFPB-SR/alumigest/issues/524) registrada pelo PO José Guylherme em teste manual exploratório |
| **#525** | Painel Kanban sem rolagem vertical (scroll), ocultando ordens de serviço inferiores nas colunas | 🟡 Média | 🟡 Aberto (PO) | [Issue #525](https://github.com/ADS-IFPB-SR/alumigest/issues/525) registrada pelo PO José Guylherme em teste manual exploratório |

---

## 4. 📈 Conclusão e Parecer do QA

A esteira da **Sprint 07** atingiu todos os critérios do **Definition of Done (DoD)**:
- 100% dos cenários de teste unitários, de integração e E2E executados com sucesso.
- Comunicação consistente entre Frontend e Backend respeitando estritamente o princípio de responsabilidade única e isolamento de regras de negócio.
- O incremento da Release 2 encontra-se apto para homologação e deploy em ambiente de produção.
