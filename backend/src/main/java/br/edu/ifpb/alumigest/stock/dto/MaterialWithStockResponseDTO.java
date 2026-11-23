package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import java.util.UUID;

/**
 * Resposta consolidada do cadastro 2 em 1 (material criado + posição em estoque + movimentação inicial).
 */
public record MaterialWithStockResponseDTO(
    UUID materialId,
    MaterialCategoryType categoryType,
    Object material,
    StockItemResponseDTO stockItem,
    StockMovementResponseDTO initialMovement
) {}