package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
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
    private UUID productId;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        productId = UUID.randomUUID();

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
                DoorTemplateType.SWING_DOOR_1F,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE)
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Porta de Giro Simples",
                "Portas",
                DoorTemplateType.SWING_DOOR_1F,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE),
                true
        );

        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Porta de Giro Simples"))
                .andExpect(jsonPath("$.data.templateType").value("SWING_DOOR_1F"))
                .andExpect(jsonPath("$.data.categoryName").value("Portas"));
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request ao tentar cadastrar produto sem nome")
    void createProduct_WithoutName_ShouldReturn400() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO(
                "",
                DoorTemplateType.SWING_DOOR_1F,
                null,
                List.of(MaterialCategoryType.GLASS)
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
                "Portas",
                DoorTemplateType.SLIDING_DOOR_2F,
                null,
                List.of(MaterialCategoryType.GLASS),
                true
        );

        when(productService.findById(productId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(productId.toString()))
                .andExpect(jsonPath("$.data.name").value("Porta de Correr Suprema"))
                .andExpect(jsonPath("$.data.templateType").value("SLIDING_DOOR_2F"));
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
                DoorTemplateType.SLIDING_DOOR_2F,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.HARDWARE)
        );

        ProductResponseDTO response = new ProductResponseDTO(
                productId,
                "Porta Atualizada",
                "Portas",
                DoorTemplateType.SLIDING_DOOR_2F,
                null,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.HARDWARE),
                true
        );

        when(productService.updateProduct(eq(productId), any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/catalog/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Porta Atualizada"))
                .andExpect(jsonPath("$.data.templateType").value("SLIDING_DOOR_2F"));
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
                "Portas",
                DoorTemplateType.SWING_DOOR_1F,
                null,
                List.of(MaterialCategoryType.GLASS),
                true
        );
        Page<ProductResponseDTO> page = new PageImpl<>(List.of(p1));

        when(productService.findProducts(any(PageRequest.class), eq(true))).thenReturn(page);

        mockMvc.perform(get("/api/v1/catalog/products")
                        .param("page", "0")
                        .param("size", "10")
                        .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].templateType").value("SWING_DOOR_1F"));
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
