package br.edu.ifpb.alumigest.budgets.controller;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.dto.BudgetCreateRequest;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetStatusUpdateDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetSummaryResponseDTO;
import br.edu.ifpb.alumigest.budgets.service.BudgetQuantityService;
import br.edu.ifpb.alumigest.budgets.service.BudgetService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping({"/api/orcamentos", "/api/v1/budgets"})
@Tag(name = "Orçamentos", description = "Endpoints para gerenciamento de orçamentos")
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetQuantityService budgetQuantityService;

    public BudgetController(BudgetService budgetService, BudgetQuantityService budgetQuantityService) {
        this.budgetService = budgetService;
        this.budgetQuantityService = budgetQuantityService;
    }

    @PostMapping
    @Operation(summary = "Criar orçamento", description = "Cria um novo orçamento (Rascunho) e retorna o DTO detalhado.")
    @ApiResponse(responseCode = "201", description = "Orçamento criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    public ResponseEntity<BudgetResponseDTO> create(@RequestBody @Valid BudgetCreateRequest request) {
        // Caso o seu BudgetService espere o BudgetRequestDTO legado, 
        // você pode mapear o BudgetCreateRequest para o BudgetRequestDTO ou ajustar o service.
        // Assumindo que o service receba o novo DTO ou que seja adaptado:
        BudgetResponseDTO response = budgetService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar orçamentos", description = "Lista orçamentos de forma paginada com suporte a busca textual por código/cliente e filtro de status.")
    @ApiResponse(responseCode = "200", description = "Lista paginada de orçamentos")
    public ResponseEntity<PageResponse<BudgetSummaryResponseDTO>> findAll(
            @Parameter(description = "Termo para busca textual (código ou nome do cliente)")
            @RequestParam(required = false) String busca,
            @Parameter(description = "Filtro por status do orçamento")
            @RequestParam(required = false) BudgetStatus status,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<BudgetSummaryResponseDTO> response = budgetService.findAll(busca, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar orçamento por ID", description = "Retorna os detalhes completos do orçamento.")
    @ApiResponse(responseCode = "200", description = "Orçamento encontrado")
    @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    public ResponseEntity<BudgetResponseDTO> findById(@PathVariable UUID id) {
        BudgetResponseDTO response = budgetService.findById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar orçamento", description = "Atualiza os dados de um orçamento que está no status DRAFT.")
    @ApiResponse(responseCode = "200", description = "Orçamento atualizado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    @ApiResponse(responseCode = "422", description = "Orçamento imutável")
    public ResponseEntity<BudgetResponseDTO> update(
            @PathVariable UUID id,
            @RequestBody @Valid BudgetRequestDTO request) {

        BudgetResponseDTO response = budgetService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do orçamento", description = "Altera o status do orçamento seguindo as regras de transição permitidas.")
    @ApiResponse(responseCode = "200", description = "Status do orçamento alterado com sucesso")
    @ApiResponse(responseCode = "400", description = "Status inválido")
    @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    @ApiResponse(responseCode = "422", description = "Transição inválida")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestBody @Valid BudgetStatusUpdateDTO statusDto) {

        budgetService.updateStatus(id, statusDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/recalcular")
    @Operation(summary = "Forçar recálculo", description = "Força o recálculo de quantidades e preços de um orçamento DRAFT.")
    @ApiResponse(responseCode = "200", description = "Orçamento recalculado")
    @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    @ApiResponse(responseCode = "422", description = "Orçamento imutável")
    public ResponseEntity<BudgetResponseDTO> recalculate(@PathVariable UUID id) {
        BudgetResponseDTO response = budgetService.recalculate(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items/preview-calculation")
    @Operation(summary = "Preview de cálculo de insumos", description = "Calcula sugestão de consumo de vidro/perfil e alerta de consistência física para itens de esquadria.")
    public ResponseEntity<BudgetItemCalculationResponseDTO> previewCalculation(
            @RequestBody @Valid BudgetItemCalculationRequestDTO request) {
        return ResponseEntity.ok(budgetQuantityService.previewCalculation(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar orçamento", description = "Cancela o orçamento alterando seu status para CANCELLED (soft delete).")
    @ApiResponse(responseCode = "204", description = "Orçamento cancelado com sucesso")
    @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    @ApiResponse(responseCode = "422", description = "Transição para cancelado inválida")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}