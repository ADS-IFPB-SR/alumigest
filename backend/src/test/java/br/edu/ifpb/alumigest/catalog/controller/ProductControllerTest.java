package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.dto.ProductItemRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import br.edu.ifpb.alumigest.catalog.service.IProductService;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
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
    private ProductItemRequestDTO validItem;

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
    @DisplayName("Deve retornar 201 Created ao cadastrar produto com template")
    void createProduct_WithValidTemplate_ShouldReturn201() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO(
                "Porta de Giro Simples",
                categoryId,
                DoorTemplateType.SWING,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE),
                List.of(validItem)
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Porta de Giro Simples",
                categoryId,
                "Portas",
                DoorTemplateType.SWING,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE),
                true,
                List.of()
        );

        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Porta de Giro Simples"))
                .andExpect(jsonPath("$.data.templateType").value("SWING"))
                .andExpect(jsonPath("$.data.categoryName").value("Portas"));
    }

    @Test
    @DisplayName("POST - Deve retornar 201 ao cadastrar produto legado SEM template (Retrocompatibilidade)")
    void createProduct_WithoutTemplate_ShouldReturn201() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO(
                "Parafuso",
                categoryId,
                null,
                null,
                null,
                List.of(validItem)
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Parafuso",
                categoryId,
                "Acessórios",
                null,
                null,
                null,
                true,
                List.of()
        );

        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Parafuso"))
                .andExpect(jsonPath("$.data.templateType").isEmpty());
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request ao tentar cadastrar produto sem nome")
    void createProduct_WithoutName_ShouldReturn400() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO(
                "",
                categoryId,
                null,
                null,
                null,
                List.of(validItem)
        );

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ==========================================
    // CENÁRIOS DE DETALHE (GET /{id})
    // ==========================================

    @Test
    @DisplayName("GET /{id} - Deve retornar os dados completos do produto com template")
    void getProductById_WithTemplate_ShouldReturn200() throws Exception {
        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Porta de Correr Suprema",
                categoryId,
                "Portas",
                DoorTemplateType.SLIDING,
                null,
                List.of(MaterialCategoryType.GLASS),
                true,
                List.of()
        );

        when(productService.findById(productId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(productId.toString()))
                .andExpect(jsonPath("$.data.name").value("Porta de Correr Suprema"))
                .andExpect(jsonPath("$.data.templateType").value("SLIDING"));
    }

    @Test
    @DisplayName("GET /{id} - Deve retornar campos de template nulos ao buscar produto legado")
    void getProductById_WithoutTemplate_ShouldReturn200() throws Exception {
        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Parafuso",
                categoryId,
                "Acessórios",
                null,
                null,
                null,
                true,
                List.of()
        );

        when(productService.findById(productId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Parafuso"))
                .andExpect(jsonPath("$.data.templateType").isEmpty());
    }

    @Test
    @DisplayName("GET /{id} - Deve retornar 404 Not Found ao buscar produto inexistente")
    void getProductById_NotFound_ShouldReturn404() throws Exception {
        when(productService.findById(productId))
                .thenThrow(new ResourceNotFoundException("Produto não encontrado"));

        mockMvc.perform(get("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isNotFound());
    }

    // ==========================================
    // CENÁRIOS DE ATUALIZAÇÃO (PUT /{id})
    // ==========================================

    @Test
    @DisplayName("Deve retornar 200 OK ao atualizar produto com template")
    void updateProduct_WithTemplate_ShouldReturn200() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO(
                "Porta Atualizada",
                categoryId,
                DoorTemplateType.SLIDING,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.ROLLERS),
                List.of(validItem)
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Porta Atualizada",
                categoryId,
                "Portas",
                DoorTemplateType.SLIDING,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.ROLLERS),
                true,
                List.of()
        );

        when(productService.updateProduct(eq(productId), any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/catalog/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Porta Atualizada"))
                .andExpect(jsonPath("$.data.templateType").value("SLIDING"));
    }

    @Test
    @DisplayName("PUT - Deve permitir remover o template de um produto (Atualizar para nulo)")
    void updateProduct_RemoveTemplate_ShouldReturn200() throws Exception {
        ProductRequestDTO updateRequest = new ProductRequestDTO(
                "Porta Básica",
                categoryId,
                null,
                null,
                null,
                List.of(validItem)
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Porta Básica",
                categoryId,
                "Portas",
                null,
                null,
                null,
                true,
                List.of()
        );

        when(productService.updateProduct(eq(productId), any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/catalog/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.templateType").isEmpty());
    }

    // ==========================================
    // LISTAGEM E DELEÇÃO (GET / DELETE)
    // ==========================================

    @Test
    @DisplayName("Deve retornar 200 OK ao buscar produtos paginados")
    void getProducts_ShouldReturn200() throws Exception {
        ProductResponseDTO p1 = new ProductResponseDTO(
                productId,
                "Porta de Giro",
                categoryId,
                "Portas",
                DoorTemplateType.SWING,
                null,
                List.of(MaterialCategoryType.GLASS),
                true,
                List.of()
        );
        Page<ProductResponseDTO> page = new PageImpl<>(List.of(p1));

        when(productService.findProducts(any(PageRequest.class), eq(true))).thenReturn(page);

        mockMvc.perform(get("/api/v1/catalog/products")
                        .param("page", "0")
                        .param("size", "10")
                        .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].templateType").value("SWING"));
    }

    @Test
    @DisplayName("DELETE - Deve retornar 204 No Content ao inativar produto")
    void deleteProduct_ShouldReturn204() throws Exception {
        doNothing().when(productService).inactivateProduct(productId);

        mockMvc.perform(delete("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isNoContent());

        verify(productService, times(1)).inactivateProduct(productId);
    }
}
