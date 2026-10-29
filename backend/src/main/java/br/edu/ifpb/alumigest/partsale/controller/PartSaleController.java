package br.edu.ifpb.alumigest.partsale.api.controller;

import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequestDTO;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponseDTO;
import br.edu.ifpb.alumigest.partsale.service.PartSaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/vendas-avulsas", "/api/v1/part-sales", "/api/part-sales"})
@Tag(name = "Venda Avulsa", description = "Endpoints para simulação e cálculo de materiais avulsos (Vidros e Películas)")
public class PartSaleController {

    private final PartSaleService partSaleService;

    public PartSaleController(PartSaleService partSaleService) {
        this.partSaleService = partSaleService;
    }

    @PostMapping("/calculate")
    @Operation(
            summary = "Calcular preço e área de item avulso", 
            description = "Realiza o cálculo de área líquida, área faturável e preço total, " +
                          "aplicando automaticamente a trava de 0.25m² (vidros) ou o fator de perda (películas)."
    )
    @ApiResponse(responseCode = "200", description = "Cálculo realizado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (ex: medidas zeradas ou negativas)")
    @ApiResponse(responseCode = "404", description = "Material de origem não encontrado no catálogo")
    @ApiResponse(responseCode = "422", description = "As dimensões solicitadas excedem os limites físicos de fábrica do material (BusinessException)")
    public ResponseEntity<CalculatePartItemResponseDTO> calculatePartItem(
            @Valid @RequestBody CalculatePartItemRequestDTO request) {
        
        CalculatePartItemResponseDTO response = partSaleService.calculate(request);
        return ResponseEntity.ok(response);
    }
}