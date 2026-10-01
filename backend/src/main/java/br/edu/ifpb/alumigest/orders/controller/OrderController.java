package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST para consulta e ciclo de vida de Pedidos de Venda.
 */
@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Pedidos de Venda", description = "Endpoints para consulta e ciclo de vida de pedidos de venda")
public class OrderController {

  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
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
  @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
  public ResponseEntity<OrderResponse> findById(
      @Parameter(description = "Identificador único (UUID) do pedido", required = true)
      @PathVariable UUID id
  ) {
    OrderResponse response = orderService.findDetailedById(id);
    return ResponseEntity.ok(response);
  }
}
