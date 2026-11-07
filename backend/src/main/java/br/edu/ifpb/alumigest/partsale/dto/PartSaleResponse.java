package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Resposta completa de uma venda avulsa de partes.
 */
public record PartSaleResponse(
    UUID id,
    String code,
    UUID clientId,
    String clientName,
    PartSaleStatus status,
    BigDecimal subtotalAmount,
    BigDecimal discountAmount,
    BigDecimal totalAmount,
    List<PartSaleItemResponse> items,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
