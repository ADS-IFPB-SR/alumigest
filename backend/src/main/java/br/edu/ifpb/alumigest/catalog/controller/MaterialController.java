package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.MaterialSummaryDTO;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/materials")
@Tag(name = "Materiais (Busca Unificada)", description = "Busca genérica de materiais ativos")
public class MaterialController {

    private final MaterialRepository repository;

    public MaterialController(MaterialRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(summary = "Listar todos os materiais ativos para a Ficha Técnica", description = "Retorna uma lista unificada de todos os materiais ativos de todas as categorias para popular Combobox.")
    public ResponseEntity<ApiResponse<List<MaterialSummaryDTO>>> findAllActive() {
        List<MaterialSummaryDTO> materials = repository.findAll().stream()
                .filter(m -> m.isActive())
                .map(m -> new MaterialSummaryDTO(
                        m.getId(), 
                        m.getName(), 
                        m.getSkuCode(), 
                        m.getCommercialReference(), 
                        m.getSalePrice(), 
                        m.getCostPrice(),
                        m.getUnitMeasure() != null ? m.getUnitMeasure().name() : ""))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok("Materiais listados com sucesso", materials));
    }
}
