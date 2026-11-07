# Especificação Funcional: US-21 — Reservar e Baixar Matéria-Prima no Estoque Automaticamente

**Identificador**: `US-21`  
**Issue GitHub**: [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como gestor de suprimentos e encarregado de almoxarifado da Alumiportas, desejo que o sistema reserve automaticamente os insumos de matéria-prima (perfis, vidros, acessórios) no momento da aprovação da Ordem de Serviço (`OS-YYYY-NNNN`) ou emissão de Venda Avulsa (`US-46`), apurando a **Necessidade de Compra** sem jamais bloquear a emissão de pedidos de clientes, e efetue a baixa física definitiva do estoque quando a fabricação for concluída (`COMPLETED`), com estorno automático em caso de cancelamento da O.S., para manter a acurácia de saldos em tempo real e municiar a equipe de compras com a demanda exata a ser adquirida.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Reserva Automática de Materiais na Aprovação da O.S. (Sem Bloqueio de Venda)**
  - **Dado que** um orçamento de venda é aprovado e convertido em Ordem de Serviço (`US-13`) ou uma Venda Avulsa de Partes é confirmada (`US-46`),
  - **Quando** a O.S. atinge o status `CREATED` / `WAITING_PRODUCTION`,
  - **Então** o sistema cria registros de movimentação com tipo `PRODUCTION_RESERVATION` em `tb_stock_movements`,
  - **E** incrementa o saldo reservado (`reserved_quantity`) e decrementa o saldo disponível (`available_quantity`) de cada insumo correspondente em `tb_stock_items`,
  - **E** a operação é concluída com sucesso independentemente de haver saldo físico suficiente no momento da aprovação (modelo *Make-to-Order*).

- [ ] **Cenário 2: Baixa Física Definitiva na Conclusão da Produção (`COMPLETED`)**
  - **Dado que** uma O.S. está em fabricação com matérias-primas devidamente reservadas e materiais comprados recebidos,
  - **Quando** o encarregado move o status para `COMPLETED` no Kanban (`US-18`),
  - **Então** o sistema converte a reserva em baixa física definitiva gerando movimentações do tipo `PRODUCTION_OUTFLOW`,
  - **E** decrementa simultaneamente o saldo físico (`physical_quantity`) e o saldo reservado (`reserved_quantity`), mantendo o saldo disponível inalterado.

- [ ] **Cenário 3: Estorno Automático de Reservas em Cancelamento de O.S.**
  - **Dado que** uma O.S. com materiais reservados precisa ser cancelada (`US-15`),
  - **Quando** o cancelamento é formalizado com justificativa,
  - **Então** o sistema gera registros de movimentação do tipo `RESERVATION_CANCELLATION`,
  - **E** zera as reservas daquela ordem, devolvendo os insumos ao saldo disponível (`available_quantity`).

- [ ] **Cenário 4: Apuração de Demanda de Compra e Alerta Preventivo de Insumos**
  - **Dado que** a quantidade necessária de um perfil ou chapa excede o saldo físico em estoque no momento da reserva,
  - **Quando** a reserva for processada,
  - **Então** a operação é aprovada sem erro, e o saldo disponível passa a indicar a necessidade líquida de compra ($\text{available\_quantity} < 0$),
  - **E** a O.S. recebe status de suprimento `PENDING_PURCHASE`,
  - **E** o card do Kanban e o Hub exibem a tag visual de alerta `🔴 Falta Insumo / Comprar` (conforme `prototipo_kambam.html`), alertando a equipe de compras sobre os insumos a encomendar.

- [ ] **Cenário 5: Movimentação Manual de Ajuste e Entrada de Compras**
  - **Dado que** o almoxarife recebe nota de novos perfis ou realiza ajuste de inventário,
  - **Quando** registra a movimentação via `POST /api/v1/stock/movements`,
  - **Então** o saldo físico e disponível é atualizado atomicamente com registro de usuário e justificativa,
  - **E** se o saldo passar a atender as O.S. pendentes, o alerta muda automaticamente para `🟢 Insumos Disponíveis`.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Invariante Fundamental de Saldos):** Para qualquer item de estoque, deve valer rigorosamente a equação:
  $$\text{available\_quantity} = \text{physical\_quantity} - \text{reserved\_quantity}$$
- **RN-02 (Atomicidade Transacional):** Todas as reservas e baixas de estoque devem ser executadas com `@Transactional` atômico; caso ocorra falha em qualquer material, toda a transação é revertida (*rollback*).
- **RN-03 (Impedimento de Saldo Físico Negativo em Baixas Manuais):** Baixas físicas manuais extraordinárias sem vínculo que tentem subtrair material não existente (`physical_quantity < 0`) devem ser bloqueadas com `BusinessException` (HTTP 422).
- **RN-04 (Diretriz de Idioma em Variáveis):** Enums de movimentação em inglês técnico: `PURCHASE_ENTRY`, `PRODUCTION_RESERVATION`, `PRODUCTION_OUTFLOW`, `SCRAP_LOSS`, `MANUAL_ADJUSTMENT`, `RESERVATION_CANCELLATION`.
- **RN-05 (Reserva Não Bloqueante / Modelo Make-to-Order da Serralheria):**
  - *Premissa Central:* Por operarmos no modelo sob encomenda (*Make-to-Order*), a reserva de estoque não restringe o fechamento comercial, atuando como ferramenta de planejamento para dimensionar a necessidade de compras e sinalizar a prontidão de corte na fábrica.
  - A criação de orçamentos, a aprovação de Ordens de Serviço (O.S.) e a realização de Vendas Avulsas de Partes (`US-46`) **JAMAIS devem ser bloqueadas ou rejeitadas por falta de estoque** (seja físico ou disponível).
  - A Alumiportas opera sob encomenda (*Make-to-Order*): o orçamento é fechado para que o material seja comprado sob medida do fornecedor.
  - É expressamente proibido lançar exceção bloqueante (`BusinessException` / HTTP 422) ao aprovar O.S. com estoque insuficiente. O sistema deve registrar a reserva, permitir que o saldo disponível fique negativo ($\text{available\_quantity} < 0$) e gerar o alerta `🔴 Falta Insumo / Comprar` para orientar as ordens de compra.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Tabelas / Migração:** `tb_stock_items` e `tb_stock_movements` (`V21__create_stock_schema.sql`)
