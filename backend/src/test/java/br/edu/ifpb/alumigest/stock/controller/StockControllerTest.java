package br.edu.ifpb.alumigest.stock.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.stock.domain.StockAlertStatus;
import br.edu.ifpb.alumigest.stock.domain.StockSortField;
import br.edu.ifpb.alumigest.stock.dto.StockBalanceFilter;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.service.StockService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("StockController — Testes MockMvc do Endpoint GET /api/v1/stock (US-22.1)")
class StockControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StockService stockService;

    @InjectMocks
    private StockController stockController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(stockController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    private StockItemResponseDTO sampleItem(
            String sku,
            String name,
            String category,
            BigDecimal available,
            StockAlertStatus status) {
        return new StockItemResponseDTO(
            UUID.randomUUID(),
            UUID.randomUUID(),
            sku,
            name,
            category,
            "M2",
            new BigDecimal("10.0000"),
            new BigDecimal("10.0000").subtract(available),
            available,
            new BigDecimal("5.0000"),
            status,
            OffsetDateTime.now()
        );
    }

    @Test
    @DisplayName("[Partição de Equivalência] GET /api/v1/stock sem filtros deve usar ordenação NAME")
    void shouldListAllBalancesWithDefaultSortWhenNoParamsProvided() throws Exception {
        StockItemResponseDTO item = sampleItem(
            "VID-008",
            "Vidro Temperado 8mm",
            "GLASS",
            new BigDecimal("8.0000"),
            StockAlertStatus.IN_STOCK
        );
        when(stockService.listStockBalances(any())).thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/stock"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].materialSku", is("VID-008")))
            .andExpect(jsonPath("$[0].alertStatus", is("IN_STOCK")));

        ArgumentCaptor<StockBalanceFilter> captor =
            ArgumentCaptor.forClass(StockBalanceFilter.class);
        verify(stockService).listStockBalances(captor.capture());
        StockBalanceFilter captured = captor.getValue();
        org.assertj.core.api.Assertions.assertThat(captured.effectiveSort())
            .isEqualTo(StockSortField.NAME);
        org.assertj.core.api.Assertions.assertThat(captured.needsPurchase()).isNull();
        org.assertj.core.api.Assertions.assertThat(captured.belowMinStock()).isNull();
    }

    @Test
    @DisplayName("[Tabela de Decisão] GET /api/v1/stock deve encaminhar needsPurchase, belowMinStock e sort")
    void shouldForwardProcurementFiltersAndSortToService() throws Exception {
        StockItemResponseDTO deficit = sampleItem(
            "PER-001",
            "Perfil Suprema",
            "PROFILE",
            new BigDecimal("-6.0000"),
            StockAlertStatus.NEED_PURCHASE
        );
        when(stockService.listStockBalances(any())).thenReturn(List.of(deficit));

        mockMvc.perform(get("/api/v1/stock")
                .param("category", "PROFILE")
                .param("needsPurchase", "true")
                .param("belowMinStock", "true")
                .param("search", "Suprema")
                .param("sort", "CRITICALITY"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].alertStatus", is("NEED_PURCHASE")));

        ArgumentCaptor<StockBalanceFilter> captor =
            ArgumentCaptor.forClass(StockBalanceFilter.class);
        verify(stockService).listStockBalances(captor.capture());
        StockBalanceFilter filter = captor.getValue();
        org.assertj.core.api.Assertions.assertThat(filter.category()).isEqualTo("PROFILE");
        org.assertj.core.api.Assertions.assertThat(filter.needsPurchase()).isTrue();
        org.assertj.core.api.Assertions.assertThat(filter.belowMinStock()).isTrue();
        org.assertj.core.api.Assertions.assertThat(filter.search()).isEqualTo("Suprema");
        org.assertj.core.api.Assertions.assertThat(filter.sort())
            .isEqualTo(StockSortField.CRITICALITY);
    }

    @Test
    @DisplayName("[Partição de Equivalência] GET /api/v1/stock deve retornar 422 para sort fora da whitelist")
    void shouldReturnUnprocessableEntityWhenSortParamIsInvalid() throws Exception {
        mockMvc.perform(get("/api/v1/stock").param("sort", "DROP_TABLE"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.message").exists());

        verifyNoInteractions(stockService);
    }
}
