package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.service.HardwareService;
import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/hardware")
@Tag(name = "Hardware Catalog", description = "Endpoints para gerenciamento de ferragens e acessórios")
public class HardwareController {

    private static final List<String> ALLOWED_HARDWARE_UNITS = List.of("UN", "PAR", "METRO");

    private final HardwareService hardwareService;

    public HardwareController(HardwareService hardwareService) {
        this.hardwareService = hardwareService;
    }

    @PostMapping
    @Operation(summary = "Cadastrar nova ferragem/acessório")
    public ResponseEntity<ApiResponse<HardwareResponseDTO>> create(
            @Valid @RequestBody HardwareRequestDTO request) {
        HardwareResponseDTO response = hardwareService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Ferragem cadastrada com sucesso", response));
    }

    @GetMapping
    @Operation(summary = "Listar ferragens com filtro opcional por unidade de medida e nome")
    public ResponseEntity<ApiResponse<PageResponse<HardwareResponseDTO>>> findAll(
            @RequestParam(name = "unitMeasure", required = false) String unitMeasureParam,
            @RequestParam(name = "unit", required = false) String unitParam,
            @RequestParam(required = false) String name,
            @PageableDefault(size = 20) Pageable pageable) {

        UnitMeasure parsedUnitMeasure = resolveUnitMeasure(unitMeasureParam, unitParam);

        PageResponse<HardwareResponseDTO> response =
                PageResponse.of(hardwareService.findAll(parsedUnitMeasure, name, pageable));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private UnitMeasure resolveUnitMeasure(String unitMeasureParam, String unitParam) {
        String rawUnit = unitMeasureParam != null ? unitMeasureParam : unitParam;
        if (rawUnit == null || rawUnit.isBlank()) {
            return null;
        }

        String paramName = unitMeasureParam != null ? "unitMeasure" : "unit";
        String normalizedUnit = rawUnit.trim();

        if (!ALLOWED_HARDWARE_UNITS.contains(normalizedUnit)) {
            String acceptedStr = String.join(", ", ALLOWED_HARDWARE_UNITS);
            throw new IllegalArgumentException(String.format(
                    "Valor inválido para o parâmetro '%s': '%s'. Valores aceitos: %s.",
                    paramName, rawUnit, acceptedStr));
        }

        return UnitMeasure.valueOf(normalizedUnit);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar ferragem por ID (UUID)")
    public ResponseEntity<ApiResponse<HardwareResponseDTO>> findById(@PathVariable UUID id) {
        HardwareResponseDTO response = hardwareService.findById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar preço de venda de uma ferragem")
    public ResponseEntity<ApiResponse<HardwareResponseDTO>> updatePrice(
            @PathVariable UUID id,
            @Valid @RequestBody HardwareUpdatePriceDTO request) {
        HardwareResponseDTO response = hardwareService.updatePrice(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Preço atualizado com sucesso", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativar ferragem (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        hardwareService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
