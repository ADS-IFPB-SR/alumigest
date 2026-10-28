# Especificação Técnica de Apoio: US-47.2 — Gestão de Ordens de Serviço (O.S.) e Detalhamento de Esquadrias

Este documento detalha os aspectos de arquitetura, classes e contratos técnicos para a implementação da fatia vertical **US-47.2**.

---

## ☕ 1. Backend Core & Endpoints REST

- **Pacote:** `br.edu.ifpb.alumigest.orders` e `br.edu.ifpb.alumigest.clients`
- **Consulta em Repositório (`OrderRepository.java`):**
  ```java
  List<Order> findByClienteIdOrderByCreatedAtDesc(UUID clienteId);
  ```
- **DTOs (Java Records imutáveis):**
  - `ClientOrderSummaryDto`:
    ```java
    public record ClientOrderSummaryDto(
        UUID id,
        String codigo,
        LocalDate data,
        OrderStatus status,
        BigDecimal valorTotal,
        int totalEsquadrias,
        List<ClientOrderItemDto> items
    ) {}
    ```
  - `ClientOrderItemDto`:
    ```java
    public record ClientOrderItemDto(
        UUID id,
        String descricao,
        int larguraMm,
        int alturaMm,
        int quantidade,
        String corAluminio,
        String tipoVidro,
        BigDecimal valorTotal
    ) {}
    ```
- **Endpoint REST (`ClientHubController.java`):**
  - `GET /api/v1/clients/{id}/orders` (com alias `/api/v1/customers/{id}/orders`)
  - Retorna `List<ClientOrderSummaryDto>` com status HTTP 200 OK.

---

## ⚛️ 2. Frontend UI & Componentes

- **Diretório:** `frontend/src/features/customers/components/`
- **Componente:** `CustomerOrdersTab.tsx`
  - Tabela com colunas: `Código O.S.`, `Data`, `Situação Fabril`, `Valor Total`, `Esquadrias`, `Ações`.
  - Estilização sem cortes verticais: `white-space: nowrap` e `flex-shrink: 0`.
  - Utiliza `ORDER_STATUS_COLORS` e `ORDER_STATUS_LABELS` de `frontend/src/features/orders/types/order.ts`.
  - Destaque visual na linha da O.S. ativa (`bg-blue-500/10` ou borda destacada).
  - Callbacks de ação:
    ```typescript
    interface CustomerOrdersTabProps {
      customerId: string;
      onOpenTechSheet?: (orderId: string) => void;
      onOpenLabels?: (order: Order) => void;
    }
    ```
- **Componente:** `CustomerOrderItemsDrawer.tsx`
  - Posicionado abaixo da tabela, renderizado dinamicamente quando uma ordem está selecionada.
  - Exibe cada esquadria física com título, quantidade (`un`), cor de acabamento, vidro e badge de medidas:
    - Badge: `📐 ${larguraMm} x ${alturaMm} mm` (JetBrains Mono).
    - Botões no cabeçalho do card para disparo das ações de Ficha Técnica e Etiquetas.

---

## 🧪 3. Estratégia de Testes (QA)

- `OrderRepositoryTest.java`:
  - Teste do método `findByClienteIdOrderByCreatedAtDesc` validando ordenação por data decrescente.
- `ClientHubControllerTest.java` (MockMvc):
  - Teste do endpoint `/orders` validando serialização das ordens e dos itens de esquadria com medidas nominais.
- `CustomerOrdersTab.test.tsx` (Vitest):
  - Renderização da tabela sem sobreposição visual.
  - Teste de clique para selecionar uma ordem e exibição das esquadrias no card inferior.

---

## 🎨 4. Referências de Design e Protótipos

- 🖥️ **Protótipo Interativo da Central 360°**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html) — Especifica o comportamento visual da aba "Ordens de Serviço (O.S.)", layout da tabela com colunas sem sobreposição (`white-space: nowrap`) e o cartão inferior de esquadrias físicas com destaque para as medidas nominais (`📐 L x A mm`).
