package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Payload para atualização do status comercial de uma venda avulsa.
 */
public record PartSaleStatusUpdateRequest(
    @NotNull(message = "O novo status é obrigatório")
    PartSaleStatus status
) {}

