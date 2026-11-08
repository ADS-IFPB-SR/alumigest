package br.edu.ifpb.alumigest.partsale.controller;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleRequest;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleResponse;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleStatusUpdateRequest;
import br.edu.ifpb.alumigest.partsale.service.PartSaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Controller REST oficial para o Módulo de Venda Avulsa de Partes (US-46).
 */
@RestController
@RequestMapping("/api/v1/part-sales")
@Tag(name = "Part Sales",
    description = "Endpoints para cotação e venda avulsa de partes "
        + "(vidros, perfis de alumínio, ferragens e películas)")
public class PartSaleController {

  private final PartSaleService partSaleService;

  public PartSaleController(PartSaleService partSaleService) {
    this.partSaleService = partSaleService;
  }

  @PostMapping("/calculate-item")
  @Operation(
      summary = "Pré-cálculo de item avulso",
      description = "Calcula a metragem faturável e o valor total do insumo em tempo real sem persistência."
  )
  @ApiResponse(responseCode = "200", description = "Item calculado com sucesso")
  public ResponseEntity<CalculatePartItemResponse> calculateItem(
      @RequestBody @Valid CalculatePartItemRequest request) {
    CalculatePartItemResponse response = partSaleService.calculateItem(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @Operation(summary = "Cria uma nova proposta de venda avulsa de partes",
      description = "Persiste a venda avulsa com status DRAFT ou APPROVED")
  @ApiResponse(responseCode = "201", description = "Venda de partes criada com sucesso")
  public ResponseEntity<PartSaleResponse> create(
      @RequestBody @Valid CreatePartSaleRequest request) {
    // CORREÇÃO: Chamar o serviço de criação de venda, e não o de cálculo
    PartSaleResponse response = partSaleService.create(request);
    
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(response.id())
        .toUri();
    return ResponseEntity.created(location).body(response);
  }

  @GetMapping
  @Operation(
      summary = "Listar vendas e propostas avulsas",
      description = "Lista vendas avulsas de partes com paginação, ordenação decrescente por data e filtros por texto (código ou cliente) e status."
  )
  @ApiResponse(responseCode = "200", description = "Lista paginada de vendas avulsas recuperada com sucesso")
  public ResponseEntity<PageResponse<PartSaleResponse>> findAll(
      @Parameter(description = "Filtro por status comercial da venda (DRAFT, APPROVED, CANCELLED)")
      @RequestParam(required = false) PartSaleStatus status,
      @Parameter(description = "Termo de busca textual por código ou nome do cliente", example = "VP-2026")
      @RequestParam(name = "search", required = false) String search,
      @Parameter(hidden = true)
      @RequestParam(name = "busca", required = false) String busca,
      @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    String searchTerm = (search != null && !search.isBlank()) ? search : busca;
    PageResponse<PartSaleResponse> response = partSaleService.findAll(searchTerm, status, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Busca detalhes de uma venda avulsa por ID")
  @ApiResponse(responseCode = "200", description = "Venda localizada com sucesso")
  @ApiResponse(responseCode = "404", description = "Venda de partes não encontrada")
  public ResponseEntity<PartSaleResponse> findById(@PathVariable UUID id) {
    PartSaleResponse response = partSaleService.findById(id);
    return ResponseEntity.ok(response);
  }

  @PatchMapping("/{id}/status")
  @Operation(summary = "Atualiza o status comercial de uma venda avulsa")
  @ApiResponse(responseCode = "200", description = "Status atualizado com sucesso")
  @ApiResponse(responseCode = "400", description = "Transição inválida de status")
  public ResponseEntity<PartSaleResponse> updateStatus(
      @PathVariable UUID id,
      @RequestBody @Valid PartSaleStatusUpdateRequest request) {
    PartSaleResponse response = partSaleService.updateStatus(id, request.status());
    return ResponseEntity.ok(response);
  }
}