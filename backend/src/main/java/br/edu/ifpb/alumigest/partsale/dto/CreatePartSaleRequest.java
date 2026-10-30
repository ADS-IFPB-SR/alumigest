package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Payload para criação de uma nova venda avulsa de partes.
 */
public record CreatePartSaleRequest(
    @NotNull(message = "ID do cliente é obrigatório")
    UUID clientId,

    PartSaleStatus status,

    @PositiveOrZero(message = "Desconto não pode ser negativo")
    BigDecimal discountAmount,

    @NotEmpty(message = "A venda deve conter pelo menos um item")
    @Valid
    List<CreatePartSaleItemRequest> items
) {}
