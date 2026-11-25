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

#### US-21.2: Migração Flyway `V26` e Entidades JPA com Lock Pessimista [1 pt / 3.0h]
- **Issue**: [#572](https://github.com/ADS-IFPB-SR/alumigest/issues/572) | **PR**: [#596](https://github.com/ADS-IFPB-SR/alumigest/pull/596) *(integrado na `feat/us-21-reserva-baixa-estoque`)*
- [x] Criação do script Flyway `V26__create_stock_schema.sql` *(provisoriamente `V25__create_stock_schema.sql` na branch — ajustar para `V26` no merge com `release/v0.8.0`)* com tabelas `tb_stock_items` e `tb_stock_movements`.
- [x] Mapeamento das entidades JPA `StockItem` e `StockMovement` com campos em inglês técnico e auditoria imutável.
- [x] Repositório `StockItemRepository` com lock pessimista defensivo (`@Lock(LockModeType.PESSIMISTIC_WRITE)`).
- [x] Testes de repositório JPA e validação de schema PostgreSQL.

#### US-21.3: Motor de Reserva Automática Make-to-Order (`reserveMaterials`) [2 pts / 3.5h]
- **Issue**: [#573](https://github.com/ADS-IFPB-SR/alumigest/issues/573) | **PR**: [#602](https://github.com/ADS-IFPB-SR/alumigest/pull/602) *(integrado na `feat/us-21-reserva-baixa-estoque`)*
- [x] Implementação de `StockService.reserveMaterials(UUID orderId)` acionado no evento de aprovação/conversão de pedidos (`US-13`).
- [x] Cálculo da invariante: decrementa $available = physical - reserved$ e incrementa $reserved$.
- [x] **Regra Make-to-Order (RN-05)**: Nunca bloquear a aprovação caso $available < 0$; sinalizar necessidade de compras.
- [x] Testes unitários JUnit/AssertJ validando o comportamento com saldo suficiente e insuficiente.

#### US-21.4: Indicador Visual Make-to-Order no Card do Kanban Fabril [1 pt / 2.5h]
- **Issue**: [#574](https://github.com/ADS-IFPB-SR/alumigest/issues/574) | **Branch**: `feat/us-21.4-indicador-visual-make-to-order-574` *(em revisão / `PR #599`)*
- [ ] Conectar o card do Kanban (`OrderProductionCard.tsx`) ao endpoint `GET /api/v1/stock/orders/{orderId}/alert` e hook correspondente.
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

### 📦 US-22 — Consultar Posição de Estoque e Kardex (4 Sub-tarefas Verticais / 5 Story Points)

#### US-22.1: Visualização de Saldos e Badges de Estoque nas 4 Abas do Catálogo (Fullstack) [2 pts / 6.0h]
- **Issue**: [#587](https://github.com/ADS-IFPB-SR/alumigest/issues/587) | **PR**: [#601](https://github.com/ADS-IFPB-SR/alumigest/pull/601) *(integrado na `feat/us-22-posicao-estoque-kardex`)*
- [x] Atualização unificada das 4 abas do catálogo (`GlassTab.tsx`, `ProfileTab.tsx`, `HardwareTab.tsx`, `FilmTab.tsx`).
- [x] Adição das colunas Saldo Físico, Reservado e Disponível conforme protótipo `catalogo-materiais-estoque-kardex.html`.
- [x] Badges visuais inteligentes (`🔴 Falta X un/m` em vermelho quando $available < 0$ e `🟡 Ponto de Pedido` em âmbar) e checkbox de filtro rápido "Apenas com Necessidade de Compra" no topo.
- [x] Refinamento do endpoint `GET /api/v1/stock` com suporte a filtros (`needsPurchase`, `belowMinStock`) e ordenação.
- [x] Testes automatizados: MockMvc no backend e Vitest com React Testing Library nos temas claro e escuro.

#### US-22.2: Gaveta Lateral de Extrato Kardex (`KardexDrawer.tsx`) e Linha do Tempo (Fullstack) [1 pt / 4.5h]
- **Issue**: [#589](https://github.com/ADS-IFPB-SR/alumigest/issues/589) | **Branch**: `feat/us-22.2-gaveta-kardex-auditoria-589` *(em revisão/integração)*
- [ ] Componente `KardexDrawer.tsx` (gaveta lateral deslizante à direita / Sheet) conforme protótipo homologado.
- [ ] Cabeçalho com os 3 saldos consolidados e timeline interativa com ícones semânticos (`🟢 Entrada`, `🔵 Reserva`, `🟠 Baixa`, `⚪ Estorno`, `🔴 Perda`).
- [ ] Botão de ação "📜 Extrato Kardex" diretamente na linha de cada insumo e atalho de fechamento via teclado (Esc).
- [ ] Integração com o endpoint `GET /api/v1/stock/movements` (ordenado por `created_at DESC` e indexado com `JOIN FETCH`).
- [ ] Hook `useKardex` com TanStack Query e testes Vitest/MockMvc.

#### US-22.3: Modal de Entrada de Compras com Documento Livre e Auto-Provisionamento (Fullstack) [1 pt / 4.5h]
- **Issue**: [#590](https://github.com/ADS-IFPB-SR/alumigest/issues/590) *(Consolida escopo da #590 e fecha duplicata #595)*
- [ ] Modal visual de compras (`StockMovementModal.tsx` / `PurchaseEntryModal.tsx`) para registro de entradas `PURCHASE_ENTRY` incrementando saldos físico e disponível.
- [ ] **Regra de Documento Livre (RN-05)**: Campo `documentNumber` em texto livre sem obrigatoriedade de chave SEFAZ de 44 dígitos.
- [ ] **Regra de Custo Unitário (RN-06)**: Campo `unitCost` obrigatório para formação de custo patrimonial.
- [ ] Integração do fluxo "2 em 1" nos modais de criação de materiais (`CreateMaterialModal.tsx`) para lançamento opcional de lote inicial.
- [ ] Auto-provisionamento garantindo que todo material ativo possua registro em `tb_stock_items`.
- [ ] Testes MockMvc e testes Vitest do formulário com validação Zod.

#### US-22.4: Rota `/catalogo`, Menu Lateral e Guia Visual de Avisos no Kanban [1 pt / 3.5h]
- **Issue**: [#591](https://github.com/ADS-IFPB-SR/alumigest/issues/591)
- [ ] Rota `/catalogo` com menu lateral unificado "📦 Catálogo & Almoxarifado" (`DashboardLayout.tsx` e `Sidebar.tsx`).
- [ ] Guia visual superior no catálogo conforme homologado em `catalogo-materiais-estoque-kardex.html`.
- [ ] Faixa superior de avisos fabris no topo do Kanban alertando sobre insumos pendentes de compra.
- [ ] Testes automatizados de roteamento e renderização com Vitest.

#### US-22.5: Suíte de Testes E2E (Cypress) de Posição de Estoque, Extrato Kardex e Entrada de Compras [1 pt / 3.0h]
- **Issue**: [#609](https://github.com/ADS-IFPB-SR/alumigest/issues/609)
- [ ] Suíte Cypress `frontend/cypress/e2e/stock/us22_posicao_estoque_kardex.cy.ts` cobrindo o ciclo ponta a ponta do catálogo e estoque.
- [ ] Validação E2E da navegação entre as 4 abas e renderização correta de saldos e badges (`🟢 Insumos Disponíveis`, `🟡 Ponto de Pedido`, `🔴 Falta Insumo / Comprar`).
- [ ] Validação E2E de abertura, inspeção cronológica e fechamento da gaveta lateral Kardex (`KardexDrawer`).
- [ ] Validação E2E de registro de entrada de compras via `PurchaseEntryModal` com atualização reativa de saldos.
- [ ] Validação E2E do fluxo 2 em 1 no modal de cadastro com auto-provisionamento e lote inicial.
- [ ] Adição do script `"test:e2e:us22"` no `package.json` e integração à pipeline CI.

---

## 3. 📐 Padrões Arquiteturais e Diretrizes de Qualidade

1. **Modelo Make-to-Order da Serralheria**: Toda a esteira de pedidos, aprovação de O.S. e Venda Avulsa (US-46) é estritamente **não bloqueante**. Jamais lançar erro HTTP 422 em aprovações comerciais por falta de saldo físico.
2. **Invariante Fundamental de Saldos**: Em qualquer movimentação no sistema, a relação matemática $available = physical - reserved$ deve permanecer verdadeira.
3. **Imutabilidade e Append-Only do Kardex**: Registros na tabela `tb_stock_movements` são estritamente somente-leitura após criados. É expressamente proibido alterar ou excluir movimentações passadas.
4. **Fatiamento Atômico ($\le$ 3.5h)**: Tarefas pequenas, autônomas e com PRs focados, evitando conflitos de merge e facilitando o code review.
5. **Qualidade SonarQube & Coverage**: Manter cobertura de testes $\ge 80\%$, zero code smells críticos e complexidade cognitiva controlada ($\le 15$).

---

## 4. 🛡️ Definition of Done (DoD) da Sprint 09

- [ ] Todas as 12 sub-tarefas aprovadas com PRs revisados e mergeados em `develop`.
- [ ] Migrations Flyway `V26` executadas com sucesso sem regressão no banco de dados (ajustando `V25__create_stock_schema.sql` das branches para `V26` para não colidir com `V25__set_default_order_status_created.sql` da `release/v0.8.0`).
- [ ] Testes de backend (`mvn test`) com 100% de sucesso e cobertura $\ge 80\%$.
- [ ] Testes de frontend (`npm run test`) com 100% de sucesso no Vitest.
- [ ] Interface visual 100% fiel ao protótipo homologado `catalogo-materiais-estoque-kardex.html`.
- [ ] SonarQube Quality Gate verde no backend e frontend.
