package br.edu.ifpb.alumigest.partsale.controller;

import br.edu.ifpb.alumigest.partsale.calculator.PartCalculatorFactory;
import br.edu.ifpb.alumigest.partsale.calculator.PartItemCalculator;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints REST para o Módulo de Venda Avulsa de Partes (US-46).
 */
@RestController
@RequestMapping("/api/v1/part-sales")
@Tag(name = "Part Sales", description = "Endpoints para cotação e venda avulsa de partes (vidros, perfis de alumínio, ferragens e películas)")
public class PartSaleController {

    private final PartCalculatorFactory calculatorFactory;

    public PartSaleController(PartCalculatorFactory calculatorFactory) {
        this.calculatorFactory = calculatorFactory;
    }

    @PostMapping("/calculate-item")
    @Operation(
        summary = "Pré-cálculo de item avulso",
        description = "Calcula a metragem faturável e o valor total do insumo em tempo real sem persistência."
    )
    public ResponseEntity<CalculatePartItemResponse> calculateItem(
            @Valid @RequestBody CalculatePartItemRequest request) {
        PartItemCalculator calculator = calculatorFactory.getCalculator(request.category());
        CalculatePartItemResponse response = calculator.calculate(request);
        return ResponseEntity.ok(response);
    }
}
