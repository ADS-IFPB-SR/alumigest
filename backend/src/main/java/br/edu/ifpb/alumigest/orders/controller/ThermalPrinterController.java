package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.orders.dto.PrinterInfoDTO;
import br.edu.ifpb.alumigest.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST para descoberta e listagem de impressoras instaladas no sistema operacional.
 * US-17 / Correções #492 e #493.
 */
@RestController
@RequestMapping("/api/printers")
@Tag(name = "Impressoras", description = "Endpoints para gerenciamento e listagem de impressoras do sistema operacional")
public class ThermalPrinterController {

    private final OrderService orderService;

    public ThermalPrinterController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Lista as impressoras disponíveis no sistema operacional local.
     */
    @GetMapping
    @Operation(
            summary = "Listar impressoras instaladas no sistema operacional",
            description = "Retorna a relação de impressoras disponíveis, indicando a impressora padrão e potenciais impressoras térmicas."
    )
    public ResponseEntity<List<PrinterInfoDTO>> listarImpressoras() {
        return ResponseEntity.ok(orderService.listAvailablePrinters());
    }
}
