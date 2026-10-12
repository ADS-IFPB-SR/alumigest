package br.edu.ifpb.alumigest.orders.dto;

import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO imutável (Record) resumido para listagens paginadas e cards de pedidos de venda.
 */
public record OrderSummaryResponse(
    UUID id,
    String codigo,
    UUID orcamentoId,
    String clienteNome,
    String clienteTelefone,
    OrderStatus status,
    String statusDescricao,
    ApprovalChannel canalAprovacao,
    String canalAprovacaoDescricao,
    LocalDate dataAprovacao,
    LocalDate dataPrevisaoEntrega,
    BigDecimal valorLiquido,
    Integer quantidadeItens,
    OffsetDateTime createdAt
) {
}
