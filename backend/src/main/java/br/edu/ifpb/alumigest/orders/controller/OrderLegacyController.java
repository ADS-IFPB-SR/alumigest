package br.edu.ifpb.alumigest.orders.controller;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderPdfDTO;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderStatusUpdateRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
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

import java.net.URI;
import java.util.UUID;

/**
 * Controller de compatibilidade retroativa para aliases legados de Ordens de Serviço / Pedidos de Venda.
 * <p>
 * Oculto da documentação OpenAPI/Swagger ({@link Hidden}) e marcado como depreciado ({@link Deprecated})
 * para evitar poluição e ambiguidade no contrato principal da API (BUG-040).
 * O contrato canônico oficial da API é exposto exclusivamente via {@link OrderController} em {@code /api/v1/orders}.
 *
 * @deprecated Este controller será removido em versões futuras. Utilize {@link OrderController} em {@code /api/v1/orders}.
 */
@SuppressWarnings("java:S1133")
@Deprecated(since = "1.0")
@Hidden
@RestController
@RequestMapping({"/api/v1/ordens-servico", "/api/orders", "/api/ordens-servico", "/api/pedidos"})
public class OrderLegacyController {

    private final OrderService orderService;

    public OrderLegacyController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderSummaryResponse>> findAll(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) ApprovalChannel channel,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "busca", required = false) String busca,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        String searchTerm = (search != null && !search.isBlank()) ? search : busca;
        PageResponse<OrderSummaryResponse> response = orderService.findAll(status, channel, searchTerm, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/convert/{budgetId}", "/from-budget/{budgetId}"})
    public ResponseEntity<OrderResponse> convertBudgetToOrder(
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
    public ResponseEntity<OrderResponse> findById(@PathVariable UUID id) {
        OrderResponse response = orderService.findDetailedById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/pdf/comprovante")
    public ResponseEntity<byte[]> gerarPdfComprovante(@PathVariable UUID id) {
        OrderPdfDTO pdfDto = orderService.gerarComprovanteById(id);

        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(pdfDto.filename())
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .headers(headers -> headers.setContentDisposition(contentDisposition))
                .contentLength(pdfDto.bytes().length)
                .body(pdfDto.bytes());
    }

    @PatchMapping({"/{id}/production-status", "/{id}/status"})
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody(required = false) @Valid OrderStatusUpdateRequest request,
            @RequestParam(name = "status", required = false) String statusParam) {
        OrderStatus targetStatus = null;
        if (request != null && request.status() != null) {
            targetStatus = request.status();
        } else if (statusParam != null && !statusParam.isBlank()) {
            targetStatus = OrderStatus.fromString(statusParam);
        }

        if (targetStatus == null) {
            throw new IllegalArgumentException("O status de destino é obrigatório.");
        }

        return ResponseEntity.ok(orderService.updateStatus(id, targetStatus));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID id,
            @RequestBody @Valid OrderCancelRequest request) {
        OrderResponse response = orderService.cancelOrder(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping({"/{id}/labels-pdf", "/{id}/etiquetas-pdf"})
    public ResponseEntity<byte[]> gerarPdfEtiquetas(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID itemId) {
        OrderPdfDTO pdfDto = orderService.gerarEtiquetasById(id, itemId);

        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(pdfDto.filename())
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .headers(headers -> headers.setContentDisposition(contentDisposition))
                .contentLength(pdfDto.bytes().length)
                .body(pdfDto.bytes());
    }


    @GetMapping("/{id}/labels-bplb")
    public ResponseEntity<byte[]> baixarScriptBplb(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID itemId) {
        byte[] bplbBytes = orderService.gerarBplbEtiquetasById(id, itemId);
        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename("etiquetas-bplb-" + id + ".prn")
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .headers(headers -> headers.setContentDisposition(contentDisposition))
                .contentLength(bplbBytes.length)
                .body(bplbBytes);
    }
}
