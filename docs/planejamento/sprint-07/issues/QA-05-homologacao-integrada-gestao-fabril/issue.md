# [QA-05] Plano de Teste e Homologação Integrada da Gestão Fabril (Etiquetas Térmicas e Kanban de Produção — Sprint 07)

## 📌 Metadados da Tarefa

- **ID da Tarefa**: `QA-05`
- **Issue no GitHub**: [#514](https://github.com/ADS-IFPB-SR/alumigest/issues/514)
- **Histórias Cobertas**: [US-17 (#142)](https://github.com/ADS-IFPB-SR/alumigest/issues/142) e [US-18 (#143)](https://github.com/ADS-IFPB-SR/alumigest/issues/143)
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sprint**: Sprint 07
- **Sub-área**: `Qualidade de Software / Homologação Integrada / E2E`
- **Labels**: `task`, `qa`, `e2e`, `frontend`, `backend`, `pdf`

---

## 🎯 Objetivo & Descrição

Validar e homologar o fluxo operacional ponta a ponta da esteira fabril (Release 2), cobrindo a emissão de etiquetas adesivas térmicas de identificação de peças, máquina de estados fabril, quadro Kanban interativo com Drag-and-Drop, cálculo reativo de SLA/urgência de prazos, KPIs de fábrica e testes automatizados de backend, frontend e suíte Cypress E2E.

---

## 🧪 Cenários e Casos de Teste

### 1. Módulo de Etiquetas Térmicas de Identificação (US-17 / #142)

#### Backend (API REST, OpenPDF, BPLB/ZPL e Regras de Negócio)
- [x] `GET /api/orders/{orderId}/labels-pdf` — emissão com HTTP 200 e `Content-Type: application/pdf`.
- [x] `Content-Disposition: attachment; filename="etiquetas-pedido-{codigo}.pdf"`.
- [x] Resposta HTTP 404 Not Found para ordens inexistentes.
- [x] Bloqueio com HTTP 422 Unprocessable Entity para ordens canceladas (`CANCELLED`) (validação do [BUG-484]).
- [x] Layout térmico padronizado (100x60mm / 1000x600mm) com margens adequadas para impressoras térmicas (Zebra, Elgin, Argox).
- [x] Conteúdo completo da etiqueta: dados do cliente, O.S., medidas nominais (L x A mm), cor do alumínio, tipo de vidro e numeração sequencial por peça física/folha.
- [x] Renderizador direto para comandos térmicos BPLB (`ThermalLabelBplbRenderer`) e PDF (`ThermalLabelPdfRenderer`).

#### Frontend (OrderDetailPage e Modal de Etiquetas)
- [x] Botão "Imprimir Etiquetas" renderizado na tela de detalhes do pedido (`OrderDetailPage.tsx`).
- [x] Abertura do modal de impressão térmica (`ThermalLabelModal.tsx`) com opções de formato (PDF, BPLB, ZPL).
- [x] Filtro ativo de peças respeitado no download do arquivo (correção do [BUG-487]).
- [x] Feedback visual de carregamento com spinner e botão desabilitado durante a geração do documento.
- [x] Notificação Toast de sucesso e tratamento amigável de erros da API.
- [x] Ocultação/bloqueio da ação em pedidos cancelados.

---

### 2. Módulo de Painel Kanban de Produção (US-18 / #143)

#### Backend (Máquina de Estados Fabril e Transições)
- [x] `PATCH /api/orders/{id}/production-status` — atualização atômica de estágio de fabricação.
- [x] Validação da máquina de estados: `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED`.
- [x] Preenchimento atômico do campo `completion_date` com timezone de Brasília (`America/Sao_Paulo`) ao atingir `COMPLETED`.
- [x] Bloqueio de saltos ilegais de etapas com HTTP 422 Unprocessable Entity.
- [x] Proteção contra alteração de ordens com status `CANCELLED`.
- [x] Idempotência e prevenção de erro 422 ao movimentar o card dentro da mesma coluna (correção do [BUG-498]).

#### Frontend (Navegação, Quadro Kanban e Indicadores de SLA)
- [x] Rota `/producao` acessível via atalho "Produção (Kanban)" no menu lateral (`Sidebar.tsx`).
- [x] Quadro Kanban estruturado em 3 colunas (`Aguardando Produção`, `Em Produção`, `Concluído`) com contadores atualizados.
- [x] Barra de KPIs superiores (`ProductionKanbanMetrics.tsx`): contagem em produção, área total ($m^2$), pedidos urgentes e taxa no prazo.
- [x] Cards de Produção (`OrderProductionCard.tsx`) com exibição do código da O.S., cliente, número real de peças físicas (correção do [BUG-500]) e botões contextuais de transição.
- [x] Badges visuais dinâmicos de prazo/SLA:
  - **Verde**: Prazo confortável ($> 3$ dias);
  - **Amarelo**: Prazo em atenção ($0$ a $3$ dias);
  - **Vermelho**: Prazo urgente ou vencido ($< 0$ dias).
  - Supressão de badge "Atrasado" para pedidos concluídos (correção do [BUG-501]).
- [x] Drag & Drop com feedback visual de arrasto e transição sem recarregar a tela.
- [x] Filtros instantâneos por cliente, código do pedido e período de entrega na `ProductionKanbanPage.tsx`.

---

### 3. Suítes Automatizadas End-to-End (Cypress)
- [x] `frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts` — 4 cenários E2E de etiquetas térmicas.
- [x] `frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts` — 7 cenários E2E do Kanban de produção.

---

## ✅ Definition of Done (DoD)
- [x] Testes unitários backend e frontend executados com sucesso ($\ge 80\%$ de cobertura).
- [x] Suítes Cypress E2E (US-17 e US-18) aprovadas com 100% de sucesso.
- [x] Defeitos in-sprint tratados e homologados (#484, #485, #487, #492, #493, #498, #500, #501).
- [x] Relatório de testes executado e documentado em `docs/projeto-001/003-teste/sprint-07/RET-Relatorio_Execucao_Testes_Sprint07.md`.
- [x] Homologação formal do time de QA.
