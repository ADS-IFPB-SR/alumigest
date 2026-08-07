package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.CreateHardwareRequest;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponse;
import br.edu.ifpb.alumigest.catalog.dto.UpdateHardwarePriceRequest;
import br.edu.ifpb.alumigest.catalog.entity.UnitType;
import br.edu.ifpb.alumigest.catalog.service.HardwareService;
import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/catalog/hardware")
@RequiredArgsConstructor
@Tag(name = "Hardware Catalog", description = "Endpoints para gerenciamento de ferragens e acessórios")
public class HardwareController {

    private final HardwareService hardwareService;

    @PostMapping
    @Operation(summary = "Cadastrar nova ferragem/acessório")
    public ResponseEntity<ApiResponse<HardwareResponse>> create(@Valid @RequestBody CreateHardwareRequest request) {
        HardwareResponse response = hardwareService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Ferragem cadastrada com sucesso", response));
    }

    @GetMapping
    @Operation(summary = "Listar ferragens com filtro por unidade e nome")
    public ResponseEntity<ApiResponse<PageResponse<HardwareResponse>>> findAll(
            @RequestParam(required = false) UnitType unit,
            @RequestParam(required = false) String name,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        PageResponse<HardwareResponse> response = PageResponse.of(hardwareService.findAll(unit, name, pageable));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar ferragem por ID")
    public ResponseEntity<ApiResponse<HardwareResponse>> findById(@PathVariable Long id) {
        HardwareResponse response = hardwareService.findById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar preço de uma ferragem")
    public ResponseEntity<ApiResponse<HardwareResponse>> updatePrice(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHardwarePriceRequest request
    ) {
        HardwareResponse response = hardwareService.updatePrice(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Preço atualizado com sucesso", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete de uma ferragem")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hardwareService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
