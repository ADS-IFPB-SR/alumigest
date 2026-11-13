# 📌 Sprint 09 — Reserva e Baixa Automática de Estoque & Posição Consolidada com Kardex

**Período Oficial da Sprint 09**: 10/11/2026 a 23/11/2026  
**Status**: 🟢 Em Andamento / Planejada  
**Product Owner (PO)**: José Guylherme dos Santos Melo  
**Scrum Master**: Júlio Kennedy dos Santos Silva  
**Equipe de Desenvolvimento**: Guilherme Kauã, Italo Jefferson, Joseph Nichollas, Júlio Kennedy, Herbert Carvalho, Gabriel de Souza (6 desenvolvedores)  
**Escopo Oficial Aprovado**: **US-21** e **US-22**  

Esta pasta contém o pacote de engenharia da **Sprint 09** do projeto **AlumiGest**, decomposto estritamente em **Fatias Atômicas (*Atomic Slices*) de até 3.5 horas** em conformidade com o [`guia-estimativa-horas.md`](../guia-estimativa-horas.md) e com o dimensionamento oficial de **13 Story Points** aprovado no [`estimativa-backlog-geral.md`](../estimativa-backlog-geral.md):
- **US-21**: Reservar e Baixar Matéria-Prima no Estoque Automaticamente (Issue [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146)) — **8 Story Points** (~24.0h).
- **US-22**: Consultar Posição de Estoque e Kardex de Movimentações (Issue [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147)) — **5 Story Points** (~18.5h).

---

## 🛡️ Padrões de Desacoplamento e Baixo Acoplamento (Zero Merge Conflicts)

Para permitir que os 6 desenvolvedores trabalhem simultaneamente em branches separadas sem bloquear uns aos outros e sem gerar conflitos de merge na esteira de integração contínua, a Sprint 09 adota 3 padrões arquiteturais obrigatórios:

### 1. Modelo Make-to-Order da Serralheria (Reserva Não Bloqueante)
Em conformidade com a realidade operacional da Alumiportas, onde as esquadrias são fabricadas sob encomenda:
- A aprovação de Ordem de Serviço (O.S.) ou emissão de Venda Avulsa (US-46) **JAMAIS é bloqueada por estoque insuficiente** (físico ou disponível).
- Se a quantidade necessária de barras de alumínio ou chapas exceder o estoque físico, a reserva é concluída normalmente, gerando saldo disponível negativo ($\text{available} < 0$) para sinalizar a necessidade líquida de compras.
- Invariante fundamental de saldos garantida em todas as operações:
  $$\text{available\_quantity} = \text{physical\_quantity} - \text{reserved\_quantity}$$
- *Resultado*: Operações comerciais e de fábrica fluem sem dependência de inventário prévio.

### 2. Lock Pessimista Defensivo Anti-Race Condition no Backend
Para blindar o recálculo simultâneo de saldos entre aprovações no balcão e conclusões na oficina:
- O repositório `StockItemRepository` implementa consultas anotadas com `@Lock(LockModeType.PESSIMISTIC_WRITE)`.
- Trava exclusiva de linha no PostgreSQL (`SELECT ... FOR UPDATE`), garantindo atomicidade transacional e rollback completo caso ocorra falha.
- Operações de leitura isoladas sem bloqueio para máxima performance do catálogo.

### 3. Frontend Unificado: Arquitetura Shell + Abas e Gaveta Kardex Deslizante
Apresentação visual fiel ao protótipo canônico homologado (`catalogo-materiais-estoque-kardex.html`):
- O catálogo de materiais unifica dados técnicos (preços, acabamentos, dimensões) e dados de almoxarifado (saldo físico, reservado e disponível) nas 4 abas (`Vidros`, `Perfis de Alumínio`, `Ferragens`, `Películas`).
- A inspeção histórica é delegada para o componente isolado `KardexDrawer.tsx` (gaveta lateral deslizante à direita), evitando poluição visual e mantendo o usuário na mesma página.
- Modais com fluxo "2 em 1" (`StockMovementModal.tsx` e `CreateMaterialModal.tsx`) para cadastro rápido e entrada de compras com documento livre (sem burocracia SEFAZ de 44 dígitos).

