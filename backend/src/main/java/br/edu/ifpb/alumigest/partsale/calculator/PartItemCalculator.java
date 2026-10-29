package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequestDTO;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponseDTO;
import br.edu.ifpb.alumigest.partsale.domain.PartMaterialType;

public interface PartItemCalculator {
    
    boolean supports(PartMaterialType type);
    
    CalculatePartItemResponseDTO calculate(CalculatePartItemRequestDTO request, Material material);
}