package br.edu.ifpb.alumigest.partsale.controller;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.calculator.AluminumProfilePartCalculator;
import br.edu.ifpb.alumigest.partsale.calculator.PartCalculatorFactory;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PartSaleControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AluminumProfilePartCalculator profileCalculator = new AluminumProfilePartCalculator();
        PartCalculatorFactory factory = new PartCalculatorFactory(List.of(profileCalculator));
        PartSaleController controller = new PartSaleController(factory);

        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        this.objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Deve calcular com sucesso item de perfil de alumínio e retornar 200 OK")
    void deveRetornar200ECalculoCorretoParaPerfilDeAluminio() throws Exception {
        // 2500 mm * 4 peças com 5% de perda (0.05) = 10.5000 m faturáveis * 45.00 = R$ 472,50
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            2500,
            4,
            new BigDecimal("45.00"),
            new BigDecimal("0.05")
        );

        mockMvc.perform(post("/api/v1/part-sales/calculate-item")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.calculatedUnitMeasure", is(10.5000)))
            .andExpect(jsonPath("$.unitPrice", is(45.00)))
            .andExpect(jsonPath("$.totalPrice", is(472.50)));
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request quando a quantidade for nula ou menor que 1")
    void deveRetornar400QuandoQuantidadeInvalida() throws Exception {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            2500,
            0, // Inválido (@Positive)
            new BigDecimal("45.00"),
            BigDecimal.ZERO
        );

        mockMvc.perform(post("/api/v1/part-sales/calculate-item")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request quando a categoria for nula")
    void deveRetornar400QuandoCategoriaNula() throws Exception {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            null, // Inválido (@NotNull)
            null,
            2500,
            1,
            new BigDecimal("45.00"),
            BigDecimal.ZERO
        );

        mockMvc.perform(post("/api/v1/part-sales/calculate-item")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
