package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileUpdateDTO;
import br.edu.ifpb.alumigest.catalog.service.AluminumProfileService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/aluminum-profiles")
@Tag(name = "Aluminum Profiles Catalog", description = "Endpoints para gerenciamento de perfis de alumínio e puxadores")
public class AluminumProfileController {

    private final AluminumProfileService aluminumProfileService;

    public AluminumProfileController(AluminumProfileService aluminumProfileService) {
        this.aluminumProfileService = aluminumProfileService;
    }

    @PostMapping
    @Operation(summary = "Cadastrar perfil ou puxador de alumínio",
               description = "Registra um novo perfil de alumínio vinculado ao grupo ALUMINIO com cálculo por metro linear.")
    public ResponseEntity<ApiResponse<AluminumProfileResponseDTO>> create(
            @Valid @RequestBody AluminumProfileRequestDTO request) {
        AluminumProfileResponseDTO response = aluminumProfileService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Perfil de alumínio cadastrado com sucesso", response));
    }

    @GetMapping
    @Operation(summary = "Listar perfis de alumínio com filtros",
               description = "Retorna lista paginada de perfis ativos com filtros opcionais por cor/acabamento e nome (linha Rometal/Alternativa)")
    public ResponseEntity<ApiResponse<PageResponse<AluminumProfileResponseDTO>>> findAll(
            @RequestParam(required = false) String colorFinish,
            @RequestParam(required = false) String name,
            @PageableDefault(size = 20) Pageable pageable) {

        PageResponse<AluminumProfileResponseDTO> response =
                PageResponse.of(aluminumProfileService.findAll(colorFinish, name, pageable));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar perfil de alumínio por ID (UUID)")
    public ResponseEntity<ApiResponse<AluminumProfileResponseDTO>> findById(@PathVariable UUID id) {
        AluminumProfileResponseDTO response = aluminumProfileService.findById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar preços de um perfil de alumínio",
               description = "Atualiza preço de custo e venda por metro ou barra de um perfil existente")
    public ResponseEntity<ApiResponse<AluminumProfileResponseDTO>> updatePrices(
            @PathVariable UUID id,
            @Valid @RequestBody AluminumProfileUpdateDTO request) {
        AluminumProfileResponseDTO response = aluminumProfileService.updatePrices(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Preços atualizados com sucesso", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativar perfil de alumínio (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        aluminumProfileService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
