package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.ProductCategory;
import br.edu.ifpb.alumigest.catalog.dto.ProductCategoryRequestDTO;
import br.edu.ifpb.alumigest.catalog.repository.ProductCategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductCategoryController.class)
@DisplayName("Testes do ProductCategoryController")
class ProductCategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductCategoryRepository categoryRepository;

    @Nested
    @DisplayName("GET /api/v1/catalog/product-categories")
    class FindAllActiveTests {

        @Test
        @DisplayName("Deve retornar lista de categorias ativas com status 200")
        void shouldReturnActiveCategories() throws Exception {
            ProductCategory cat1 = new ProductCategory();
            cat1.setId(UUID.randomUUID());
            cat1.setName("Portas de Giro");
            cat1.setDescription("Portas convencionais");
            cat1.setActive(true);

            ProductCategory cat2 = new ProductCategory();
            cat2.setId(UUID.randomUUID());
            cat2.setName("Janelas");
            cat2.setActive(false); // inativo, não deve vir

            when(categoryRepository.findAll()).thenReturn(List.of(cat1, cat2));

            mockMvc.perform(get("/api/v1/catalog/product-categories"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.length()").value(1))
                    .andExpect(jsonPath("$.data[0].name").value("Portas de Giro"));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/catalog/product-categories")
    class CreateTests {

        @Test
        @DisplayName("Deve criar nova categoria e retornar 201 Created")
        void shouldCreateCategorySuccessfully() throws Exception {
            ProductCategoryRequestDTO request = new ProductCategoryRequestDTO("Gavetas", "Frentes de gavetas");

            ProductCategory saved = new ProductCategory();
            saved.setId(UUID.randomUUID());
            saved.setName("Gavetas");
            saved.setDescription("Frentes de gavetas");
            saved.setActive(true);

            when(categoryRepository.save(any(ProductCategory.class))).thenReturn(saved);

            mockMvc.perform(post("/api/v1/catalog/product-categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.name").value("Gavetas"))
                    .andExpect(jsonPath("$.data.description").value("Frentes de gavetas"));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request ao tentar criar categoria com nome em branco")
        void shouldReturn400WhenNameIsBlank() throws Exception {
            ProductCategoryRequestDTO request = new ProductCategoryRequestDTO("", "Desc");

            mockMvc.perform(post("/api/v1/catalog/product-categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
