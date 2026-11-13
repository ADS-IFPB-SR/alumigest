# 📑 Especificação Funcional Integrada — Sprint 09

**Período Oficial da Sprint 09**: 10/11/2026 a 23/11/2026  
**Histórias de Usuário Contempladas**:
- **US-21**: Reservar e Baixar Matéria-Prima no Estoque Automaticamente — Issue [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146)
- **US-22**: Consultar Posição de Estoque e Kardex de Movimentações — Issue [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147)

---

## 1. 🎯 Objetivos de Negócio

### 1.1 US-21: Reservar e Baixar Matéria-Prima no Estoque Automaticamente
Como encarregado de almoxarifado, gestor de compras ou líder de fábrica da Alumiportas, desejo que o sistema reserve automaticamente a matéria-prima (perfis, vidros, ferragens, películas) no momento da aprovação da Ordem de Serviço (`OS-YYYY-NNNN`) ou Venda Avulsa (`US-46`), apurando a **Necessidade de Compra** sem jamais bloquear a emissão de pedidos no balcão, e realize a baixa física definitiva quando a fabricação for concluída (`COMPLETED`), com estorno automático em caso de cancelamento da O.S., para manter a acurácia de saldos em tempo real e municiar a equipe de compras com a demanda exata a encomendar.

### 1.2 US-22: Consultar Posição de Estoque e Kardex de Movimentações
Como gestor financeiro, encarregado de compras ou operador de oficina da Alumiportas, desejo consultar em uma **tela unificada de Catálogo & Almoxarifado** a posição consolidada de estoque (saldos físico, reservado e disponível) com alertas inteligentes de ponto de pedido e falta de insumos, e inspecionar a trilha cronológica detalhada (Kardex) em uma gaveta lateral (*drawer*) de cada material, para apoiar auditorias de perdas, registro ágil de notas de compra e inventários periódicos.

---

## 2. 🧪 Fatiamento Vertical e Critérios de Aceitação

A Sprint 09 é estruturada estritamente em **Fatias Verticais (*Thin Vertical Slices*)**, onde cada sub-tarefa corta todas as camadas técnicas (Banco de Dados + Backend + Frontend + Testes automatizados), entregando um incremento de negócio funcional, autônomo e demonstrável.

### 📦 US-21 — Reservar e Baixar Matéria-Prima no Estoque (Fatiamento por Capacidade Funcional)

#### US-21.1: Fundação de Dados & Reserva Automática Make-to-Order na Aprovação da O.S. (Fullstack)
- [ ] Criação da modelagem Flyway `V21__create_stock_schema.sql` com tabelas `tb_stock_items` e `tb_stock_movements`.
- [ ] Entidades JPA `StockItem` e `StockMovement`, enum canônico `StockMovementType` em inglês técnico e repositório `StockItemRepository` com lock pessimista (`@Lock(LockModeType.PESSIMISTIC_WRITE)`).
- [ ] Implementação de `StockService.reserveMaterials(UUID orderId)`: busca materiais da ordem, aloca reservas e recalcula disponibilidade ($available = physical - reserved$).
- [ ] **Regra Make-to-Order (RN-05)**: Nunca bloquear a aprovação da ordem por falta de estoque físico; se $available < 0$, a transação conclui normalmente e sinaliza necessidade líquida de compras.
- [ ] Integração do badge no card do Kanban de produção (`OrderProductionCard.tsx`): tag `🔴 Falta Insumo / Comprar` quando houver insumos com saldo negativo, ou `🟢 Insumos Disponíveis`.
- [ ] Testes unitários JUnit/AssertJ validando o cálculo de disponibilidade e testes Vitest de renderização do badge no Kanban.

