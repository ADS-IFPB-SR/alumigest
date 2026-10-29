package br.edu.ifpb.alumigest.partsale.dto;

import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;
import java.math.BigDecimal;
import java.util.UUID;

public record CalculatePartItemResponseDTO(
    UUID materialId,
    PartMaterialType materialType,
    BigDecimal netArea,       // Área real/exata (m²)
    BigDecimal billableArea,  // Área cobrada/faturável (m²)
    BigDecimal unitPrice,     // Preço do m² no cadastro
    BigDecimal totalPrice     // Valor total final (billableArea * unitPrice)
) {}