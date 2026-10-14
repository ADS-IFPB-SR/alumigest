# 📋 Lista de Tarefas (Tasks) — Sprint 07 — Gestão Fabril: Etiquetas de Identificação de Peças & Painel Kanban de Produção

> **Padrão**: User Stories sequenciais do AlumiGest com Sub-tarefas decimais (`US-XX.Y`).  
> **Arquitetura**: Fatias Verticais Finas (*Thin Vertical Slices* ponta a ponta: Banco/Backend + Frontend + Testes).  
> **Regra de Estimativa**: Cada implementação tem duração máxima de **≤ 4 horas**.  
> **Garantia de Qualidade**: Testes unitários em cada task, Definition of Done (DoD) com 7 critérios e cobertura de testes.  
> **Período da Sprint 07**: 13/10/2026 a 27/10/2026  
> **Total de Tarefas**: 11 fatias verticais (~27h estimadas / 10 Story Points).

---

## 📦 US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido
**Issue GitHub**: [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142) | **Prioridade**: P1 (MVP Fabril)

| ID | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| **US-17.1** | [US-17.1](issues/US-17.1-criar-servico-labelpdfservice-usando-openpdf/issue.md) Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça | ~3h | Backend Core / PDF | 🔲 Aberta |
| **US-17.2** | [US-17.2](issues/US-17.2-adicionar-endpoint-get-api-orders-orderid-labels-pdf/issue.md) Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no `OrderController` retornando documento `application/pdf` com cabeçalho de download | ~2h | Backend REST / API | 🔲 Aberta |
| **US-17.3** | [US-17.3](issues/US-17.3-criar-teste-unitario-do-labelpdfservice/issue.md) Criar bateria de testes unitários do `LabelPdfService` validando geração de bytes, contagem exata de páginas por peças físicas e tratamento de exceções | ~2h | Testes Unitários | 🔲 Aberta |
| **US-17.4** | [US-17.4](issues/US-17.4-adicionar-botao-imprimir-etiquetas-no-frontend/issue.md) Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) com estado de carregamento e download do blob | ~2h | Frontend UI / Ações | 🔲 Aberta |

---

## 📦 US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda
**Issue GitHub**: [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143) | **Prioridade**: P1 (Gestão Fabril)

| ID | Tarefa | Duração | Tipo | Status |
|---|---|:---:|---|:---:|
| **US-18.1** | [US-18.1](issues/US-18.1-implementar-endpoint-patch-api-orders-id-production-status/issue.md) Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com validação de transição fabril e preenchimento automático de `data_conclusao` | ~3h | Backend Core / Regras | 🔲 Aberta |
| **US-18.2** | [US-18.2](issues/US-18.2-criar-hook-react-query-useproductionkanban/issue.md) Criar hook React Query `useProductionKanban` e serviços Axios de produção (`productionApi.ts`) no frontend | ~2h | Frontend State / API | 🔲 Aberta |
| **US-18.3** | [US-18.3](issues/US-18.3-criar-componente-orderproductioncard-no-frontend/issue.md) Criar componente `OrderProductionCard` no frontend exibindo dados do pedido, cliente, indicador de prazo (urgência/SLA), contagem de peças e botões de avanço | ~3h | Frontend UI / Cards | 🔲 Aberta |
| **US-18.4** | [US-18.4](issues/US-18.4-criar-componente-productionkanbanboard-com-colunas-de-status/issue.md) Criar componente `ProductionKanbanBoard` com colunas de status fabril (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) e ações contextuais | ~3h | Frontend UI / Kanban | 🔲 Aberta |
| **US-18.5** | [US-18.5](issues/US-18.5-criar-pagina-productionkanbanpage-com-filtros-de-busca/issue.md) Criar página `ProductionKanbanPage` com filtros de busca por código, cliente, período de entrega e métricas resumidas por estágio | ~3h | Fatia Vertical Frontend | 🔲 Aberta |
| **US-18.6** | [US-18.6](issues/US-18.6-configurar-rota-producao-e-menu-lateral-no-frontend/issue.md) Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend (`Sidebar.tsx`) | ~1h | Frontend Routing / Nav | 🔲 Aberta |
| **US-18.7** | [US-18.7](issues/US-18.7-documentar-endpoints-no-openapi-swagger-e-testes-unitarios/issue.md) Documentar endpoints no OpenAPI/Swagger e implementar testes unitários e de integração no backend para transições de status fabril | ~3h | Testes & Docs | 🔲 Aberta |

---

## 📊 Resumo de Esforço da Sprint 07

- **Total de Horas Estimadas**: **~27 horas** (10 Story Points).
- **Duração Máxima por Tarefa**: Nenhuma tarefa ultrapassa **4 horas** (todas variam entre 1h e 3h).
- **Cobertura de Testes**:
  - Cada fatia vertical possui testes unitários dedicados escolhidos e implementados pelo desenvolvedor.
  - A tarefa **US-17.3** cobre o motor de geração de etiquetas OpenPDF.
  - A tarefa **US-18.7** cobre a máquina de estados e integração dos endpoints de produção com MockMvc.
- **Definition of Done (DoD)**: Padronizado com 7 critérios em todas as 11 issues.
