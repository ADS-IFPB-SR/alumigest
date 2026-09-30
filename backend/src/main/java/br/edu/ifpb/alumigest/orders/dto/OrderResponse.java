package br.edu.ifpb.alumigest.orders.dto;

import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO imutável (Record) de resposta detalhada de um pedido de venda.
 */
public record OrderResponse(
    UUID id,
    String codigo,
    UUID orcamentoId,
    UUID clienteId,
    String clienteNome,
    String clienteTelefone,
    String clienteEndereco,
    OrderStatus status,
    String statusDescricao,
    ApprovalChannel canalAprovacao,
    String canalAprovacaoDescricao,
    LocalDate dataAprovacao,
    LocalDate dataPrevisaoEntrega,
    LocalDate dataConclusao,
    BigDecimal valorBruto,
    BigDecimal valorDesconto,
    BigDecimal taxaInstalacao,
    BigDecimal taxaFrete,
    BigDecimal valorLiquido,
    String condicaoPagamento,
    String observacoesPagamento,
    String observacoes,
    String justificativaCancelamento,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    Boolean ativo,
    List<OrderItemResponse> items
) {
}
