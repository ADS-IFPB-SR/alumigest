package br.edu.ifpb.alumigest.orders.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO imutável (Record) de resposta para item congelado do pedido de venda.
 */
public record OrderItemResponse(
    UUID id,
    UUID orderId,
    UUID productId,
    String descricao,
    Integer larguraMm,
    Integer alturaMm,
    Integer quantidade,
    String corAluminio,
    String tipoVidro,
    String orientacaoAbertura,
    String ferragens,
    BigDecimal valorUnitario,
    BigDecimal valorTotal,
    String templateConfig,
    String handleConfig,
    String drillingConfig,
    Integer ordem,
    List<OrderItemOptionResponse> options
) {
}
