package br.edu.ifpb.alumigest.orders.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("OpenAPI / Swagger 3 — Validação de Contrato Canônico de Orders (BUG-040)")
class OrderOpenApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("OpenAPI deve expor única rota canônica /api/v1/orders e ocultar todos os aliases legados")
    void openApiShouldExposeOnlyCanonicalOrdersRoutes() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(json);
        JsonNode paths = root.path("paths");

        assertThat(paths.isMissingNode()).isFalse();

        // 1. Assegura que as rotas canônicas estão devidamente documentadas
        assertThat(paths.has("/api/v1/orders")).isTrue();
        assertThat(paths.has("/api/v1/orders/{id}")).isTrue();
        assertThat(paths.has("/api/v1/orders/convert/{budgetId}")).isTrue();
        assertThat(paths.has("/api/v1/orders/{id}/pdf/comprovante")).isTrue();
        assertThat(paths.has("/api/v1/orders/{id}/cancel")).isTrue();
        assertThat(paths.has("/api/v1/orders/{id}/status")).isTrue();

        // 2. Assegura que os aliases legados NÃO aparecem na OpenAPI (evitando ambiguidade / duplicação)
        assertThat(paths.has("/api/v1/ordens-servico")).isFalse();
        assertThat(paths.has("/api/v1/ordens-servico/{id}")).isFalse();
        assertThat(paths.has("/api/v1/ordens-servico/convert/{budgetId}")).isFalse();
        assertThat(paths.has("/api/v1/ordens-servico/from-budget/{budgetId}")).isFalse();
        assertThat(paths.has("/api/orders")).isFalse();
        assertThat(paths.has("/api/orders/{id}")).isFalse();
        assertThat(paths.has("/api/orders/convert/{budgetId}")).isFalse();
        assertThat(paths.has("/api/orders/from-budget/{budgetId}")).isFalse();
        assertThat(paths.has("/api/ordens-servico")).isFalse();
        assertThat(paths.has("/api/pedidos")).isFalse();

        // 3. Assegura que o alias de método /from-budget/{budgetId} está oculto da especificação
        assertThat(paths.has("/api/v1/orders/from-budget/{budgetId}")).isFalse();
    }
}
