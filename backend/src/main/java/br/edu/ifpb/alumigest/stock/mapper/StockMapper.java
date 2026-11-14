package br.edu.ifpb.alumigest.stock.mapper;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.stock.domain.StockItem;
import br.edu.ifpb.alumigest.stock.domain.StockMovement;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Mapeador entre entidades de domínio de estoque e DTOs imutáveis de resposta.
 */
@Component
public class StockMapper {

    /**
     * Converte um {@link StockItem} em {@link StockItemResponseDTO}.
     *
     * @param item entidade de estoque
     * @return DTO de saldo consolidado
     */
    public StockItemResponseDTO toItemResponseDTO(StockItem item) {
        Material material = item.getMaterial();
        String category = resolveCategory(material);
        String unitMeasure = material.getUnitMeasure() != null ? material.getUnitMeasure().name() : null;

        return new StockItemResponseDTO(
            item.getId(),
            material.getId(),
            material.getSkuCode(),
            material.getName(),
            category,
            unitMeasure,
            item.getPhysicalQuantity(),
            item.getReservedQuantity(),
            item.getAvailableQuantity(),
            item.getMinimumStock(),
            item.resolveAlertStatus(),
            item.getUpdatedAt()
        );
    }

    /**
     * Converte um {@link StockMovement} em {@link StockMovementResponseDTO}.
     *
     * @param movement entidade de movimentação Kardex
     * @return DTO de movimentação
     */
    public StockMovementResponseDTO toMovementResponseDTO(StockMovement movement) {
        Material material = movement.getMaterial();
        return new StockMovementResponseDTO(
            movement.getId(),
            movement.getStockItem().getId(),
            material.getId(),
            material.getSkuCode(),
            material.getName(),
            movement.getType(),
            movement.getQuantity(),
            movement.getPreviousPhysicalQuantity(),
            movement.getNewPhysicalQuantity(),
            movement.getPreviousReservedQuantity(),
            movement.getNewReservedQuantity(),
            movement.getReferenceDocument(),
            movement.getReason(),
            movement.getRegisteredBy(),
            movement.getCreatedAt()
        );
    }

    private String resolveCategory(Material material) {
        if (material.getGroup() == null || material.getGroup().getCode() == null) {
            return null;
        }
        String groupCode = material.getGroup().getCode();
        MaterialCategoryType categoryType = MaterialCategoryType.fromGroupCode(groupCode);
        return categoryType != null ? categoryType.name() : groupCode;
    }
}

