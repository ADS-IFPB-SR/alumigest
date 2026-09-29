package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.dto.MaterialSummaryDTO;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
                .filter(Material::isActive)
                .map(m -> new MaterialSummaryDTO(
                        m.getId(), 
                        m.getName(), 
                        m.getSkuCode(), 
                        m.getCommercialReference(), 
                        m.getSalePrice(), 
                        m.getCostPrice(),
                        m.getUnitMeasure() != null ? m.getUnitMeasure().name() : "",
                        m.isHandle()))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok("Materiais listados com sucesso", materials));
    }

    @GetMapping("/families")
    @Operation(summary = "Listar famílias de materiais existentes", description = "Retorna lista única de códigos de família já cadastrados, opcionalmente filtrados pelo grupo de material (ex: VIDRO, ALUMINIO).")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctFamilies(
            @RequestParam(required = false) String groupCode) {
        List<String> families = repository.findDistinctFamilyCodesByGroupCode(groupCode);
        return ResponseEntity.ok(ApiResponse.ok("Famílias listadas com sucesso", families));
    }
}
