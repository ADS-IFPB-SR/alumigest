package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Representação completa do saldo e status de um item de estoque.
 *
 * <p>Respeita rigorosamente a RN-01: availableQuantity = physicalQuantity - reservedQuantity.
 */
@Schema(description = "Representação detalhada do saldo e status de suprimento de um insumo no estoque")
public record StockItemResponseDTO(
    @Schema(description = "Identificador único do registro de estoque", example = "7c9e6679-7425-40de-944b-e07fc1f90ae7")
    UUID id,

    @Schema(description = "Identificador único do material vinculado no catálogo", example = "e3b0c442-98fc-1c14-9afbf-4c8996fb9242")
    UUID materialId,

    @Schema(description = "Código SKU do material", example = "VID-TMP-8MM")
    String materialSku,

    @Schema(description = "Nome comercial do material", example = "Vidro Temperado Incolor 8mm")
    String materialName,

    @Schema(description = "Categoria do insumo", example = "GLASS")
    String category,

    @Schema(description = "Unidade de medida de estoque", example = "m²")
    String unitMeasure,

    @Schema(description = "Saldo físico existente no almoxarifado", example = "45.5000")
    BigDecimal physicalQuantity,

    @Schema(description = "Quantidade reservada para Ordens de Serviço em produção", example = "15.0000")
    BigDecimal reservedQuantity,

    @Schema(
        description = "Saldo disponível para novas demandas (available = physical - reserved). Pode ser negativo no modelo Make-to-Order (RN-05).",
        example = "30.5000"
    )
    BigDecimal availableQuantity,

    @Schema(description = "Estoque mínimo de segurança (ponto de pedido)", example = "10.0000")
    BigDecimal minimumStock,

    @Schema(
        description = "Status consolidado de alerta de suprimento (IN_STOCK, ORDER_POINT, NEED_PURCHASE)",
        example = "IN_STOCK"
    )
    StockAlertStatus alertStatus,

    @Schema(description = "Data e hora da última atualização do saldo", example = "2026-11-15T14:30:00Z")
    OffsetDateTime lastUpdated
) {}
