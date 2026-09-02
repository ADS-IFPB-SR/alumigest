# Feature Specification: Sprint 6 — Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code

**Feature**: `003-ordens-producao-qrcode`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Após a conversão de um orçamento em Pedido de Venda (`Order`), o AlumiGest inicia a gestão do chão de fábrica da Alumiportas. 

A fabricação de esquadrias de alumínio e vidros temperados exige controle rigoroso de cada peça individualmente desde o corte dos perfis até a montagem e expedição. Para eliminar papéis soltos e peças perdidas na oficina, esta sprint introduz:
1. **Geração de Ordens de Produção (OP) Individuais por Peça**: Cada esquadria física do pedido recebe seu próprio código sequencial (`OP-YYYY-NNNN-XX`) e ciclo de vida independente.
2. **Rastreamento de Etapas de Fabricação**: Controle de status em tempo real (`AGUARDANDO_CORTE`, `EM_CORTE`, `EM_MONTAGEM`, `CONTROLE_QUALIDADE`, `PRONTO_EXPEDICAO`, `EXPEDIDO`).
3. **Etiquetas com QR Code (100x50mm)**: Emissão de etiquetas adesivas térmicas contendo medidas nominais (L x A mm), cor do perfil, tipo de vidro, código do pedido e QR Code de alta densidade.
4. **Scanner Rápido de Chão de Fábrica (PWA)**: Leitura de QR Code via câmera do smartphone/tablet para transicionar o status da peça em 1 toque com seleção simplificada do operador.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-17: Gerar Ordens de Produção (OP) Individuais por Peça

> Gerar Ordens de Produção individuais para cada esquadria de um pedido de venda aprovado, permitindo o rastreamento isolado de fabricação.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-17.1**: Adicionar dependências `com.google.zxing:core:3.5.3` e `com.google.zxing:javase:3.5.3` no `backend/pom.xml`
- **US-17.2**: Adicionar dependência `html5-qrcode` no `frontend/package.json`
- **US-17.3**: Criar migration Flyway `backend/src/main/resources/db/migration/V10__create_production_orders_schema.sql` com tabelas `production_orders` e `production_order_histories`
- **US-17.4**: Criar enum `ProductionOrderStatus` (AGUARDANDO_CORTE, EM_CORTE, EM_MONTAGEM, CONTROLE_QUALIDADE, PRONTO_EXPEDICAO, EXPEDIDO) em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderStatus.java`
- **US-17.5**: Criar entidade JPA `ProductionOrder` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrder.java`
- **US-17.6**: Criar entidade JPA `ProductionOrderHistory` em `backend/src/main/java/br/edu/ifpb/alumigest/production/domain/ProductionOrderHistory.java`
- **US-17.7**: Criar repositório `ProductionOrderRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderRepository.java`
- **US-17.8**: Criar repositório `ProductionOrderHistoryRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/production/repository/ProductionOrderHistoryRepository.java`
- **US-17.9**: Criar serviço gerador de imagens QR Code `QrCodeGeneratorService` usando ZXing em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/QrCodeGeneratorService.java`
- **US-17.10**: Criar record `ProductionOrderResponse` com todos os dados da peça, cliente, status e datas em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderResponse.java`
- **US-17.11**: Criar record `ProductionOrderHistoryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderHistoryResponse.java`
- **US-17.12**: Criar mapper MapStruct `ProductionOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/production/mapper/ProductionOrderMapper.java`
- **US-17.13**: Implementar método `gerarOrdensDeProducao(Long orderId)` no `ProductionOrderService` decompondo cada item em $N$ OPs físicas e atualizando o status do Pedido para `EM_PRODUCAO` em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/ProductionOrderService.java`
- **US-17.14**: Implementar métodos `buscarPorCodigo(String codigo)` e `listar(Pageable, status, orderId, busca)` no `ProductionOrderService`
- **US-17.15**: Criar `ProductionOrderController` com endpoints POST /api/production-orders/generate-from-order/{orderId}, GET /api/production-orders/by-code/{codigo}, GET /api/production-orders em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionOrderController.java`
- **US-17.16**: Criar testes unitários do `ProductionOrderService` para decomposição de itens em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/ProductionOrderServiceTest.java`

### 📌 US-18: Emitir Etiquetas com QR Code para Identificação de Peças

> Emitir etiquetas adesivas térmicas (100x50mm) contendo QR Code exclusivo, medidas nominais, modelo da esquadria, cor do perfil e dados do pedido.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-18.1**: Criar serviço `LabelPdfService` usando OpenPDF com tamanho de página 100x50mm, embutindo imagem gerada pelo `QrCodeGeneratorService`, logo, código da OP, cliente, descrição e medidas em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- **US-18.2**: Adicionar endpoint GET /api/production-orders/order/{orderId}/labels-pdf no `ProductionOrderController` (retorna application/pdf)
- **US-18.3**: Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- **US-18.4**: Adicionar botão "Imprimir Etiquetas com QR Code" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`)