#### US-21.2: Baixa Física Definitiva na Conclusão da Produção & Estorno em Cancelamento (Fullstack)
- [ ] Implementação transacional de `StockService.consumeReservedMaterials(UUID orderId)` acionado quando a O.S. avança para `COMPLETED` no Kanban (`US-18`): decrementa simultaneamente `physical_quantity` e `reserved_quantity`, mantendo `available_quantity` inalterado ($\Delta physical - \Delta reserved = 0$), e grava `tb_stock_movements` com tipo `PRODUCTION_OUTFLOW`.
- [ ] Implementação transacional de `StockService.cancelReservations(UUID orderId)` acionado no cancelamento de pedidos (`US-15`): zera as reservas daquela ordem, estorna insumos para o saldo disponível e grava histórico com tipo `RESERVATION_CANCELLATION`.
- [ ] Integração do drag-and-drop para a coluna `COMPLETED` no Kanban e do botão de cancelamento de pedido, com toasts de confirmação e revalidação reativa de cache no TanStack Query.
- [ ] Testes automatizados cobrindo o ciclo de vida completo: Ordem aprovada ➔ Baixa na entrega fabril e Ordem aprovada ➔ Estorno em cancelamento.

#### US-21.3: Movimentações Manuais de Almoxarifado, Ajustes de Inventário e Registro de Sucata/Perdas (Fullstack)
- [ ] Criação de DTOs imutáveis `StockMovementRequestDTO` e `StockMovementResponseDTO` com Bean Validation (`@NotNull`, `@Positive`).
- [ ] Método `StockService.registerManualMovement(...)` e endpoint `POST /api/v1/stock/movements` para registrar acertos de contagem física (`MANUAL_ADJUSTMENT`) e quebras/perdas operacionais de oficina (`SCRAP_LOSS`).
- [ ] **Regra de Bloqueio de Saldo Físico Negativo (RN-03)**: Em saídas manuais extraordinárias sem lastro de saldo físico (`physical_quantity < 0`), a operação é bloqueada lançando `BusinessException` (HTTP 422).
- [ ] Modal visual `ScrapLossModal.tsx` no frontend para seleção rápida de insumo, quantidade descartada e justificativa da perda.
- [ ] Testes MockMvc validando a rejeição HTTP 422 e testes Vitest do formulário.

#### US-21.4: Blindagem de Concorrência Multi-Thread, Teste de Carga e Rastreabilidade End-to-End (Fullstack / QA)
- [ ] Suíte de testes de concorrência com 10 threads simultâneas (`StockConcurrencyTest`) via `CountDownLatch` e `ExecutorService`, simulando alocações de pedidos pesados sem *race conditions* ou *deadlocks*.
- [ ] Teste de integração de ponta a ponta (E2E / MockMvc): Orçamento aprovado ➔ Reserva criada ➔ Produção ➔ Baixa física executada ➔ Verificação das invariantes de saldo em cada etapa.
- [ ] Validação de imutabilidade (*append-only*) na tabela `tb_stock_movements`.
- [ ] Documentação completa OpenAPI / Swagger dos contratos da API de estoque em `/swagger-ui.html`.

---

### 📦 US-22 — Consultar Posição de Estoque e Kardex (Fatiamento por Capacidade Funcional)

#### US-22.1: Catálogo Unificado com Posição de Estoque e Badges Make-to-Order nas 4 Abas (Fullstack)
- [ ] Endpoint `GET /api/v1/stock` com suporte a paginação, busca textual e filtros (`category`, `needsPurchase`, `belowMinStock`).
- [ ] DTO `StockItemResponseDTO` com flags de negócio calculadas `needsPurchase` ($available < 0$) e `belowMinStock` ($available \le minStock$).
- [ ] Atualização unificada das 4 abas do catálogo (`GlassTab.tsx`, `ProfileTab.tsx`, `HardwareTab.tsx`, `FilmTab.tsx`) integrando colunas de Saldo Físico, Reservado e Disponível, conforme protótipo `catalogo-materiais-estoque-kardex.html`.
- [ ] Badges visuais inteligentes: `🔴 Necessidade de Compra (Falta X un/m)` em vermelho vivo para saldo negativo, e `🟡 Ponto de Pedido` em âmbar.
- [ ] Filtro rápido no topo da listagem: checkbox "Apenas com Necessidade de Compra".
- [ ] Testes MockMvc da API de consulta e testes Vitest de renderização das abas no tema claro e escuro.

