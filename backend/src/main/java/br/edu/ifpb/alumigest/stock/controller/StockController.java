package br.edu.ifpb.alumigest.stock.controller;

import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import br.edu.ifpb.alumigest.stock.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@Tag(name = "Estoque", description = "Gestão de saldos de almoxarifado, reservas Make-to-Order e trilha de auditoria Kardex")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    @Operation(
        summary = "Listar saldos consolidados de estoque",
        description = "Retorna a relação de todos os itens cadastrados no almoxarifado com saldos físico, reservado e disponível (RN-01)."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista de saldos recuperada com sucesso",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = StockItemResponseDTO.class)))
        )
    })
    public ResponseEntity<List<StockItemResponseDTO>> listBalances() {
        return ResponseEntity.ok(stockService.listStockBalances());
    }

    @GetMapping("/materials/{materialId}")
    @Operation(
        summary = "Consultar saldo consolidado de um material",
        description = "Recupera o saldo atual (físico, reservado, disponível e estoque mínimo) de um material específico pelo seu ID."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Saldo do material recuperado com sucesso",
            content = @Content(schema = @Schema(implementation = StockItemResponseDTO.class))
        ),
        @ApiResponse(responseCode = "400", description = "Identificador de material inválido"),
        @ApiResponse(responseCode = "404", description = "Item de estoque não encontrado para o material informado")
    })
    public ResponseEntity<StockItemResponseDTO> getBalance(
            @Parameter(description = "Identificador único (UUID) do material no catálogo", required = true)
            @PathVariable UUID materialId) {
        return ResponseEntity.ok(stockService.getStockBalance(materialId));
    }

    @GetMapping("/movements")
    @Operation(
        summary = "Listar trilha de movimentações Kardex",
        description = "Retorna o histórico cronológico de movimentações de estoque (auditoria append-only), com filtro opcional por material."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Trilha de movimentações Kardex recuperada com sucesso",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = StockMovementResponseDTO.class)))
        )
    })
    public ResponseEntity<List<StockMovementResponseDTO>> listMovements(
            @Parameter(description = "Identificador opcional do material para filtrar as movimentações")
            @RequestParam(required = false) UUID materialId) {
        return ResponseEntity.ok(stockService.listMovements(materialId));
    }

    @PostMapping("/movements")
    @Operation(
        summary = "Registrar movimentação manual de estoque",
        description = "Registra uma entrada por compra (PURCHASE_ENTRY), ajuste manual (MANUAL_ADJUSTMENT) ou perda por sucata (SCRAP_LOSS)."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Movimentação registrada com sucesso no Kardex",
            content = @Content(schema = @Schema(implementation = StockMovementResponseDTO.class))
        ),
        @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos ou campos obrigatórios ausentes"),
        @ApiResponse(responseCode = "422", description = "Regra de negócio violada (ex: saldo físico insuficiente para saída ou tipo restrito ao fluxo de produção)")
    })
    public ResponseEntity<StockMovementResponseDTO> registerMovement(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Payload com os dados da movimentação manual de estoque",
                required = true
            )
            @RequestBody @Valid StockMovementRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.registerMovement(request));
    }

    @PostMapping("/reserve-for-order/{orderId}")
    @Operation(
        summary = "Reservar materiais para Ordem de Serviço (Make-to-Order)",
        description = "Aloca a reserva dos materiais demandados por uma Ordem de Serviço aprovada. Não bloqueante mesmo se o saldo disponível for insuficiente (RN-05)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Reserva efetuada com sucesso (ou ignorada por idempotência caso já existam reservas ativas)"),
        @ApiResponse(responseCode = "400", description = "Identificador de Ordem de Serviço inválido"),
        @ApiResponse(responseCode = "404", description = "Ordem de Serviço não encontrada")
    })
    public ResponseEntity<Void> reserveForOrder(
            @Parameter(description = "Identificador único (UUID) da Ordem de Serviço", required = true)
            @PathVariable UUID orderId) {
        stockService.reserveMaterialsForOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/consume-for-order/{orderId}")
    @Operation(
        summary = "Efetuar baixa física definitiva dos materiais reservados da O.S.",
        description = "Converte as reservas ativas da O.S. em baixa física definitiva ao concluir a fabricação (STATUS COMPLETED), preservando a invariante de saldo disponível."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Baixa física registrada com sucesso no Kardex"),
        @ApiResponse(responseCode = "400", description = "Identificador de Ordem de Serviço inválido"),
        @ApiResponse(responseCode = "404", description = "Ordem de Serviço não encontrada")
    })
    public ResponseEntity<Void> consumeForOrder(
            @Parameter(description = "Identificador único (UUID) da Ordem de Serviço", required = true)
            @PathVariable UUID orderId) {
        stockService.consumeReservedMaterialsForOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cancel-reservations/{orderId}")
    @Operation(
        summary = "Estornar reservas de materiais de uma O.S. cancelada",
        description = "Libera as reservas alocadas para uma O.S. cancelada, recompondo o saldo disponível no almoxarifado."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Estorno de reservas concluído com sucesso"),
        @ApiResponse(responseCode = "400", description = "Identificador de Ordem de Serviço inválido"),
        @ApiResponse(responseCode = "404", description = "Ordem de Serviço não encontrada")
    })
    public ResponseEntity<Void> cancelReservationsForOrder(
            @Parameter(description = "Identificador único (UUID) da Ordem de Serviço", required = true)
            @PathVariable UUID orderId) {
        stockService.cancelReservationsForOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}
