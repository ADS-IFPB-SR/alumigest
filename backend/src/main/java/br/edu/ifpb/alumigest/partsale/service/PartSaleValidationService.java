package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

/**
 * Serviço de validação de regras de negócio para venda avulsa de partes.
 */
@Service
public class PartSaleValidationService {

  /**
   * Valida se as dimensões solicitadas cabem nas medidas máximas de fábrica do material.
   *
   * @param request dados do cálculo do item
   * @param material material consultado no catálogo
   */
  public void validatePhysicalLimits(CalculatePartItemRequest request, Material material) {
    if (request.widthMm() != null && material.getMaxWidthMm() != null
        && BigDecimal.valueOf(request.widthMm()).compareTo(material.getMaxWidthMm()) > 0) {
      throw new BusinessException(
          String.format(
              "A largura solicitada (%dmm) excede o limite máximo de fábrica do material (%.2fmm).",
              request.widthMm(), material.getMaxWidthMm()));
    }

    if (request.heightMm() != null && material.getMaxHeightMm() != null
        && BigDecimal.valueOf(request.heightMm()).compareTo(material.getMaxHeightMm()) > 0) {
      throw new BusinessException(
          String.format(
              "A altura solicitada (%dmm) excede o limite máximo de fábrica do material (%.2fmm).",
              request.heightMm(), material.getMaxHeightMm()));
    }
  }
}
