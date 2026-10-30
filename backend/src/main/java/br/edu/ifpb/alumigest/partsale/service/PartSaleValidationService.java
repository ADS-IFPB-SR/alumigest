package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class PartSaleValidationService {

    public void validatePhysicalLimits(CalculatePartItemRequest request, Material material) {
        
        // Converte o Integer do request para BigDecimal e compara com o limite máximo
        if (material.getMaxWidthMm() != null && 
            BigDecimal.valueOf(request.widthMm()).compareTo(material.getMaxWidthMm()) > 0) {
            throw new BusinessException(
                String.format("A largura solicitada (%dmm) excede o limite máximo de fábrica do material (%.2fmm).", 
                              request.widthMm(), material.getMaxWidthMm())
            );
        }
        
        if (material.getMaxHeightMm() != null && 
            BigDecimal.valueOf(request.heightMm()).compareTo(material.getMaxHeightMm()) > 0) {
            throw new BusinessException(
                String.format("A altura solicitada (%dmm) excede o limite máximo de fábrica do material (%.2fmm).", 
                              request.heightMm(), material.getMaxHeightMm())
            );
        }
    }
}