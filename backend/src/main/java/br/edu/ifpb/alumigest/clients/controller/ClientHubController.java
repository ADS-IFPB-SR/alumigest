package br.edu.ifpb.alumigest.clients.controller;

import br.edu.ifpb.alumigest.clients.dto.ClientBudgetSummaryDto;
import br.edu.ifpb.alumigest.clients.dto.ClientDashboardDto;
import br.edu.ifpb.alumigest.clients.service.ClientHubService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping({"/api/clientes", "/api/v1/clients", "/api/v1/customers"})
@Tag(name = "Hub 360° do Cliente", description = "Endpoints para a Central 360° do Cliente, consolidação de KPIs e histórico")
public class ClientHubController {

    private final ClientHubService clientHubService;

    public ClientHubController(ClientHubService clientHubService) {
        this.clientHubService = clientHubService;
    }

    @GetMapping("/{id}/dashboard")
    @Operation(summary = "Obter dados do Hub 360° do cliente", description = "Retorna os dados cadastrais do cliente juntamente com os KPIs de faturamento e volume operacional.")
    @ApiResponse(responseCode = "200", description = "Dados do dashboard carregados com sucesso")
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    public ResponseEntity<ClientDashboardDto> getDashboard(
            @Parameter(description = "Identificador único (UUID) do cliente", required = true)
            @PathVariable UUID id
    ) {
        ClientDashboardDto dashboard = clientHubService.getClientDashboard(id);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/{id}/budgets")
    @Operation(summary = "Listar orçamentos vinculados ao cliente", description = "Retorna página com propostas comerciais e orçamentos vinculados ao cliente.")
    @ApiResponse(responseCode = "200", description = "Lista de orçamentos carregada com sucesso")
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    public ResponseEntity<PageResponse<ClientBudgetSummaryDto>> getBudgets(
            @Parameter(description = "Identificador único (UUID) do cliente", required = true)
            @PathVariable UUID id,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        PageResponse<ClientBudgetSummaryDto> budgets = clientHubService.getClientBudgets(id, pageable);
        return ResponseEntity.ok(budgets);
    }
}
