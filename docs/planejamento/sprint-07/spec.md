# Feature Specification: Sprint 7 — Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina)

**Feature**: `004-lista-corte-ficha-montagem`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Created**: 2026-08-27  
**Updated**: 2026-09-04  
**Status**: APPROVED (Ajustado para Pedidos e Itens)  

---

## 1. Visão Geral & Contexto de Negócio

Na rotina da serralheria e vidraçaria da Alumiportas, após a aprovação do pedido e emissão das etiquetas (Sprint 6), os cortadores e montadores necessitam de um documento operacional claro e sem ambiguidades para transformar os perfis de alumínio e chapas de vidro nos produtos finais.

> **Importante (Diretriz de Escopo)**: Conforme alinhamento do projeto, **não há cálculo automatizado com fórmulas matemáticas de desconto/nesting**. A funcionalidade é um **Romaneio de Oficina e Ficha Técnica de Montagem**, detalhando:
> - Medidas nominais das esquadrias (Largura x Altura em mm) e quantidades
> - Especificação do tipo de material (perfis de alumínio, chapas de vidro, ferragens e acessórios)
> - Cores e acabamentos dos perfis (branco, preto, bronze, fosco, etc.)
> - Especificação detalhada dos vidros (tipo, cor, espessura)
> - Lado e sentido de abertura (Direita, Esquerda, Correr, Maxim-ar, Basculante, Pivotante)
> - Relação de ferragens e componentes necessários por peça
> - Checklist físico para conferência de corte e montagem na oficina

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-19: Consolidar Lista Linear e Plana de Corte do Pedido

> Agrupar e consolidar o plano de corte de perfis de alumínio e chapas de vidro de todas as peças de um pedido para minimizar o desperdício de matéria-prima.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-19.1**: Criar record `CuttingItemDTO` (orderItemId, numeroItem, totalItens, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java`
- **US-19.2**: Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java`
- **US-19.3**: Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java`
- **US-19.4**: Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados congelados dos itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- **US-19.5**: Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java`
- **US-19.6**: Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java`
- **US-19.7**: Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx`
- **US-19.8**: Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`)

---

### 📌 US-20: Gerar Ficha Técnica de Montagem por Item do Pedido

> Disponibilizar a ficha técnica de montagem passo a passo com orientações, perfis, vidros e componentes de cada modelo de esquadria.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-20.1**: Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService`
- **US-20.2**: Adicionar endpoint GET /api/production/order-items/{id}/assembly-sheet no `ProductionReportController`
- **US-20.3**: Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx`
- **US-20.4**: Integrar a visualização da Ficha Técnica na página de detalhes do pedido (`OrderDetailPage.tsx`) e em modal de inspeção

---

## 3. Requisitos Funcionais

1. **RF01 - Dupla Visualização Operacional**: Fornecer endpoint e tela para a Lista Consolidada de Corte do Pedido e para a Ficha Técnica Individual por Item de Pedido.
2. **RF02 - Mapeamento Completo de Atributos**: Exibir em todas as visões os atributos essenciais: Medidas Nominais (LxA mm), Cor do Alumínio, Tipo de Vidro, Sentido de Abertura e Lista de Ferragens.
3. **RF03 - Sem Fórmulas de Otimização**: O sistema exibe os dados nominais contratados e descritivos cadastrados no item do pedido, sem dependência de fórmulas complexas de nesting.
4. **RF04 - Acesso Direto**: A Ficha Técnica de Montagem é acessível a partir da tela de detalhes do pedido ou no modal da lista de corte.