#### US-22.2: Gaveta Lateral de Extrato Kardex com Timeline Interativa e Auditoria (Fullstack)
- [ ] Endpoint `GET /api/v1/stock/{materialId}/kardex` paginado e indexado cronologicamente (`created_at DESC`), devolvendo DTO `StockMovementResponseDTO`.
- [ ] Componente `KardexDrawer.tsx` (gaveta deslizante à direita da tela / Sheet) conforme protótipo oficial, exibindo cabeçalho do insumo com os 3 saldos atuais e timeline completa com badges semânticos (`🟢 Entrada`, `🔵 Reserva O.S.`, `🟠 Baixa Produção`, `⚪ Estorno`, `🔴 Perda`).
- [ ] Botão de ação "📜 Ver Kardex" diretamente na linha de cada material da tabela principal.
- [ ] Hook reativo `useKardex(materialId)` com TanStack Query e testes Vitest de abertura, navegação e fechamento via teclado (Esc).

#### US-22.3: Modal de Registro de Entrada de Compras com Documento Livre e Fluxo 2 em 1 (Fullstack)
- [ ] Endpoint de compras `POST /api/v1/stock/movements` (tipo `PURCHASE_ENTRY`) incrementando saldo físico e disponível.
- [ ] **Regra de Documento Livre (RN-05)**: O campo `documentNumber` aceita texto livre (número de recibo, pedido de distribuidor, nota fiscal em papel) sem exigência de chave de acesso de 44 dígitos da SEFAZ.
- [ ] **Regra de Custo de Compra (RN-06)**: O campo `unitCost` registra estritamente o valor de aquisição pago ao fornecedor (base patrimonial para o PMP e lucro real da obra).
- [ ] Componente `StockMovementModal.tsx` para entrada rápida em materiais existentes.
- [ ] Aprimoramento dos 4 modais de criação de material (`CreateMaterialModal`) incorporando o fluxo "2 em 1" (cadastro técnico + lote inicial de estoque no mesmo ato).
- [ ] Testes MockMvc de cálculo de novos saldos e testes Vitest do formulário com validação Zod.

#### US-22.4: Roteamento Unificado, Navegação 'Catálogo & Almoxarifado' e Alertas Fabris no Kanban (Fullstack / UI)
- [ ] Ajuste no menu lateral (`DashboardLayout.tsx`) consolidando a navegação para "📦 Catálogo & Estoque" na rota `/catalogo`.
- [ ] Banner com guia visual superior explicativo no topo da tela de catálogo, conforme protótipo homologado.
- [ ] Conexão de filtros rápidos na `KanbanFilterBar.tsx` do painel de produção, permitindo isolar ordens prontas para serralheria de ordens aguardando compra de insumos.
- [ ] Testes automatizados de roteamento e renderização com Vitest e React Testing Library.

---

## 3. 📐 Padrões Arquiteturais e Diretrizes de Baixo Acoplamento

1. **Modelo Make-to-Order da Serralheria**: Toda a esteira de pedidos, aprovação de O.S. e Venda Avulsa (US-46) é estritamente **não bloqueante**. Jamais lançar erro HTTP 422 em aprovações comerciais por falta de saldo físico.
2. **Invariante Fundamental de Saldos**: Em qualquer movimentação no sistema, a relação matemática $available = physical - reserved$ deve permanecer verdadeira.
3. **Imutabilidade e Append-Only do Kardex**: Registros na tabela `tb_stock_movements` são estritamente somente-leitura após criados. É expressamente proibido alterar ou excluir movimentações passadas.
4. **Desacoplamento por Fatia Vertical**: Cada uma das 8 tarefas da sprint entrega seu próprio conjunto de migrations, entidades, controladores, componentes de UI e suíte de testes, prevenindo qualquer bloqueio em cascata entre desenvolvedores.
5. **Qualidade SonarQube & Coverage**: Manter cobertura de testes $\ge 80\%$, zero code smells críticos e complexidade cognitiva controlada ($\le 15$).

---

## 4. 🛡️ Definition of Done (DoD) da Sprint 09

- [ ] Todas as 8 fatias verticais aprovadas com PRs revisados e mergeados em `develop`.
- [ ] Migrations Flyway executadas sem falhas na inicialização da aplicação.
- [ ] Suíte de testes unitários e de integração (`mvn clean test`) com 100% de sucesso.
- [ ] Testes de concorrência com 10 threads aprovados sem race conditions.
- [ ] Testes de frontend (`npm run test`) com 100% de sucesso no Vitest.
- [ ] Interface visual 100% fiel ao protótipo homologado `catalogo-materiais-estoque-kardex.html`.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.
