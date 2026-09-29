# Especificação Funcional: US-19 — Consolidar Lista Linear e Plana de Corte do Pedido

**Identificador**: `US-19`  
**Issue GitHub**: [#144](https://github.com/ADS-IFPB-SR/alumigest/issues/144)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Consultar e imprimir a lista consolidada de corte (romaneio operacional) de todos os itens de um pedido de venda aprovado para a oficina.

---

## 📋 Sub-Tarefas / Issues Vinculadas (8 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-19.1-criar-record-cuttingitemdto-orderitemid-numer/issue.md) | Criar record `CuttingItemDTO` (codigoOP, numeroPeca, totalPecas, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens, status) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java` | 🔲 No Backlog |
| [US](issues/US-19.2-criar-record-cuttinglistresponse-orderid-orde/issue.md) | Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java` | 🔲 No Backlog |
| [US](issues/US-19.3-criar-record-assemblysheetresponse-em-backend/issue.md) | Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java` | 🔲 No Backlog |
| [US](issues/US-19.4-implementar-servico-cuttinglistservice-gerarr/issue.md) | Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java` | 🔲 No Backlog |
| [US](issues/US-19.5-criar-endpoint-get-api-production-orders-orde/issue.md) | Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java` | 🔲 No Backlog |
| [US](issues/US-19.6-criar-testes-unitarios-do-cuttinglistservice-/issue.md) | Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java` | 🔲 No Backlog |
| [US](issues/US-19.7-criar-modal-cuttinglistmodal-no-frontend-exib/issue.md) | Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx` | 🔲 No Backlog |
| [US](issues/US-19.8-adicionar-botao-lista-de-corte-na-tela-de-det/issue.md) | Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`) | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
