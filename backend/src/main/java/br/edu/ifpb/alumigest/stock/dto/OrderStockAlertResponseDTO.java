package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import java.math.BigDecimal;
import java.util.List;

/**
 * Resposta do status agregado de estoque para uma Ordem de Serviço.
 *
 * <p>Retorna o status Make-to-Order mais crítico entre todos os materiais
 * com reserva pendente para a O.S. informada, além da lista de insumos
 * com déficit para exibição no Tooltip do card Kanban.
 */
public record OrderStockAlertResponseDTO(
    StockAlertStatus alertStatus,
    List<MissingMaterialDTO> missingMaterials
) {

    /**
     * Representa um insumo com saldo insuficiente para a O.S.
     */
    public record MissingMaterialDTO(
        String materialName,
        String materialSku,
        BigDecimal availableQuantity,
        BigDecimal reservedQuantity,
        String unitMeasure
    ) {}
}
