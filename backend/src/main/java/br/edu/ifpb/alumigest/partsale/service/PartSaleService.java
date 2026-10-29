package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequestDTO;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponseDTO;
import br.edu.ifpb.alumigest.partsale.calculator.PartItemCalculator;
import br.edu.ifpb.alumigest.partsale.calculator.PartItemCalculatorFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartSaleService {

    private final MaterialRepository materialRepository;
    private final PartSaleValidationService validationService;
    private final PartItemCalculatorFactory calculatorFactory;

    public PartSaleService(MaterialRepository materialRepository, 
                           PartSaleValidationService validationService, 
                           PartItemCalculatorFactory calculatorFactory) {
        this.materialRepository = materialRepository;
        this.validationService = validationService;
        this.calculatorFactory = calculatorFactory;
    }

    @Transactional(readOnly = true)
    public CalculatePartItemResponseDTO calculate(CalculatePartItemRequestDTO request) {
        // 1. Busca o material no catálogo
        Material material = materialRepository.findById(request.materialId())
                .orElseThrow(() -> new BusinessException("Material não encontrado no catálogo."));

        // 2. Valida limites físicos (trava de segurança)
        validationService.validatePhysicalLimits(request, material);

        // 3. Resolve a estratégia de cálculo correta (Vidro ou Película)
        PartItemCalculator calculator = calculatorFactory.getCalculator(request.materialType());
        
        // 4. Executa e retorna
        return calculator.calculate(request, material);
    }
}