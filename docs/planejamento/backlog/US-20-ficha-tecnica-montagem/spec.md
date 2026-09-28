# Especificação Funcional: US-20 — Gerar Ficha Técnica de Montagem por Item do Pedido

**Identificador**: `US-20`  
**Issue GitHub**: [#145](https://github.com/ADS-IFPB-SR/alumigest/issues/145)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Emitir ficha técnica operacional detalhando dimensões milimétricas, cores, vidros, ferragens e sentido de abertura para a bancada de montagem.

---

## 📋 Sub-Tarefas / Issues Vinculadas (4 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-20.1-implementar-metodo-gerarfichamontagem-long-or/issue.md) | Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService` | 🔲 No Backlog |
| [US](issues/US-20.2-adicionar-endpoint-get-api-order-i/issue.md) | Adicionar endpoint GET /api/production/production-orders/{id}/assembly-sheet no `ProductionReportController` | 🔲 No Backlog |
| [US](issues/US-20.3-criar-componente-assemblysheetview-no-fronten/issue.md) | Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx` | 🔲 No Backlog |
| [US](issues/US-20.4-integrar-a-visualizacao-da-ficha-tecnica-na-t/issue.md) | Integrar a visualização da Ficha Técnica na página de detalhes do Item (`OrderDetailPage.tsx`) e após leitura no scanner | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
