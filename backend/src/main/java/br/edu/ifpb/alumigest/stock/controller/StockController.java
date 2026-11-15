package br.edu.ifpb.alumigest.stock.controller;

import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import br.edu.ifpb.alumigest.stock.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para operações de saldo de estoque, movimentações Kardex
 * e automação de reservas/baixas/estornos de Ordens de Serviço.
 */
@RestController
@RequestMapping("/api/v1/stock")
@Tag(name = "Estoque", description = "Gestão de saldos de almoxarifado, reservas e trilha Kardex")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    @Operation(summary = "Listar saldos consolidados de estoque")
    public ResponseEntity<List<StockItemResponseDTO>> listBalances() {
        return ResponseEntity.ok(stockService.listStockBalances());
    }

    @GetMapping("/materials/{materialId}")
    @Operation(summary = "Consultar saldo consolidado de um material")
    public ResponseEntity<StockItemResponseDTO> getBalance(@PathVariable UUID materialId) {
        return ResponseEntity.ok(stockService.getStockBalance(materialId));
    }

    @GetMapping("/movements")
    @Operation(summary = "Listar trilha de movimentações Kardex")
    public ResponseEntity<List<StockMovementResponseDTO>> listMovements(
            @RequestParam(required = false) UUID materialId) {
        return ResponseEntity.ok(stockService.listMovements(materialId));
    }

    @PostMapping("/movements")
    @Operation(summary = "Registrar movimentação manual de estoque")
    public ResponseEntity<StockMovementResponseDTO> registerMovement(
            @RequestBody @Valid StockMovementRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.registerMovement(request));
    }

    @PostMapping("/reserve-for-order/{orderId}")
    @Operation(summary = "Reservar materiais para Ordem de Serviço (Make-to-Order)")
    public ResponseEntity<Void> reserveForOrder(@PathVariable UUID orderId) {
        stockService.reserveMaterialsForOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/consume-for-order/{orderId}")
    @Operation(summary = "Efetuar baixa física definitiva dos materiais reservados da O.S.")
    public ResponseEntity<Void> consumeForOrder(@PathVariable UUID orderId) {
        stockService.consumeReservedMaterialsForOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cancel-reservations/{orderId}")
    @Operation(summary = "Estornar reservas de materiais de uma O.S. cancelada")
    public ResponseEntity<Void> cancelReservationsForOrder(@PathVariable UUID orderId) {
        stockService.cancelReservationsForOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}

