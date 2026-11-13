# 📑 Especificação Funcional Integrada — Sprint 09

**Período Oficial da Sprint 09**: 10/11/2026 a 23/11/2026  
**Histórias de Usuário Contempladas**:
- **US-21**: Reservar e Baixar Matéria-Prima no Estoque Automaticamente — Issue [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146) (8 Story Points / ~24.0h)
- **US-22**: Consultar Posição de Estoque e Kardex de Movimentações — Issue [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147) (5 Story Points / ~18.5h)

---

## 1. 🎯 Objetivos de Negócio

### 1.1 US-21: Reservar e Baixar Matéria-Prima no Estoque Automaticamente
Como encarregado de almoxarifado, gestor de compras ou líder de fábrica da Alumiportas, desejo que o sistema reserve automaticamente a matéria-prima (perfis, vidros, ferragens, películas) no momento da aprovação da Ordem de Serviço (`OS-YYYY-NNNN`) ou Venda Avulsa (`US-46`), apurando a **Necessidade de Compra** sem jamais bloquear a emissão de pedidos no balcão, e realize a baixa física definitiva quando a fabricação for concluída (`COMPLETED`), com estorno automático em caso de cancelamento da O.S., para manter a acurácia de saldos em tempo real e municiar a equipe de compras com a demanda exata a encomendar.

### 1.2 US-22: Consultar Posição de Estoque e Kardex de Movimentações
Como gestor financeiro, encarregado de compras ou operador de oficina da Alumiportas, desejo consultar em uma **tela unificada de Catálogo & Almoxarifado** a posição consolidada de estoque (saldos físico, reservado e disponível) com alertas inteligentes de ponto de pedido e falta de insumos, e inspecionar a trilha cronológica detalhada (Kardex) em uma gaveta lateral (*drawer*) de cada material, para apoiar auditorias de perdas, registro ágil de notas de compra e inventários periódicos.

---

## 2. 🧪 Fatiamento Atômico e Critérios de Aceitação

A Sprint 09 é estruturada em **Fatias Atômicas (*Atomic Slices*) de até 3.5 horas** em conformidade com o [`guia-estimativa-horas.md`](../guia-estimativa-horas.md). Cada sub-tarefa possui escopo bem delimitado, testabilidade independente e baixíssimo acoplamento.

---

### 📦 US-21 — Reservar e Baixar Matéria-Prima no Estoque (8 Sub-tarefas / 8 Story Points)

