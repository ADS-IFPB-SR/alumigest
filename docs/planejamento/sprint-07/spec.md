# Feature Specification: Sprint 7 — Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina)

**Feature**: `004-lista-corte-ficha-montagem`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Na rotina da serralheria e vidraçaria da Alumiportas, após a geração das Ordens de Produção (Sprint 6), os cortadores e montadores necessitam de um documento operacional claro e sem ambiguidades para transformar os perfis de alumínio e chapas de vidro nos produtos finais.

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

### 📌 US-21: Consolidar Lista Linear e Plana de Corte do Pedido

> Agrupar e consolidar o plano de corte de perfis de alumínio e chapas de vidro de todas as peças de um pedido para minimizar o desperdício de matéria-prima.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-21.1**: Criar record `CuttingItemDTO` (codigoOP, numeroPeca, totalPecas, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens, status) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java`
- **US-21.2**: Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java`
- **US-21.3**: Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java`
- **US-21.4**: Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados das OPs e itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- **US-21.5**: Criar endpoint GET /api/production/orders/{orderId}/cutting-list no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java`
- **US-21.6**: Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java`
- **US-21.7**: Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx`
- **US-21.8**: Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`)

### 📌 US-22: Gerar Ficha Técnica de Montagem por Ordem de Produção

> Disponibilizar a ficha técnica de montagem passo a passo com esquemas de furação, gaxetas, roldanas e guarnições específicas para cada modelo de esquadria.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-22.1**: Implementar método `gerarFichaMontagem(Long productionOrderId)` no `CuttingListService`
- **US-22.2**: Adicionar endpoint GET /api/production/production-orders/{id}/assembly-sheet no `ProductionReportController`
- **US-22.3**: Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx`
- **US-22.4**: Integrar a visualização da Ficha Técnica na página de detalhes da OP (`ProductionOrderDetailPage.tsx`) e após leitura no scanner

### 📌 US-23: Emitir Romaneio de Oficina em PDF com Checklist de Conferência

> Emitir romaneio de expedição e conferência de oficina em PDF com caixas de checagem (checklists) para controle de saída de esquadrias e ferragens avulsas.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-23.1**: Criar serviço `WorkshopPdfService` gerando PDF A4 de romaneio de corte com colunas de checklist físico em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/WorkshopPdfService.java`
- **US-23.2**: Adicionar método para gerar PDF individual da Ficha Técnica da OP no `WorkshopPdfService`
- **US-23.3**: Adicionar endpoints GET /api/production/orders/{orderId}/cutting-list-pdf e GET /api/production/production-orders/{id}/assembly-sheet-pdf no `ProductionReportController`
- **US-23.4**: Criar teste unitário do `WorkshopPdfServiceTest` validando geração de bytes não-vazios
- **US-23.5**: Adicionar botões de download do PDF na interface do frontend
- **US-23.6**: Documentar endpoints no OpenAPI/Swagger
- **US-23.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 7

## 3. Requisitos Funcionais

1. **RF01 - Dupla Visualização Operacional**: Fornecer endpoint e tela para a Lista Consolidada de Corte do Pedido e para a Ficha Técnica Individual por OP.
2. **RF02 - Mapeamento Completo de Atributos**: Exibir em todas as visões os atributos essenciais: Medidas Nominais (LxA mm), Cor do Alumínio, Tipo de Vidro, Sentido de Abertura e Lista de Ferragens.
3. **RF03 - Sem Fórmulas de Otimização**: O sistema exibe os dados nominais contratados e descritivos cadastrados no item do pedido, sem dependência de fórmulas complexas de nesting.
4. **RF04 - PDF Estruturado para Prancheta**: Geração de PDF A4 com OpenPDF formatado com caixas de visto manual para chão de fábrica.
5. **RF05 - Integração com o Scanner**: A Ficha Técnica de Montagem de uma peça pode ser aberta diretamente após a leitura do QR Code da etiqueta (Sprint 6).

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Visões de Produção)**: Ambas as visões disponíveis (Lista Consolidada de Corte do Pedido inteiro + Ficha Técnica Individual por OP).
- **Q2 (Medidas e Cálculos)**: Exibição das medidas nominais contratadas (LxA mm) e especificações completas de materiais/cores/aberturas, sem fórmulas no template.
- **Q3 (Layout do PDF)**: PDF A4 estruturado com colunas de conferência física (`[ ] Cortado`, `[ ] Montado`) para visto manual dos operadores.