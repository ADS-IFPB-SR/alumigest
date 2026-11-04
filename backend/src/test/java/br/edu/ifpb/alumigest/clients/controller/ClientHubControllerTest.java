package br.edu.ifpb.alumigest.clients.controller;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientBudgetSummaryDto;
import br.edu.ifpb.alumigest.clients.dto.ClientDashboardDto;
import br.edu.ifpb.alumigest.clients.dto.ClientOrderSummaryDto;
import br.edu.ifpb.alumigest.clients.service.ClientHubService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
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
import java.time.LocalDate;
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
    @DisplayName("GET /api/clientes/{id}/dashboard - Deve retornar 404 quando cliente não for encontrado")
    void getDashboard_ShouldReturn404_WhenClientNotFound() throws Exception {
        when(clientHubService.getClientDashboard(clientId))
                .thenThrow(new ResourceNotFoundException("Cliente não encontrado com ID: " + clientId));

        mockMvc.perform(get("/api/clientes/{id}/dashboard", clientId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cliente não encontrado com ID: " + clientId));
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
    @DisplayName("GET /api/clientes/{id}/orders - Deve retornar 200 OK com lista paginada de Ordens de Serviço")
    void getOrders_ShouldReturn200_WhenClientExists() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID orcamentoId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        ClientOrderSummaryDto orderDto = new ClientOrderSummaryDto(
                orderId,
                "OS-2026-0001",
                orcamentoId,
                OrderStatus.WAITING_PRODUCTION,
                "Aguardando Produção",
                ApprovalChannel.WHATSAPP,
                "WhatsApp",
                LocalDate.now(),
                LocalDate.now().plusDays(15),
                null,
                new BigDecimal("3500.00"),
                4,
                now
        );

        PageResponse<ClientOrderSummaryDto> pageResponse = new PageResponse<>(
                List.of(orderDto),
                0,
                10,
                1L,
                1,
                true,
                true
        );

        when(clientHubService.getClientOrders(eq(clientId), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/clientes/{id}/orders", clientId)
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].codigo").value("OS-2026-0001"))
                .andExpect(jsonPath("$.content[0].status").value("WAITING_PRODUCTION"))
                .andExpect(jsonPath("$.content[0].statusDescricao").value("Aguardando Produção"))
                .andExpect(jsonPath("$.content[0].valorLiquido").value(3500.00))
                .andExpect(jsonPath("$.content[0].quantidadeItens").value(4))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/clientes/{id}/orders - Deve retornar 404 quando cliente não for encontrado")
    void getOrders_ShouldReturn404_WhenClientNotFound() throws Exception {
        when(clientHubService.getClientOrders(eq(clientId), any(Pageable.class)))
                .thenThrow(new ResourceNotFoundException("Cliente não encontrado com ID: " + clientId));

        mockMvc.perform(get("/api/clientes/{id}/orders", clientId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cliente não encontrado com ID: " + clientId));
    }
}
