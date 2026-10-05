package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.common.dto.ErrorResponse;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
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

/**
 * Controller REST para consulta e ciclo de vida de Ordens de Serviço / Pedidos de Venda.
 * Depende da abstração {@link OrderService}, nunca da implementação concreta (DIP).
 */
@RestController
@RequestMapping({"/api/v1/orders", "/api/orders", "/api/ordens-servico", "/api/pedidos"})
@Tag(name = "Ordens de Serviço", description = "Endpoints para consulta, criação, conversão e ciclo de vida de ordens de serviço (pedidos de venda)")
public class OrderController {

    private final OrderService orderService;

    /**
     * Injeção de dependência via construtor (DIP / testabilidade).
     *
     * @param orderService serviço de pedidos de venda
     */
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Lista pedidos de venda de forma paginada com suporte a filtros dinâmicos.
     *
     * @param status   filtro opcional por status do pedido
     * @param channel  filtro opcional por canal de aprovação
     * @param search   termo para busca textual (código do pedido, cliente ou código do orçamento)
     * @param busca    alias retrocompatível para busca textual
     * @param pageable parâmetros de paginação e ordenação
     * @return 200 OK com página de pedidos sumarizados
     */
    @GetMapping
    @Operation(
            summary = "Listar pedidos de venda",
            description = "Lista pedidos de venda de forma paginada com suporte a ordenação, busca textual (código do pedido, cliente ou código do orçamento) e filtros por status e canal de aprovação."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista paginada de pedidos recuperada com sucesso",
            content = @Content(schema = @Schema(implementation = PageResponse.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Parâmetros de consulta ou ordenação inválidos",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    public ResponseEntity<PageResponse<OrderSummaryResponse>> findAll(
            @Parameter(description = "Filtro por status do pedido (CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO)")
            @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Filtro por canal de aprovação (WHATSAPP, PRESENCIAL, TELEFONE, EMAIL, OUTRO)")
            @RequestParam(required = false) ApprovalChannel channel,
            @Parameter(description = "Termo para busca textual (código do pedido PED-YYYY-NNNN, cliente ou orçamento)", example = "PED-2026-0001")
            @RequestParam(name = "search", required = false) String search,
            @Parameter(hidden = true)
            @RequestParam(name = "busca", required = false) String busca,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        String searchTerm = (search != null && !search.isBlank()) ? search : busca;
        PageResponse<OrderSummaryResponse> response = orderService.findAll(status, channel, searchTerm, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Converte um orçamento elegível em pedido de venda.
     *
     * <p>Regras de negócio aplicadas no service:
     * <ul>
     *   <li>O orçamento deve existir e estar em status DRAFT, SENT ou APPROVED.</li>
     *   <li>O orçamento deve possuir ao menos um item.</li>
     *   <li>O status do orçamento é promovido para APPROVED atomicamente (se não estiver).</li>
     *   <li>Não pode haver pedido já criado para o mesmo orçamento (idempotência).</li>
     * </ul>
     *
     * @param budgetId ID do orçamento a ser convertido
     * @param request  dados da aprovação (canal, previsão de entrega, observações)
     * @return 201 Created com o pedido gerado no corpo
     */
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
    @ApiResponse(
            responseCode = "400",
            description = "Dados de entrada inválidos ou payload malformado",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Orçamento de origem não encontrado",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    @ApiResponse(
            responseCode = "409",
            description = "Conflito: já existe pedido de venda gerado para este orçamento",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    @ApiResponse(
            responseCode = "422",
            description = "Regra de negócio violada: orçamento cancelado, rejeitado ou sem itens cadastrados",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
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

    /**
     * Recupera os detalhes completos do pedido de venda pelo seu ID.
     *
     * @param id Identificador único (UUID) do pedido
     * @return 200 OK com o DTO detalhado do pedido e seus itens congelados
     */
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
    @ApiResponse(
            responseCode = "400",
            description = "Identificador de pedido inválido (UUID malformado)",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Pedido não encontrado",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    public ResponseEntity<OrderResponse> findById(
            @Parameter(description = "Identificador único (UUID) do pedido", required = true)
            @PathVariable UUID id) {

        OrderResponse response = orderService.findDetailedById(id);
        return ResponseEntity.ok(response);
    }
}