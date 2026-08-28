package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.ProductItemRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import br.edu.ifpb.alumigest.catalog.service.IProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    private MockMvc mockMvc;

    @Mock
    private IProductService productService;

    @InjectMocks
    private ProductController productController;

    private ObjectMapper objectMapper;
    private UUID categoryId;
    private UUID productId;
    private ProductItemRequestDTO validItem; // Item adicionado para passar no @NotEmpty

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        categoryId = UUID.randomUUID();
        productId = UUID.randomUUID();
        validItem = new ProductItemRequestDTO(UUID.randomUUID(), new BigDecimal("1.5"));

        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    // ==========================================
    // CENÁRIOS DE CRIAÇÃO (POST)
    // ==========================================

    @Test
    @DisplayName("POST - Deve retornar 201 ao cadastrar produto COM template")
    void createProduct_WithTemplate_ShouldReturn201() throws Exception {
        // Passando validItem para evitar erro 400
        ProductRequestDTO request = new ProductRequestDTO(
                "Janela Maxim-ar", categoryId, new BigDecimal("200.00"), List.of(validItem),
                "WINDOW_AWNING", "{\"minWidth\":500, \"maxHeight\":1000}", List.of("GLASS", "PROFILE")
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId, "Janela Maxim-ar", categoryId, "Janelas", new BigDecimal("200.00"), true, List.of(),
                "WINDOW_AWNING", "{\"minWidth\":500, \"maxHeight\":1000}", List.of("GLASS", "PROFILE")
        );

        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.templateType").value("WINDOW_AWNING"))
                .andExpect(jsonPath("$.data.categoryRequirements[0]").value("GLASS"));
    }

    @Test
    @DisplayName("POST - Deve retornar 201 ao cadastrar produto legado SEM template (Retrocompatibilidade)")
    void createProduct_WithoutTemplate_ShouldReturn201() throws Exception {
        // Passando validItem para evitar erro 400
        ProductRequestDTO request = new ProductRequestDTO(
                "Parafuso", categoryId, new BigDecimal("1.50"), List.of(validItem),
                null, null, null
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId, "Parafuso", categoryId, "Acessórios", new BigDecimal("1.50"), true, List.of(),
                null, null, null
        );

        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.templateType").isEmpty());
    }

    // ==========================================
    // CENÁRIOS DE DETALHE (GET /{id})
    // ==========================================

    @Test
    @DisplayName("GET /{id} - Deve retornar os dados completos do produto com template")
    void getProductById_WithTemplate_ShouldReturn200() throws Exception {
        ProductResponseDTO response = new ProductResponseDTO(
                productId, "Porta de Correr", categoryId, "Portas", new BigDecimal("500.00"), true, List.of(),
                "DOOR_SLIDING", "{}", List.of("GLASS")
        );

        when(productService.findById(productId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.templateType").value("DOOR_SLIDING"));
    }

    // ==========================================
    // CENÁRIOS DE ATUALIZAÇÃO (PUT /{id})
    // ==========================================

    @Test
    @DisplayName("PUT - Deve permitir adicionar um template a um produto legado")
    void updateProduct_AddTemplate_ShouldReturn200() throws Exception {
        // Passando validItem para evitar erro 400
        ProductRequestDTO updateRequest = new ProductRequestDTO(
                "Porta Atualizada", categoryId, new BigDecimal("550.00"), List.of(validItem),
                "DOOR_SLIDING", "{\"width\": 100}", List.of("GLASS")
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId, "Porta Atualizada", categoryId, "Portas", new BigDecimal("550.00"), true, List.of(),
                "DOOR_SLIDING", "{\"width\": 100}", List.of("GLASS")
        );

        when(productService.updateProduct(eq(productId), any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/catalog/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.templateType").value("DOOR_SLIDING"));
    }

    // ==========================================
    // CENÁRIOS ANTIGOS (Mantidos e adaptados)
    // ==========================================

    @Test
    @DisplayName("GET - Deve retornar 200 OK ao buscar produtos paginados com suporte a templates")
    void getProducts_ShouldReturn200() throws Exception {
        ProductResponseDTO p1 = new ProductResponseDTO(productId, "Produto 1", categoryId, "Cat", BigDecimal.ZERO, true, List.of(), "WINDOW_AWNING", "{}", List.of());
        Page<ProductResponseDTO> page = new PageImpl<>(List.of(p1));

        when(productService.findProducts(any(PageRequest.class), eq(true))).thenReturn(page);

        mockMvc.perform(get("/api/v1/catalog/products")
                        .param("page", "0")
                        .param("size", "10")
                        .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].templateType").value("WINDOW_AWNING"));
    }

    @Test
    @DisplayName("DELETE - Deve retornar 204 No Content ao inativar produto")
    void deleteProduct_ShouldReturn204() throws Exception {
        doNothing().when(productService).inactivateProduct(productId);
        mockMvc.perform(delete("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isNoContent());
        verify(productService, times(1)).inactivateProduct(productId);
    }

    @Test
    @DisplayName("POST - Deve retornar 400 Bad Request ao criar produto sem nome")
    void createProduct_WithoutName_ShouldReturn400() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO(
                "", categoryId, new BigDecimal("200.00"), List.of(validItem),
                null, null, null
        );

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /{id} - Deve retornar 404 Not Found ao buscar produto inexistente")
    void getProductById_NotFound_ShouldReturn404() throws Exception {
        when(productService.findById(productId))
                .thenThrow(new br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException("Produto não encontrado"));

        mockMvc.perform(get("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /{id} - Deve retornar campos de template nulos ao buscar produto legado")
    void getProductById_WithoutTemplate_ShouldReturn200() throws Exception {
        ProductResponseDTO response = new ProductResponseDTO(
                productId, "Parafuso", categoryId, "Acessórios", new BigDecimal("1.50"), true, List.of(),
                null, null, null // Campos de template nulos
        );

        when(productService.findById(productId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.templateType").isEmpty())
                .andExpect(jsonPath("$.data.templateConfig").isEmpty())
                .andExpect(jsonPath("$.data.categoryRequirements").isEmpty());
    }

    @Test
    @DisplayName("PUT - Deve permitir remover o template de um produto (Atualizar para nulo)")
    void updateProduct_RemoveTemplate_ShouldReturn200() throws Exception {
        ProductRequestDTO updateRequest = new ProductRequestDTO(
                "Porta Básica", categoryId, new BigDecimal("300.00"), List.of(validItem),
                null, null, null // Removendo template
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId, "Porta Básica", categoryId, "Portas", new BigDecimal("300.00"), true, List.of(),
                null, null, null
        );

        when(productService.updateProduct(eq(productId), any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/catalog/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.templateType").isEmpty());
    }
}