package br.edu.ifpb.alumigest.budgets.controller;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.dto.BudgetRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetStatusUpdateDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetSummaryResponseDTO;
import br.edu.ifpb.alumigest.budgets.service.BudgetService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping({"/api/orcamentos", "/api/v1/budgets"})
@Tag(name = "Orçamentos", description = "Endpoints para gerenciamento de orçamentos")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Criar orçamento", description = "Cria um novo orçamento e retorna o DTO detalhado.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Orçamento criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    })
    public ResponseEntity<BudgetResponseDTO> create(@RequestBody @Valid BudgetRequestDTO request) {
        BudgetResponseDTO response = budgetService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar orçamentos", description = "Lista orçamentos de forma paginada com suporte a busca textual por código/cliente e filtro de status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada de orçamentos")
    })
    public ResponseEntity<PageResponse<BudgetSummaryResponseDTO>> findAll(
            @Parameter(description = "Termo para busca textual (código ou nome do cliente)")
            @RequestParam(required = false) String busca,
            @Parameter(description = "Filtro por status do orçamento")
            @RequestParam(required = false) BudgetStatus status,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {

        PageResponse<BudgetSummaryResponseDTO> response = budgetService.findAll(busca, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar orçamento por ID", description = "Retorna os detalhes completos do orçamento.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orçamento encontrado"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    })
    public ResponseEntity<BudgetResponseDTO> findById(@PathVariable UUID id) {
        BudgetResponseDTO response = budgetService.findById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar orçamento", description = "Atualiza os dados de um orçamento que está no status DRAFT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orçamento atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado"),
            @ApiResponse(responseCode = "422", description = "Orçamento imutável")
    })
    public ResponseEntity<BudgetResponseDTO> update(
            @PathVariable UUID id,
            @RequestBody @Valid BudgetRequestDTO request) {

        BudgetResponseDTO response = budgetService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do orçamento", description = "Altera o status do orçamento seguindo as regras de transição permitidas.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status do orçamento alterado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Status inválido"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado"),
            @ApiResponse(responseCode = "422", description = "Transição inválida")
    })
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestBody @Valid BudgetStatusUpdateDTO statusDto) {

        budgetService.updateStatus(id, statusDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar orçamento", description = "Cancela o orçamento alterando seu status para CANCELLED (soft delete).")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Orçamento cancelado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado"),
            @ApiResponse(responseCode = "422", description = "Transição para cancelado inválida")
    })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
