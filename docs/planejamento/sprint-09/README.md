# 📌 Sprint 09 — Reserva e Baixa Automática de Estoque & Posição Consolidada com Kardex

**Período Oficial da Sprint 09**: 10/11/2026 a 23/11/2026  
**Status**: 🟢 Em Andamento / Planejada  
**Product Owner (PO)**: José Guylherme dos Santos Melo  
**Scrum Master**: Júlio Kennedy dos Santos Silva  
**Equipe de Desenvolvimento**: Guilherme Kauã, Italo Jefferson, Joseph Nichollas, Júlio Kennedy, Herbert Carvalho, Gabriel de Souza (6 desenvolvedores)  
**Escopo Oficial Aprovado**: **US-21** e **US-22**  

Esta pasta contém o pacote de engenharia da **Sprint 09** do projeto **AlumiGest**, decomposto estritamente em **Fatias Verticais (*Thin Vertical Slices*)** funcionais e testáveis de ponta a ponta (Banco de Dados, Backend, Frontend e QA em cada sub-tarefa), blindadas com padrões de **baixo acoplamento** para eliminar bloqueios e conflitos de merge (*git merge conflicts*) entre desenvolvedores em paralelo:
- **US-21**: Reservar e Baixar Matéria-Prima no Estoque Automaticamente (Issue [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146)).
- **US-22**: Consultar Posição de Estoque e Kardex de Movimentações (Issue [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147)).

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

## 🗺️ Mapa de Histórias e Fatiamento Vertical (Sprint Backlog)

### 📦 US-21: Reservar e Baixar Matéria-Prima no Estoque Automaticamente
**Issue GitHub**: [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146) | **Prioridade**: P1 (Chave de Produção Fabril)  
**Branch Base**: `develop` | **Branch de Feature**: `feat/us-21-reserva-baixa-estoque`

| Sub-Task | Issue GitHub | Título da Fatia Vertical | Estratégia de Desacoplamento & Escopo Fullstack | Story Points | Horas Estimadas |
|:---:|:---:|---|---|:---:|:---:|
| **US-21.1** | [#571](https://github.com/ADS-IFPB-SR/alumigest/issues/571) | **Fundação de Dados & Reserva Automática Make-to-Order na Aprovação da O.S.** | Migration Flyway `V21`, entidades JPA `StockItem`/`StockMovement`, lock pessimista, método `reserveMaterials` e badge Make-to-Order no card do Kanban fabril (`OrderProductionCard.tsx`). | 4 pts | 14h |
| **US-21.2** | [#572](https://github.com/ADS-IFPB-SR/alumigest/issues/572) | **Baixa Física Definitiva na Conclusão da Produção & Estorno em Cancelamento** | Método `consumeReservedMaterials` (decremento simultâneo físico e reserva na coluna `COMPLETED`) e método `cancelReservations` no cancelamento de pedidos. | 3 pts | 10h |
| **US-21.3** | [#573](https://github.com/ADS-IFPB-SR/alumigest/issues/573) | **Movimentações Manuais de Almoxarifado, Ajustes de Inventário e Registro de Sucata/Perdas** | Endpoint `POST /api/v1/stock/movements`, bloqueio de saída manual sem saldo físico (RN-03 / HTTP 422), DTOs com Bean Validation e modal `ScrapLossModal.tsx`. | 3 pts | 12h |
| **US-21.4** | [#574](https://github.com/ADS-IFPB-SR/alumigest/issues/574) | **Blindagem de Concorrência Multi-Thread, Teste de Carga e Rastreabilidade End-to-End** | Teste de carga com 10 threads concorrentes (`StockConcurrencyTest`), jornada completa de integração Orçamento ➔ Baixa Física e OpenAPI Swagger. | 3 pts | 10h |
| **Subtotal US-21** | — | — | **4 Fatias Verticais Autônomas** | **13 pts** | **46h** |

---

### 📦 US-22: Consultar Posição de Estoque e Kardex de Movimentações
**Issue GitHub**: [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147) | **Prioridade**: P1 (Visibilidade & Gestão de Suprimentos)  
**Branch Base**: `develop` | **Branch de Feature**: `feat/us-22-posicao-estoque-kardex`

| Sub-Task | Issue GitHub | Título da Fatia Vertical | Estratégia de Desacoplamento & Escopo Fullstack | Story Points | Horas Estimadas |
|:---:|:---:|---|---|:---:|:---:|
| **US-22.1** | [#586](https://github.com/ADS-IFPB-SR/alumigest/issues/586) | **Catálogo Unificado com Posição de Estoque e Badges Make-to-Order nas 4 Abas** | Endpoint `GET /api/v1/stock`, DTO `StockItemResponseDTO`, atualização das 4 abas do catálogo com colunas Físico/Reservado/Disponível, badges de alerta e filtro de compra. | 4 pts | 14h |
| **US-22.2** | [#587](https://github.com/ADS-IFPB-SR/alumigest/issues/587) | **Gaveta Lateral de Extrato Kardex com Timeline Interativa e Auditoria** | Endpoint `GET /api/v1/stock/{id}/kardex` paginado decrescente, componente deslizante `KardexDrawer.tsx` com timeline, badges semânticos e hook `useKardex`. | 3 pts | 12h |
| **US-22.3** | [#588](https://github.com/ADS-IFPB-SR/alumigest/issues/588) | **Modal de Registro de Entrada de Compras com Documento Livre e Fluxo 2 em 1** | Endpoint de compras (RN-05 documento livre sem SEFAZ, RN-06 custo unitário), modal `StockMovementModal.tsx` e fluxo 2 em 1 nos modais de novo material. | 3 pts | 12h |
| **US-22.4** | [#589](https://github.com/ADS-IFPB-SR/alumigest/issues/589) | **Roteamento Unificado, Navegação 'Catálogo & Almoxarifado' e Alertas Fabris no Kanban** | Atualização do menu lateral (`DashboardLayout.tsx`), rota `/catalogo` com guia visual superior, e filtros de suprimentos na barra do Kanban (`KanbanFilterBar.tsx`). | 3 pts | 10h |
| **Subtotal US-22** | — | — | **4 Fatias Verticais Autônomas** | **13 pts** | **48h** |

---

### 📊 Resumo Executivo da Sprint 09

| Indicador | Total Planejado |
|---|:---:|
| **Histórias de Usuário Contempladas** | **2 Histórias** (US-21 e US-22) |
| **Total de Fatias Verticais (Fullstack)** | **8 Fatias Autônomas** |
| **Total de Story Points** | **26 pts** (13 pts por US) |
| **Total de Horas de Engenharia** | **94 horas** |
| **Capacidade Média por Desenvolvedor** | ~15 a 16 horas (6 desenvolvedores) |

---

## 🔗 Documentos de Referência

- 📑 **Especificação Funcional Integrada da Sprint 09**: [spec.md](spec.md)
- 🖥️ **Protótipo Oficial Homologado da Sprint 09**: [`docs/planejamento/prototipos/catalogo-materiais-estoque-kardex.html`](../prototipos/catalogo-materiais-estoque-kardex.html)
- 📦 **Especificações Detalhadas do Backlog**:
  - [US-21 — Reservar e Baixar Matéria-Prima](../backlog/US-21-reserva-baixa-estoque/spec.md)
  - [US-22 — Consultar Posição de Estoque e Kardex](../backlog/US-22-posicao-estoque-kardex/spec.md)
- 🏛️ **Constituição e Padrões Arquiteturais do Projeto**: [`constitution.md`](../../constitution.md)
