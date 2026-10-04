package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Pedidos de Venda", description = "Endpoints para consulta e ciclo de vida de pedidos de venda")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @Operation(summary = "Listar pedidos de venda", description = "Lista pedidos de forma paginada com suporte a busca textual e filtro por status.")
    @ApiResponse(responseCode = "200", description = "Lista paginada de pedidos recuperada com sucesso")
    public ResponseEntity<PageResponse<OrderSummaryResponse>> findAll(
            @Parameter(description = "Filtro por status do pedido")
            @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Termo para busca textual (código do pedido ou nome do cliente)")
            @RequestParam(required = false) String busca,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        PageResponse<OrderSummaryResponse> response = orderService.findAll(status, busca, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/convert/{budgetId}", "/from-budget/{budgetId}"})
    @Operation(
            summary = "Converter orçamento em pedido de venda",
            description = "Converte um orçamento (DRAFT, SENT ou APPROVED) em Pedido de Venda,"
                    + " promovendo o status para APPROVED, gerando código sequencial PED-YYYY-NNNN"
                    + " e snapshot imutável dos itens (lock de preços)."
    )
    @ApiResponse(
            responseCode = "201",
            description = "Pedido de venda criado com sucesso",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
    )
    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos")
    @ApiResponse(responseCode = "404", description = "Orçamento não encontrado")
    @ApiResponse(responseCode = "409", description = "Já existe pedido para este orçamento")
    @ApiResponse(responseCode = "422", description = "Orçamento em status inválido (CANCELLED ou REJECTED) ou sem itens")
    public ResponseEntity<OrderResponse> convertBudgetToOrder(
            @Parameter(description = "Identificador único (UUID) do orçamento", required = true)
            @PathVariable UUID budgetId,
            @RequestBody @Valid OrderConvertRequest request) {

        OrderResponse response = orderService.convertBudgetToOrder(budgetId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/orders/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obter detalhes do pedido de venda",
            description = "Recupera os detalhes completos do pedido pelo ID com lock imutável de itens e status fabril."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Pedido recuperado com sucesso",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
    )
    @ApiResponse(responseCode = "400", description = "ID inválido")
    @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    public ResponseEntity<OrderResponse> findById(
            @Parameter(description = "Identificador único (UUID) do pedido", required = true)
            @PathVariable UUID id) {

        OrderResponse response = orderService.findDetailedById(id);
        return ResponseEntity.ok(response);
    }
}