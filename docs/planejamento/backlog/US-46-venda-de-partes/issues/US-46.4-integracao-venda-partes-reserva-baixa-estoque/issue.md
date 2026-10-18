# [US-46.4] Integração da Venda de Partes com Reserva e Baixa de Estoque (Backend - US-21)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.4`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas)`
- **Release**: Backlog Comercial & Estoque
- **Sub-área**: `Backend`
- **Execução Paralela**: ❌ Não (Depende da finalização da US-46.1 e dos contratos de estoque da US-21)
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/partsale/service/PartSaleStockIntegrationService.java`
- **Labels Sugeridas**: `backend`, `stock`, `inventory`, `transactions`, `solid`, `spring-boot`, `integration`

---

## 🎯 Objetivo & Descrição

Garantir que a aprovação da venda avulsa de partes efetue a reserva automática de insumos no módulo de estoque (conforme US-21) — seja em metros quadrados para vidros e películas, metros lineares para perfis de alumínio ou unidades inteiras para ferragens —, realizando a baixa física definitiva no momento em que a entrega for confirmada ao cliente.

Esta issue consolida a integração transacional e a rastreabilidade de insumos entre o módulo comercial e o almoxarifado, prevenindo furos de estoque e assegurando integridade concorrencial entre diferentes unidades de medida.

---

## 🛠️ Checklist de Implementação

- [ ] Integrar com o serviço de estoque `StockService` (ou listener de eventos de domínio `PartSaleApprovedEvent` e `PartSaleDeliveredEvent`).
- [ ] Implementar a rotina de reserva automática na transição para status `APPROVED`:
  - Registrar movimentações em `tb_stock_movements` com tipo `DIRECT_SALE_RESERVATION`:
    - **Vidros e Películas**: Reserva baseada na metragem quadrada calculada ($\text{m}^2$).
    - **Alumínio**: Reserva baseada no comprimento em metros lineares ($\text{m}$) ou barras inteiras.
    - **Ferragens**: Reserva baseada em contagem de unidades inteiras (`un`).
  - Incrementar `reserved_quantity` e decrementar `available_quantity` para cada `stock_item_id` associado aos itens da venda.
  - Verificar se a quantidade disponível em estoque é suficiente antes de aprovar a venda; se insuficiente, lançar `InsufficientStockException` (HTTP 422).
- [ ] Implementar a rotina de baixa física definitiva na transição para status `DELIVERED`:
  - Registrar movimentações em `tb_stock_movements` com tipo `DIRECT_SALE_OUTFLOW`.
  - Decrementar simultaneamente `physical_quantity` e `reserved_quantity` no estoque.
- [ ] Implementar a rotina de estorno de reserva caso o pedido seja cancelado (`CANCELLED` a partir de `APPROVED`):
  - Decrementar `reserved_quantity` e restaurar `available_quantity` com movimentação `DIRECT_SALE_RESERVATION_CANCELLED`.
- [ ] Garantir atomicidade com anotação `@Transactional` para evitar estados inconsistentes entre pedido e saldo de estoque.
- [ ] Criar testes de integração com `MockMvc` e banco em memória/testcontainers validando reservas e baixas para todas as 4 categorias de insumos.

---

## ✅ Critérios de Aceitação

1. Ao aprovar um pedido de partes (`DRAFT` $\rightarrow$ `APPROVED`), o saldo disponível de cada tipo de insumo (vidro, alumínio, ferragem ou película) deve ser reduzido e o reservado incrementado.
2. Para ferragens, as movimentações de estoque devem ocorrer estritamente em números inteiros (unidades).
3. Para películas e vidros, a movimentação deve considerar a metragem quadrada faturada com perda.
4. A confirmação de entrega do pedido (`DELIVERED`) deve abater a reserva e decrementar a quantidade física real no estoque.
5. Tentativas de aprovação de vendas sem saldo disponível suficiente devem ser rejeitadas com erro informativo de negócio.
6. O cancelamento de pedidos aprovados deve estornar integralmente as reservas realizadas.
7. O histórico do Kardex (US-22) deve refletir todas as movimentações decorrentes da venda avulsa com rastreabilidade ao código da venda (`PART-YYYY-NNNN`).

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- 📦 **Especificação de Estoque (US-21)**: [../../US-21-reserva-baixa-estoque/spec.md](../../US-21-reserva-baixa-estoque/spec.md)
- 🗃️ **Kardex e Movimentações (US-22)**: [../../US-22-posicao-estoque-kardex/spec.md](../../US-22-posicao-estoque-kardex/spec.md)
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
