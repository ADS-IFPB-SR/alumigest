# Especificação Funcional: US-18 — Acompanhar Produção via Painel Kanban de Pedidos de Venda

**Identificador**: `US-18`  
**Issue GitHub**: [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Acompanhar o fluxo de produção fabril através de painel Kanban interativo organizado nas colunas AGUARDANDO_PRODUCAO, EM_PRODUCAO e CONCLUIDO.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-18.1-implementar-endpoint-patch-api-orders-id-production-status/issue.md) | Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com validação de transição e data de conclusão | 🔲 No Backlog |
| [US](issues/US-18.2-criar-hook-react-query-useproductionkanban/issue.md) | Criar hook React Query `useProductionKanban` e serviços Axios de produção no frontend | 🔲 No Backlog |
| [US](issues/US-18.3-criar-componente-orderproductioncard-no-frontend/issue.md) | Criar componente `OrderProductionCard` no frontend exibindo dados do pedido, cliente, alerta de prazo e total de peças | 🔲 No Backlog |
| [US](issues/US-18.4-criar-componente-productionkanbanboard-com-colunas-de-status/issue.md) | Criar componente `ProductionKanbanBoard` com colunas (`AGUARDANDO_PRODUCAO`EM_PRODUCAO`CONCLUIDO`) | 🔲 No Backlog |
| [US](issues/US-18.5-criar-pagina-productionkanbanpage-com-filtros-de-busca/issue.md) | Criar página `ProductionKanbanPage` com filtros de busca por cliente, período de entrega e código do pedido | 🔲 No Backlog |
| [US](issues/US-18.6-configurar-rota-producao-e-menu-lateral-no-frontend/issue.md) | Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend | 🔲 No Backlog |
| [US](issues/US-18.7-documentar-endpoints-no-openapi-swagger-e-testes-unitarios/issue.md) | Documentar endpoints no OpenAPI/Swagger e criar testes unitários para a transição de status no backend | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
