package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.service.IOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Pedidos de Venda", description = "Endpoints para gerenciamento de pedidos de venda")
public class OrderController {

    private final IOrderService orderService;

    public OrderController(IOrderService orderService) {
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
}