- **Endpoints:**
  - `POST /api/v1/stock/reserve-for-order/{orderId}`
  - `POST /api/v1/stock/consume-for-order/{orderId}`
  - `POST /api/v1/stock/movements`
- **Service:** `StockService.java` com métodos `reserveMaterials(UUID orderId)`, `consumeReservedMaterials(UUID orderId)`, `cancelReservations(UUID orderId)`
- **Eventos:** Integração síncrona ou via `@EventListener` a partir do avanço de status no `OrderProductionService`

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Indicadores:** Integração de badge de estoque no `OrderProductionCard.tsx` (`🟢 Insumos OK` / `🔴 Falta Insumo`) e filtros de estoque na `KanbanFilterBar.tsx`

---

## 🛡️ Definition of Done (DoD)

- [ ] Testes unitários de `StockServiceTest` validando reserva, baixa, estorno e recálculo da equação de saldo disponível.
- [ ] Testes de concorrência com 10 threads simultâneas garantindo que não ocorra colisão de saldo ou *race condition*.
- [ ] Teste de ciclo de vida completo: Orçamento ➔ Reserva ➔ Produção ➔ Baixa com asserção dos saldos finais.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (15 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-21.1](issues/US-21.1-criar-package-br-edu-ifpb-alumigest-stock-e-d/issue.md) | Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock` | 🔲 No Backlog |
| [US-21.2](issues/US-21.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `V21__create_stock_schema.sql` com tabelas `tb_stock_items` e `tb_stock_movements` | 🔲 No Backlog |
| [US-21.3](issues/US-21.3-criar-enum-stockmovementtype-entrada-compra-r/issue.md) | Criar enum `StockMovementType` (`PURCHASE_ENTRY`, `PRODUCTION_RESERVATION`, etc.) | 🔲 No Backlog |
| [US-21.4](issues/US-21.4-criar-entidade-jpa-stockitem-em-backend-src-m/issue.md) | Criar entidade JPA `StockItem` mapeando colunas em inglês técnico | 🔲 No Backlog |
| [US-21.5](issues/US-21.5-criar-entidade-jpa-stockmovement-em-backend-s/issue.md) | Criar entidade JPA `StockMovement` com trilha de auditoria | 🔲 No Backlog |
| [US-21.6](issues/US-21.6-criar-repositorio-stockitemrepository-em-back/issue.md) | Criar repositório `StockItemRepository` com locks pessimistas defensivos | 🔲 No Backlog |
| [US-21.7](issues/US-21.7-criar-repositorio-stockmovementrepository-em-/issue.md) | Criar repositório `StockMovementRepository` para consulta ordenada | 🔲 No Backlog |
| [US-21.8](issues/US-21.8-criar-record-stockitemresponse-saldos-fisico-/issue.md) | Criar record `StockItemResponseDTO` (saldos físico, reservado, disponível e alerta) | 🔲 No Backlog |
| [US-21.9](issues/US-21.9-criar-record-stockmovementrequest-e-stockmove/issue.md) | Criar records `StockMovementRequestDTO` e `StockMovementResponseDTO` | 🔲 No Backlog |
| [US-21.10](issues/US-21.10-criar-mapper-mapstruct-stockmapper-em-backend/issue.md) | Criar mapper MapStruct `StockMapper` | 🔲 No Backlog |
| [US-21.11](issues/US-21.11-implementar-metodo-reservarmateriais-long-ord/issue.md) | Implementar método `reserveMaterials(UUID orderId)` no `StockService` | 🔲 No Backlog |
| [US-21.12](issues/US-21.12-implementar-metodo-baixarmateriais-long-produ/issue.md) | Implementar método `consumeReservedMaterials(UUID orderId)` no `StockService` | 🔲 No Backlog |
| [US-21.13](issues/US-21.13-implementar-metodo-registrarmovimentacaomanua/issue.md) | Implementar método `registerManualMovement(...)` e `listStockBalances()` no `StockService` | 🔲 No Backlog |
| [US-21.14](issues/US-21.14-criar-stockcontroller-com-endpoints-get-api-s/issue.md) | Criar `StockController` com endpoints `GET /api/v1/stock`, `POST /api/v1/stock/movements` | 🔲 No Backlog |
| [US-21.15](issues/US-21.15-criar-testes-unitarios-de-reserva-baixa-e-con/issue.md) | Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` | 🔲 No Backlog |

---

**Branch:** `feat/us-21-reserva-baixa-estoque`
