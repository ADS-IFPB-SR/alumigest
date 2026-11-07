package br.edu.ifpb.alumigest.clients.controller;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientBudgetSummaryDto;
import br.edu.ifpb.alumigest.clients.dto.ClientDashboardDto;
import br.edu.ifpb.alumigest.clients.dto.ClientOrderItemDto;
import br.edu.ifpb.alumigest.clients.dto.ClientOrderSummaryDto;
import br.edu.ifpb.alumigest.clients.service.ClientHubService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ClientHubControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClientHubService clientHubService;

    @InjectMocks
    private ClientHubController clientHubController;

    private UUID clientId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(clientHubController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
        clientId = UUID.randomUUID();
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/dashboard - Deve retornar 200 OK com dados do dashboard")
    void getDashboard_ShouldReturn200_WhenClientExists() throws Exception {
        ClientDashboardDto dto = new ClientDashboardDto(
                clientId,
                "Antônio Alfredo Figueiredo",
                PersonType.FISICA,
                "042.891.444-09",
                "(83) 98845-2100",
                "antonio@exemplo.com",
                "Torre",
                "João Pessoa",
                "PB",
                new BigDecimal("4133.90"),
                4L,
                2L
        );

        when(clientHubService.getClientDashboard(clientId)).thenReturn(dto);

        mockMvc.perform(get("/api/clientes/{id}/dashboard", clientId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clientId.toString()))
                .andExpect(jsonPath("$.nomeCompleto").value("Antônio Alfredo Figueiredo"))
                .andExpect(jsonPath("$.personType").value("FISICA"))
                .andExpect(jsonPath("$.documento").value("042.891.444-09"))
                .andExpect(jsonPath("$.telefone").value("(83) 98845-2100"))
                .andExpect(jsonPath("$.bairro").value("Torre"))
                .andExpect(jsonPath("$.cidade").value("João Pessoa"))
                .andExpect(jsonPath("$.uf").value("PB"))
                .andExpect(jsonPath("$.totalContratado").value(4133.90))
                .andExpect(jsonPath("$.quantidadeOrdensServico").value(4))
                .andExpect(jsonPath("$.quantidadeOrcamentos").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/clients/{id}/dashboard - Deve aceitar alias v1/clients")
    void getDashboard_ShouldSupportV1ClientsRoute() throws Exception {
        ClientDashboardDto dto = new ClientDashboardDto(
                clientId,
                "Maria Silva",
                PersonType.FISICA,
                "111.222.333-44",
                "(83) 99999-8888",
                "maria@exemplo.com",
                "Centro",
                "Santa Rita",
                "PB",
                BigDecimal.ZERO,
                0L,
                0L
        );

        when(clientHubService.getClientDashboard(clientId)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/clients/{id}/dashboard", clientId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeCompleto").value("Maria Silva"));
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/dashboard - Deve retornar 404 quando cliente não existir")
    void getDashboard_ShouldReturn404_WhenClientNotFound() throws Exception {
        when(clientHubService.getClientDashboard(clientId))
                .thenThrow(new ResourceNotFoundException("Cliente não encontrado com ID: " + clientId));

        mockMvc.perform(get("/api/clientes/{id}/dashboard", clientId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/budgets - Deve retornar 200 OK com lista paginada de orçamentos")
    void getBudgets_ShouldReturn200_WhenClientExists() throws Exception {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        ClientBudgetSummaryDto budgetDto = new ClientBudgetSummaryDto(
                UUID.randomUUID(),
                "AORC-1024",
                now,
                now.plusDays(15),
                new BigDecimal("2067.88"),
                BudgetStatus.APPROVED,
                "Aprovado"
        );

        PageResponse<ClientBudgetSummaryDto> pageResponse = new PageResponse<>(
                List.of(budgetDto),
                0,
                10,
                1L,
                1,
                true,
                true
        );

        when(clientHubService.getClientBudgets(eq(clientId), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/clientes/{id}/budgets", clientId)
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].codigo").value("AORC-1024"))
                .andExpect(jsonPath("$.content[0].valorTotal").value(2067.88))
                .andExpect(jsonPath("$.content[0].status").value("APPROVED"))
                .andExpect(jsonPath("$.content[0].statusDescricao").value("Aprovado"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/clientes/{id}/orders - Deve retornar 200 OK com lista de O.S. e esquadrias")
    void getOrders_ShouldReturn200_WithOrdersAndItems() throws Exception {
        ClientOrderItemDto item = new ClientOrderItemDto(
                UUID.randomUUID(),
                "Janela de Correr 2 Folhas",
                1200,
                1400,
                2,
                "Natural",
                "Mini Boreal",
                new BigDecimal("1800.00")
        );

        ClientOrderSummaryDto orderDto = new ClientOrderSummaryDto(
                UUID.randomUUID(),
                "OS-2026-0042",
                java.time.LocalDate.of(2026, 10, 1),
                br.edu.ifpb.alumigest.orders.domain.OrderStatus.IN_PRODUCTION,
                "Em Produção",
                new BigDecimal("1800.00"),
                2,
                List.of(item)
        );

        when(clientHubService.getClientOrders(clientId)).thenReturn(List.of(orderDto));

        mockMvc.perform(get("/api/v1/clientes/{id}/orders", clientId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("OS-2026-0042"))
                .andExpect(jsonPath("$[0].status").value("IN_PRODUCTION"))
                .andExpect(jsonPath("$[0].statusDescricao").value("Em Produção"))
                .andExpect(jsonPath("$[0].totalEsquadrias").value(2))
                .andExpect(jsonPath("$[0].items[0].descricao").value("Janela de Correr 2 Folhas"))
                .andExpect(jsonPath("$[0].items[0].larguraMm").value(1200))
                .andExpect(jsonPath("$[0].items[0].alturaMm").value(1400));
    }

    @Test
    @DisplayName("GET /api/v1/clientes/{id}/orders - Deve retornar 404 quando cliente não existir")
    void getOrders_ShouldReturn404_WhenClientNotFound() throws Exception {
        when(clientHubService.getClientOrders(clientId))
                .thenThrow(new ResourceNotFoundException("Cliente não encontrado com ID: " + clientId));

        mockMvc.perform(get("/api/v1/clientes/{id}/orders", clientId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