#### US-21.1: Setup & Estrutura Base do Módulo de Estoque (Backend & Frontend) [1 pt / 2.5h]
- **Issue**: [#571](https://github.com/ADS-IFPB-SR/alumigest/issues/571) | **PR**: [#592](https://github.com/ADS-IFPB-SR/alumigest/pull/592) (Joseph Cavalcante)
- [x] Pacote raiz `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock`.
- [x] Enums canônicos `StockMovementType` e `StockAlertStatus` em inglês técnico.
- [x] Records DTOs imutáveis (`StockItemResponseDTO`, `StockMovementRequestDTO`, `StockMovementResponseDTO`).
- [x] Interface desacoplada `StockPort` para contratos externos.
- [x] Tipagem TypeScript, cliente API `stockApi.ts`, hooks TanStack Query e componente visual `StockAlertBadge.tsx`.

#### US-21.2: Migração Flyway `V21` e Entidades JPA com Lock Pessimista [1 pt / 3.0h]
- **Issue**: [#572](https://github.com/ADS-IFPB-SR/alumigest/issues/572)
- [ ] Criação do script Flyway `V21__create_stock_schema.sql` com tabelas `tb_stock_items` e `tb_stock_movements`.
- [ ] Mapeamento das entidades JPA `StockItem` e `StockMovement` com campos em inglês técnico e auditoria imutável.
- [ ] Repositório `StockItemRepository` com lock pessimista defensivo (`@Lock(LockModeType.PESSIMISTIC_WRITE)`).
- [ ] Testes de repositório JPA e validação de schema PostgreSQL.

#### US-21.3: Motor de Reserva Automática Make-to-Order (`reserveMaterials`) [2 pts / 3.5h]
- **Issue**: [#573](https://github.com/ADS-IFPB-SR/alumigest/issues/573)
- [ ] Implementação de `StockService.reserveMaterials(UUID orderId)` acionado no evento de aprovação/conversão de pedidos (`US-13`).
- [ ] Cálculo da invariante: decrementa $available = physical - reserved$ e incrementa $reserved$.
- [ ] **Regra Make-to-Order (RN-05)**: Nunca bloquear a aprovação caso $available < 0$; sinalizar necessidade de compras.
- [ ] Testes unitários JUnit/AssertJ validando o comportamento com saldo suficiente e insuficiente.

#### US-21.4: Indicador Visual Make-to-Order no Card do Kanban Fabril [1 pt / 2.5h]
- **Issue**: [#574](https://github.com/ADS-IFPB-SR/alumigest/issues/574)
- [ ] Conectar o card do Kanban (`OrderProductionCard.tsx`) ao hook `useStockItem`/`useStockBalances`.
- [ ] Renderizar badge semântico: `🔴 Falta Insumo / Comprar` quando houver itens com saldo negativo ou `🟢 Insumos OK`.
- [ ] Testes de renderização com Vitest e React Testing Library simulando diferentes estados de estoque.

#### US-21.5: Baixa Física Definitiva na Conclusão da Produção (`COMPLETED`) [1 pt / 3.0h]
- **Issue**: [#575](https://github.com/ADS-IFPB-SR/alumigest/issues/575)
- [ ] Implementação de `StockService.consumeReservedMaterials(UUID orderId)` disparado quando a O.S. move para `COMPLETED` no Kanban (`US-18`).
- [ ] Decremento simultâneo de `physical_quantity` e `reserved_quantity`, mantendo `available_quantity` inalterado ($\Delta physical - \Delta reserved = 0$).
- [ ] Gravação de movimentação do tipo `PRODUCTION_OUTFLOW` em `tb_stock_movements`.
- [ ] Teste unitário e de integração do ciclo de consumo com rollback transacional em caso de falha.

#### US-21.6: Estorno Automático de Reservas em Cancelamento de Pedidos [1 pt / 2.5h]
- **Issue**: [#576](https://github.com/ADS-IFPB-SR/alumigest/issues/576)
- [ ] Implementação de `StockService.cancelReservations(UUID orderId)` acionado no cancelamento de pedidos (`US-15`).
- [ ] Zera reservas daquela ordem, estorna disponibilidade e grava histórico com tipo `RESERVATION_CANCELLATION`.
- [ ] Conexão com o modal de cancelamento de pedidos e toasts de confirmação.
- [ ] Testes unitários de estorno garantindo recomposição do saldo disponível.

#### US-21.7: Endpoint de Movimentações Manuais & Modal de Perdas/Sucata [1 pt / 3.5h]
- **Issue**: [#577](https://github.com/ADS-IFPB-SR/alumigest/issues/577)
- [ ] Endpoint `POST /api/v1/stock/movements` para acertos de inventário (`MANUAL_ADJUSTMENT`) e sucatas (`SCRAP_LOSS`).
- [ ] **Bloqueio de Saldo Negativo (RN-03)**: Saídas manuais sem estoque físico (`physical_quantity < 0`) lançam `BusinessException` (HTTP 422).
- [ ] Modal visual `ScrapLossModal.tsx` no frontend para seleção de material, quantidade e justificativa.
- [ ] Testes MockMvc validando a rejeição HTTP 422 e testes Vitest do formulário.

#### US-21.8: Blindagem de Concorrência Multi-Thread, Teste E2E e OpenAPI [1 pt / 3.5h]
- **Issue**: [#578](https://github.com/ADS-IFPB-SR/alumigest/issues/578)
- [ ] Suíte de concorrência com 10 threads simultâneas (`StockConcurrencyTest`) via `CountDownLatch` simulando reservas em paralelo.
- [ ] Teste E2E MockMvc: Orçamento aprovado ➔ Reserva ➔ Fabricação ➔ Baixa física ➔ Asserção final de saldos.
- [ ] Documentação OpenAPI Swagger em `/swagger-ui.html`.

---

### 📦 US-22 — Consultar Posição de Estoque e Kardex (6 Sub-tarefas / 5 Story Points)

#### US-22.1: Endpoint de Consulta de Saldos com Filtros de Compras [1 pt / 3.0h]
- **Issue**: [#586](https://github.com/ADS-IFPB-SR/alumigest/issues/586)
- [ ] Endpoint `GET /api/v1/stock` com suporte a paginação, busca textual e filtros (`category`, `needsPurchase`, `belowMinStock`).
- [ ] Flags calculadas no DTO: `needsPurchase` ($available < 0$) e `belowMinStock` ($available \le minStock$).
- [ ] Testes MockMvc cobrindo cenários com e sem filtros aplicados.

#### US-22.2: Colunas de Saldos e Badges nas 4 Abas do Catálogo [1 pt / 3.5h]
- **Issue**: [#587](https://github.com/ADS-IFPB-SR/alumigest/issues/587)
- [ ] Atualização unificada das 4 abas do catálogo (`GlassTab.tsx`, `ProfileTab.tsx`, `HardwareTab.tsx`, `FilmTab.tsx`).
- [ ] Adição das colunas Saldo Físico, Reservado e Disponível conforme protótipo `catalogo-materiais-estoque-kardex.html`.
- [ ] Badges visuais inteligentes (`🔴 Falta X un/m` e `🟡 Ponto de Pedido`) e checkbox de filtro rápido no topo.
- [ ] Testes Vitest de renderização das tabelas no tema claro e escuro.

#### US-22.3: Endpoint e Repositório de Extrato Kardex com Auditoria [1 pt / 3.0h]
- **Issue**: [#588](https://github.com/ADS-IFPB-SR/alumigest/issues/588)
- [ ] Endpoint `GET /api/v1/stock/{materialId}/kardex` paginado decrescente por data/hora (`created_at DESC`).
- [ ] Consulta otimizada em `StockMovementRepository` trazendo histórico imutável com tipo, usuário e documento de referência.
- [ ] Testes de integração validando a integridade cronológica do extrato.

#### US-22.4: Gaveta Lateral Deslizante de Extrato Kardex (`KardexDrawer.tsx`) [1 pt / 3.5h]
- **Issue**: [#589](https://github.com/ADS-IFPB-SR/alumigest/issues/589)
- [ ] Componente `KardexDrawer.tsx` (gaveta lateral deslizante à direita / Sheet) conforme protótipo homologado.
- [ ] Cabeçalho com os 3 saldos consolidados e timeline interativa com ícones semânticos (`🟢 Entrada`, `🔵 Reserva`, `🟠 Baixa`, `⚪ Estorno`, `🔴 Perda`).
- [ ] Botão de ação "📜 Ver Kardex" na tabela principal e atalho de fechamento via teclado (Esc).
- [ ] Hook `useKardex` com TanStack Query e testes Vitest.

#### US-22.5: Modal de Entrada de Compras com Documento Livre & Fluxo "2 em 1" [1 pt / 3.5h]
- **Issue**: [#590](https://github.com/ADS-IFPB-SR/alumigest/issues/590)
- [ ] Modal `StockMovementModal.tsx` com tipo `PURCHASE_ENTRY` incrementando saldos físico e disponível.
- [ ] **Regra de Documento Livre (RN-05)**: Campo `documentNumber` em texto livre sem obrigatoriedade de chave SEFAZ de 44 dígitos.
- [ ] **Regra de Custo Unitário (RN-06)**: Campo `unitCost` para registro patrimonial do custo real de compra.
- [ ] Integração do fluxo "2 em 1" nos modais de criação de materiais (`CreateMaterialModal`).
- [ ] Testes MockMvc e testes Vitest do formulário com validação Zod.

#### US-22.6: Rota `/catalogo`, Menu Lateral e Guia Visual de Avisos no Kanban [1 pt / 2.5h]
- **Issue**: [#591](https://github.com/ADS-IFPB-SR/alumigest/issues/591)
- [ ] Rota `/catalogo` com menu lateral unificado "📦 Catálogo & Almoxarifado" (`DashboardLayout.tsx` e `Sidebar.tsx`).
- [ ] Guia visual superior no catálogo conforme homologado em `catalogo-materiais-estoque-kardex.html`.
- [ ] Faixa superior de avisos fabris no topo do Kanban alertando sobre insumos pendentes de compra.
- [ ] Testes automatizados de roteamento e renderização com Vitest.

---

## 3. 📐 Padrões Arquiteturais e Diretrizes de Qualidade

1. **Modelo Make-to-Order da Serralheria**: Toda a esteira de pedidos, aprovação de O.S. e Venda Avulsa (US-46) é estritamente **não bloqueante**. Jamais lançar erro HTTP 422 em aprovações comerciais por falta de saldo físico.
2. **Invariante Fundamental de Saldos**: Em qualquer movimentação no sistema, a relação matemática $available = physical - reserved$ deve permanecer verdadeira.
3. **Imutabilidade e Append-Only do Kardex**: Registros na tabela `tb_stock_movements` são estritamente somente-leitura após criados. É expressamente proibido alterar ou excluir movimentações passadas.
4. **Fatiamento Atômico ($\le$ 3.5h)**: Tarefas pequenas, autônomas e com PRs focados, evitando conflitos de merge e facilitando o code review.
5. **Qualidade SonarQube & Coverage**: Manter cobertura de testes $\ge 80\%$, zero code smells críticos e complexidade cognitiva controlada ($\le 15$).

---

## 4. 🛡️ Definition of Done (DoD) da Sprint 09

- [ ] Todas as 14 sub-tarefas aprovadas com PRs revisados e mergeados em `develop`.
- [ ] Migrations Flyway `V21` executadas com sucesso sem regressão no banco de dados.
- [ ] Testes de backend (`mvn test`) com 100% de sucesso e cobertura $\ge 80\%$.
- [ ] Testes de frontend (`npm run test`) com 100% de sucesso no Vitest.
- [ ] Interface visual 100% fiel ao protótipo homologado `catalogo-materiais-estoque-kardex.html`.
- [ ] SonarQube Quality Gate verde no backend e frontend.
