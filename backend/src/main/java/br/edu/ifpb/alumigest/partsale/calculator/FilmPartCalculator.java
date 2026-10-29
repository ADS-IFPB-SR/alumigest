package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequestDTO;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponseDTO;
import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class FilmPartCalculator implements PartItemCalculator {

    private static final BigDecimal MM_TO_M_DIVISOR = new BigDecimal("1000");

    @Override
    public boolean supports(PartMaterialType type) {
        return PartMaterialType.FILM.equals(type);
    }

    @Override
    public CalculatePartItemResponseDTO calculate(CalculatePartItemRequestDTO request, Material material) {
        BigDecimal widthM = BigDecimal.valueOf(request.widthMm()).divide(MM_TO_M_DIVISOR, 4, RoundingMode.HALF_UP);
        BigDecimal heightM = BigDecimal.valueOf(request.heightMm()).divide(MM_TO_M_DIVISOR, 4, RoundingMode.HALF_UP);
        BigDecimal quantity = BigDecimal.valueOf(request.quantity());

        // Área total real
        BigDecimal totalNetArea = widthM.multiply(heightM).multiply(quantity).setScale(4, RoundingMode.HALF_UP);

        // Pega o lossFactor do REQUEST (conforme a spec)
        BigDecimal lossFactor = request.lossFactor() != null ? request.lossFactor() : BigDecimal.ZERO;
        BigDecimal multiplier = BigDecimal.ONE.add(lossFactor);

        // Área faturável
        BigDecimal totalBillableArea = totalNetArea.multiply(multiplier).setScale(4, RoundingMode.HALF_UP);

        // Pega o preço de VENDA do material
        BigDecimal unitPrice = material.getSalePrice();
        BigDecimal totalPrice = totalBillableArea.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);

        return new CalculatePartItemResponseDTO(
                material.getId(),
                PartMaterialType.FILM,
                totalNetArea,
                totalBillableArea,
                unitPrice,
                totalPrice
        );
    }
}