### 📌 US-19: Atualizar Status de Produção via Scanner de QR Code

> Permitir que operadores da fábrica leiam o QR Code na etiqueta via câmera do smartphone/tablet para registrar o avanço de etapas de fabricação (CORTE -> MONTAGEM -> VIDRO -> EMBALADO).

#### Sub-tarefas Técnicas (Sub-issues):
- **US-19.1**: Criar record `ProductionOrderTransitionRequest` (novoStatus, operadorNome, observacao) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/ProductionOrderTransitionRequest.java`
- **US-19.2**: Implementar método `transicionarStatus(Long id, ProductionOrderTransitionRequest request)` no `ProductionOrderService` registrando histórico e verificando conclusão geral do pedido
- **US-19.3**: Adicionar endpoint PATCH /api/production-orders/{id}/transition no `ProductionOrderController`
- **US-19.4**: Criar interfaces TypeScript e serviço de API Axios (`productionApi.ts`) em `frontend/src/features/production/services/productionApi.ts`
- **US-19.5**: Criar hooks React Query (`useProductionOrders.ts`) em `frontend/src/features/production/hooks/useProductionOrders.ts`
- **US-19.6**: Criar componente `QrScannerModal` com `html5-qrcode` para leitura via câmera traseira do dispositivo em `frontend/src/features/production/components/QrScannerModal.tsx`
- **US-19.7**: Criar página `ProductionScannerPage` para operação rápida de chão de fábrica com bipagem e seleção de operador em `frontend/src/pages/ProductionScannerPage.tsx`
- **US-19.8**: Criar página `ProductionOrderDetailPage` com ficha técnica completa da peça e histórico de etapas em `frontend/src/pages/ProductionOrderDetailPage.tsx`

### 📌 US-20: Acompanhar Produção via Painel Kanban de OPs

> Disponibilizar painel visual Kanban em tempo real para a diretoria e encarregado de fábrica monitorarem o fluxo de todas as OPs em fabricação.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-20.1**: Criar componente `ProductionStatusBadge` em `frontend/src/features/production/components/ProductionStatusBadge.tsx`
- **US-20.2**: Criar componente `ProductionOrderCard` em `frontend/src/features/production/components/ProductionOrderCard.tsx`
- **US-20.3**: Criar componente `ProductionKanbanBoard` com colunas (Aguardando Corte, Corte, Montagem, CQ, Pronto) em `frontend/src/features/production/components/ProductionKanbanBoard.tsx`
- **US-20.4**: Criar página `ProductionKanbanPage` com filtros de busca e botão de atalho para o Scanner em `frontend/src/pages/ProductionKanbanPage.tsx`
- **US-20.5**: Configurar rotas `/producao`, `/producao/scanner`, `/producao/op/:codigo` no React Router em `frontend/src/App.tsx`
- **US-20.6**: Documentar endpoints do `ProductionOrderController` com OpenAPI/Swagger
- **US-20.7**: Adicionar atalhos de "Chão de Fábrica" e "Scanner QR" no menu lateral do frontend
- **US-20.8**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 6

## 3. Requisitos Funcionais

1. **RF01 - Decomposição Individual de Peças**: Para cada `OrderItem` com `quantidade = N`, o sistema deve gerar $N$ registros em `ProductionOrder` com sufixo sequencial (`-01`, `-02`, etc.).
2. **RF02 - Rastreabilidade com Pedido**: Cada OP mantém chave estrangeira obrigatória para `OrderItem` e `Order`.
3. **RF03 - Máquina de Estados da OP**:
   - `AGUARDANDO_CORTE` → `EM_CORTE` → `EM_MONTAGEM` → `CONTROLE_QUALIDADE` → `PRONTO_EXPEDICAO` → `EXPEDIDO`.
4. **RF04 - Geração de QR Code**: Geração de imagem QR Code em alta resolução (ZXing no backend ou canvas no frontend) contendo link para o endpoint de detalhe da OP.
5. **RF05 - Impressão Térmica 100x50mm**: Layout de PDF de etiqueta em tamanho exato de 100x50mm para impressoras térmicas (Zebra/Argox/Elgin).
6. **RF06 - Scanner de Câmera no Frontend**: Componente de scanner contínuo usando HTML5 `getUserMedia` com feedback sonoro e visual ao bipar.
7. **RF07 - Sincronização Automática com o Pedido**: Quando todas as OPs de um pedido forem concluídas (`PRONTO_EXPEDICAO` ou `EXPEDIDO`), o status do pedido pai é atualizado automaticamente para `CONCLUIDO`.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Granularidade das OPs)**: 1 OP individual por peça física (`OP-2026-0001-01`, `OP-2026-0001-02`), permitindo rastreamento autônomo de cada esquadria.
- **Q2 (Formato da Etiqueta)**: Etiqueta térmica adesiva 100x50mm com QR Code de alta densidade + visualização em PDF.
- **Q3 (Identificação do Operador)**: Avanço rápido de 1 clique com seleção simples de operador em lista suspensa na tela do scanner.