---

## 🗺️ Mapa de Histórias e Fatiamento Atômico (Sprint Backlog)

### 📦 US-21: Reservar e Baixar Matéria-Prima no Estoque Automaticamente
**Issue GitHub**: [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146) | **Prioridade**: P1 (Chave de Produção Fabril)  
**Branch Base**: `develop` | **Branch de Feature**: `feat/us-21-reserva-baixa-estoque`

| Sub-Task | Issue GitHub | Título da Tarefa Atômica | Estratégia de Desacoplamento & Escopo Delimitado | Story Points | Horas Estimadas |
|:---:|:---:|---|---|:---:|:---:|
| **US-21.1** | [#571](https://github.com/ADS-IFPB-SR/alumigest/issues/571) | **Setup & Estrutura Base do Módulo de Estoque** | Pacote `stock`, enums canônicos, records DTOs, types TS, client API e componente `StockAlertBadge.tsx`. | 1 pt | 2.5h |
| **US-21.2** | [#572](https://github.com/ADS-IFPB-SR/alumigest/issues/572) | **Migração Flyway `V21` e Entidades JPA com Lock Pessimista** | Script Flyway `V21__create_stock_schema.sql`, entidades `StockItem`/`StockMovement` e `StockItemRepository` com `@Lock(PESSIMISTIC_WRITE)`. | 1 pt | 3.0h |
| **US-21.3** | [#573](https://github.com/ADS-IFPB-SR/alumigest/issues/573) | **Motor de Reserva Automática Make-to-Order (`reserveMaterials`)** | Método `reserveMaterials(UUID orderId)` no `StockService` sem bloqueio por estoque físico (RN-05), acionado na aprovação da O.S. (`US-13`). | 2 pts | 3.5h |
| **US-21.4** | [#574](https://github.com/ADS-IFPB-SR/alumigest/issues/574) | **Indicador Visual Make-to-Order no Card do Kanban Fabril** | Conectar `OrderProductionCard.tsx` aos saldos para exibir badges `🔴 Falta Insumo / Comprar` ou `🟢 Insumos OK`. | 1 pt | 2.5h |
| **US-21.5** | [#575](https://github.com/ADS-IFPB-SR/alumigest/issues/575) | **Baixa Física Definitiva na Conclusão da Produção (`COMPLETED`)** | Método transacional `consumeReservedMaterials` decrementando físico e reserva simultaneamente ao arrastar card para `COMPLETED` no Kanban (`US-18`). | 1 pt | 3.0h |
| **US-21.6** | [#576](https://github.com/ADS-IFPB-SR/alumigest/issues/576) | **Estorno Automático de Reservas em Cancelamento de Pedidos** | Método transacional `cancelReservations` liberando insumos reservados caso a O.S. seja cancelada (`US-15`). | 1 pt | 2.5h |
| **US-21.7** | [#577](https://github.com/ADS-IFPB-SR/alumigest/issues/577) | **Endpoint de Movimentações Manuais & Modal de Perdas/Sucata** | Endpoint `POST /api/v1/stock/movements`, validação HTTP 422 para saldo físico negativo (RN-03) e modal `ScrapLossModal.tsx`. | 1 pt | 3.5h |
| **US-21.8** | [#578](https://github.com/ADS-IFPB-SR/alumigest/issues/578) | **Testes de Concorrência Multi-Thread, E2E e OpenAPI** | Teste de carga com 10 threads simultâneas (`StockConcurrencyTest`), fluxo E2E Orçamento ➔ Baixa e Swagger. | 1 pt | 3.5h |
| **Subtotal US-21** | — | — | **8 Tarefas Atômicas ($\le$ 3.5h cada)** | **8 pts** | **24.0h** |

---

### 📦 US-22: Consultar Posição de Estoque e Kardex de Movimentações
**Issue GitHub**: [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147) | **Prioridade**: P1 (Visibilidade & Gestão de Suprimentos)  
**Branch Base**: `develop` | **Branch de Feature**: `feat/us-22-posicao-estoque-kardex`

| Sub-Task | Issue GitHub | Título da Tarefa Atômica | Estratégia de Desacoplamento & Escopo Delimitado | Story Points | Horas Estimadas |
|:---:|:---:|---|---|:---:|:---:|
| **US-22.1** | [#586](https://github.com/ADS-IFPB-SR/alumigest/issues/586) | **Endpoint de Consulta de Saldos com Filtros de Compras** | Endpoint `GET /api/v1/stock` paginado com filtros `needsPurchase` ($available < 0$) e `belowMinStock`. | 1 pt | 3.0h |
| **US-22.2** | [#587](https://github.com/ADS-IFPB-SR/alumigest/issues/587) | **Colunas de Saldos e Badges nas 4 Abas do Catálogo** | Integrar colunas Físico/Reservado/Disponível em `GlassTab`, `ProfileTab`, `HardwareTab` e `FilmTab` (protótipo `catalogo-materiais-estoque-kardex.html`). | 1 pt | 3.5h |
| **US-22.3** | [#588](https://github.com/ADS-IFPB-SR/alumigest/issues/588) | **Endpoint e Repositório de Extrato Kardex com Auditoria** | Endpoint `GET /api/v1/stock/{id}/kardex` paginado decrescente e busca cronológica em `StockMovementRepository`. | 1 pt | 3.0h |
| **US-22.4** | [#589](https://github.com/ADS-IFPB-SR/alumigest/issues/589) | **Gaveta Lateral Deslizante de Extrato Kardex (`KardexDrawer.tsx`)** | Componente drawer deslizante com timeline interativa de movimentações, ícones semânticos e hook `useKardex`. | 1 pt | 3.5h |
| **US-22.5** | [#590](https://github.com/ADS-IFPB-SR/alumigest/issues/590) | **Modal de Entrada de Compras com Documento Livre & Fluxo "2 em 1"** | `StockMovementModal.tsx` com documento livre, preço de compra e opção de entrada no cadastro de materiais. | 1 pt | 3.5h |
| **US-22.6** | [#591](https://github.com/ADS-IFPB-SR/alumigest/issues/591) | **Rota `/catalogo`, Menu Lateral e Guia Visual de Avisos no Kanban** | Rota unificada no frontend, atalho na `Sidebar.tsx` e faixa superior de avisos fabris no Kanban de produção. | 1 pt | 2.5h |
| **Subtotal US-22** | — | — | **6 Tarefas Atômicas ($\le$ 3.5h cada)** | **5 pts** | **18.5h** |

---

### 📊 Resumo Executivo da Sprint 09

| Indicador | Total Planejado |
|---|:---:|
| **Histórias de Usuário Contempladas** | **2 Histórias** (US-21 e US-22) |
| **Total de Tarefas Atômicas** | **14 Tarefas ($\le$ 3.5h cada)** |
| **Total de Story Points** | **13 pts** (8 pts na US-21 + 5 pts na US-22) |
| **Total de Horas de Engenharia** | **42.5 horas** |
| **Carga Média por Desenvolvedor** | ~7.0 horas (2 a 3 tarefas leves por desenvolvedor) |

---

## 🔗 Documentos de Referência

- 📑 **Especificação Funcional Integrada da Sprint 09**: [spec.md](spec.md)
- 🖥️ **Protótipo Oficial Homologado da Sprint 09**: [`docs/planejamento/prototipos/catalogo-materiais-estoque-kardex.html`](../prototipos/catalogo-materiais-estoque-kardex.html)
- 📦 **Especificações Detalhadas do Backlog**:
  - [US-21 — Reservar e Baixar Matéria-Prima](../backlog/US-21-reserva-baixa-estoque/spec.md)
  - [US-22 — Consultar Posição de Estoque e Kardex](../backlog/US-22-posicao-estoque-kardex/spec.md)
- 🏛️ **Constituição e Padrões Arquiteturais do Projeto**: [`constitution.md`](../../constitution.md)
