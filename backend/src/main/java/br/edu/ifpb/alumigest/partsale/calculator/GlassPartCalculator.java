package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequestDTO;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponseDTO;
import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class GlassPartCalculator implements PartItemCalculator {

    private static final BigDecimal MINIMUM_BILLABLE_AREA_PER_PIECE = new BigDecimal("0.25");
    private static final BigDecimal MM_TO_M_DIVISOR = new BigDecimal("1000");

    @Override
    public boolean supports(PartMaterialType type) {
        return PartMaterialType.GLASS.equals(type);
    }

    @Override
    public CalculatePartItemResponseDTO calculate(CalculatePartItemRequestDTO request, Material material) {
        BigDecimal widthM = BigDecimal.valueOf(request.widthMm()).divide(MM_TO_M_DIVISOR, 4, RoundingMode.HALF_UP);
        BigDecimal heightM = BigDecimal.valueOf(request.heightMm()).divide(MM_TO_M_DIVISOR, 4, RoundingMode.HALF_UP);
        BigDecimal quantity = BigDecimal.valueOf(request.quantity());

        BigDecimal pieceNetArea = widthM.multiply(heightM);
        BigDecimal totalNetArea = pieceNetArea.multiply(quantity).setScale(4, RoundingMode.HALF_UP);

        BigDecimal pieceBillableArea = pieceNetArea.max(MINIMUM_BILLABLE_AREA_PER_PIECE);
        BigDecimal totalBillableArea = pieceBillableArea.multiply(quantity).setScale(4, RoundingMode.HALF_UP);

        // Pega o preço de VENDA do material
        BigDecimal unitPrice = material.getSalePrice();
        BigDecimal totalPrice = totalBillableArea.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);

        return new CalculatePartItemResponseDTO(
                material.getId(),
                PartMaterialType.GLASS,
                totalNetArea,
                totalBillableArea,
                unitPrice,
                totalPrice
        );
    }
}