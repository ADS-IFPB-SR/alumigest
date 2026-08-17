package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AluminumProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MaterialGroupRepository materialGroupRepository;

    private static final String BASE_URL = "/api/v1/catalog/aluminum-profiles";

    @BeforeEach
    void setUp() {
        if (materialGroupRepository.findByCode("ALUMINIO").isEmpty()) {
            MaterialGroup group = new MaterialGroup();
            group.setCode("ALUMINIO");
            group.setName("Perfis de Alumínio e Puxadores");
            group.setCalculationType(CalculationType.LINEAR_METER);
            group.setDescription("Perfis, trilhos e puxadores calculados por metro linear e barras de 3m/6m");
            group.setSystemDefault(true);
            group.setActive(true);
            materialGroupRepository.save(group);
        }
    }

    @Nested
    @DisplayName("POST - Cadastrar perfil de alumínio")
    class PostTests {

        @Test
        @DisplayName("Deve retornar 201 Created ao cadastrar perfil com dados válidos")
        void shouldReturn201WhenCreatingValidProfile() throws Exception {
            Map<String, Object> request = Map.of(
                    "name", "Perfil S83 Linha Rometal",
                    "commercialReference", "S83-POST-TEST",
                    "ncmCode", "76042990",
                    "colorFinish", "Branco",
                    "standardLengthM", 6.00,
                    "costPrice", 45.00,
                    "salePrice", 65.00,
                    "weight", 1.50
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("cadastrado com sucesso")))
                    .andExpect(jsonPath("$.data.id").exists())
                    .andExpect(jsonPath("$.data.commercialReference", is("S83-POST-TEST")))
                    .andExpect(jsonPath("$.data.colorFinish", is("Branco")))
                    .andExpect(jsonPath("$.data.standardLengthM", is(6.00)))
                    .andExpect(jsonPath("$.data.unitMeasure", is("METRO")))
                    .andExpect(jsonPath("$.data.active", is(true)));
        }

        @Test
        @DisplayName("Deve retornar 201 ao cadastrar perfil com barra de 3m")
        void shouldReturn201WhenCreating3mBarProfile() throws Exception {
            Map<String, Object> request = Map.of(
                    "name", "Puxador SPR-060 Linha Alternativa",
                    "commercialReference", "SPR-060-3M",
                    "colorFinish", "Natural",
                    "standardLengthM", 3.00,
                    "costPrice", 30.00,
                    "salePrice", 50.00,
                    "weight", 1.50
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.standardLengthM", is(3.00)))
                    .andExpect(jsonPath("$.data.commercialReference", is("SPR-060-3M")));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request ao enviar body com campos obrigatórios ausentes")
        void shouldReturn400WhenMissingRequiredFields() throws Exception {
            Map<String, Object> request = Map.of(
                    "ncmCode", "76042990"
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)))
                    .andExpect(jsonPath("$.validationErrors").isArray())
                    .andExpect(jsonPath("$.validationErrors", hasSize(greaterThanOrEqualTo(4))));
        }

        @Test
        @DisplayName("Deve retornar 422 ao cadastrar referência comercial duplicada com mesma cor")
        void shouldReturn422WhenDuplicateReferenceAndColor() throws Exception {
            Map<String, Object> request = Map.of(
                    "name", "Perfil SU-001 Duplicado",
                    "commercialReference", "SU-001-DUP",
                    "colorFinish", "Branco",
                    "standardLengthM", 6.00,
                    "costPrice", 40.00,
                    "salePrice", 60.00,
                    "weight", 1.50
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.message", containsString("Já existe um perfil de alumínio")));
        }

        @Test
        @DisplayName("Deve retornar 422 ao cadastrar perfil com comprimento padrão inválido (4.50m)")
        void shouldReturn422WhenInvalidStandardLength() throws Exception {
            Map<String, Object> request = Map.of(
                    "name", "Perfil Inválido",
                    "commercialReference", "INV-001",
                    "colorFinish", "Preto",
                    "standardLengthM", 4.50,
                    "costPrice", 40.00,
                    "salePrice", 60.00,
                    "weight", 1.50
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.message", containsString("Comprimento padrão inválido")));
        }
    }

    @Nested
    @DisplayName("GET - Listar perfis de alumínio")
    class GetAllTests {

        @Test
        @DisplayName("Deve retornar 200 OK com lista paginada de perfis")
        void shouldReturn200WithPaginatedList() throws Exception {
            Map<String, Object> request = Map.of(
                    "name", "Perfil Listagem Test",
                    "commercialReference", "LIST-001",
                    "colorFinish", "Bronze",
                    "standardLengthM", 6.00,
                    "costPrice", 35.00,
                    "salePrice", 55.00,
                    "weight", 1.50
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            mockMvc.perform(get(BASE_URL)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.content").isArray())
                    .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(1)));
        }

        @Test
        @DisplayName("Deve filtrar perfis por cor/acabamento")
        void shouldFilterByColorFinish() throws Exception {
            Map<String, Object> request = Map.of(
                    "name", "Perfil Filtro Cor",
                    "commercialReference", "FILTER-COLOR-001",
                    "colorFinish", "Champagne",
                    "standardLengthM", 3.00,
                    "costPrice", 42.00,
                    "salePrice", 62.00,
                    "weight", 1.50
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            mockMvc.perform(get(BASE_URL)
                            .param("colorFinish", "Champagne")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content").isArray())
                    .andExpect(jsonPath("$.data.content[*].colorFinish",
                            everyItem(containsStringIgnoringCase("Champagne"))));
        }
    }

    @Nested
    @DisplayName("GET - Buscar perfil por ID")
    class GetByIdTests {

        @Test
        @DisplayName("Deve retornar 200 OK ao buscar perfil existente por UUID")
        void shouldReturn200WhenProfileExists() throws Exception {
            Map<String, Object> request = Map.of(
                    "name", "Perfil GetById Test",
                    "commercialReference", "GETID-001",
                    "colorFinish", "Branco",
                    "standardLengthM", 6.00,
                    "costPrice", 40.00,
                    "salePrice", 60.00,
                    "weight", 1.50
            );

            MvcResult createResult = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String createdId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                    .path("data").path("id").asText();

            mockMvc.perform(get(BASE_URL + "/" + createdId)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(createdId)))
                    .andExpect(jsonPath("$.data.commercialReference", is("GETID-001")));
        }

        @Test
        @DisplayName("Deve retornar 404 Not Found ao buscar perfil com UUID inexistente")
        void shouldReturn404WhenProfileNotFound() throws Exception {
            String fakeId = "00000000-0000-0000-0000-000000000000";

            mockMvc.perform(get(BASE_URL + "/" + fakeId)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message", containsString("Perfil de alumínio não encontrado")));
        }
    }

    @Nested
    @DisplayName("PUT - Atualizar preços")
    class PutTests {

        @Test
        @DisplayName("Deve retornar 200 OK ao atualizar preços de perfil existente")
        void shouldReturn200WhenUpdatingPrices() throws Exception {
            Map<String, Object> createRequest = Map.of(
                    "name", "Perfil Update Test",
                    "commercialReference", "UPD-001",
                    "colorFinish", "Natural",
                    "standardLengthM", 6.00,
                    "costPrice", 40.00,
                    "salePrice", 60.00,
                    "weight", 1.50
            );

            MvcResult createResult = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String createdId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                    .path("data").path("id").asText();

            Map<String, Object> updateRequest = Map.of(
                    "commercialReference", "REF-001",
                    "name", "Perfil Atualizado",
                    "colorFinish", "Branco",
                    "weight", 1.5,
                    "standardLengthM", 6.0,
                    "costPrice", 55.00,
                    "salePrice", 80.00
            );

            mockMvc.perform(put(BASE_URL + "/" + createdId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("Preços atualizados")))
                    .andExpect(jsonPath("$.data.costPrice", is(55.00)))
                    .andExpect(jsonPath("$.data.salePrice", is(80.00)));
        }
    }

    @Nested
    @DisplayName("DELETE - Soft delete")
    class DeleteTests {

        @Test
        @DisplayName("Deve retornar 204 No Content ao inativar perfil existente")
        void shouldReturn204WhenSoftDeletingProfile() throws Exception {
            Map<String, Object> createRequest = Map.of(
                    "name", "Perfil Delete Test",
                    "commercialReference", "DEL-001",
                    "colorFinish", "Preto",
                    "standardLengthM", 3.00,
                    "costPrice", 35.00,
                    "salePrice", 55.00,
                    "weight", 1.50
            );

            MvcResult createResult = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String createdId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                    .path("data").path("id").asText();

            mockMvc.perform(delete(BASE_URL + "/" + createdId))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL + "/" + createdId)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.active", is(false)));
        }
    }
}
