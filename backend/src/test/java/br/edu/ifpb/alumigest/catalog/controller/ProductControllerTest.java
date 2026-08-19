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

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("Deve retornar 201 Created ao cadastrar produto com dados validos")
    void createProduct_WithValidData_ShouldReturn201() throws Exception {
        ProductItemRequestDTO item = new ProductItemRequestDTO(UUID.randomUUID(), new BigDecimal("1.5"));
        ProductRequestDTO request = new ProductRequestDTO(
                "Porta Balcão",
                UUID.randomUUID(),
                new BigDecimal("200.00"),
                List.of(item)
        );

        ProductResponseDTO response = new ProductResponseDTO(
                UUID.randomUUID(),
                "Porta Balcão",
                request.categoryId(),
                "Portas",
                new BigDecimal("200.00"),
                true,
                List.of()
        );

        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Porta Balcão"))
                .andExpect(jsonPath("$.data.categoryName").value("Portas"));
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request ao tentar cadastrar produto com ficha tecnica vazia")
    void createProduct_WithEmptyBOM_ShouldReturn400() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO(
                "Porta Balcão",
                UUID.randomUUID(),
                new BigDecimal("200.00"),
                List.of() // Vazio, deveria acionar o @NotEmpty
        );

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao buscar produtos paginados")
    void getProducts_ShouldReturn200() throws Exception {
        ProductResponseDTO p1 = new ProductResponseDTO(UUID.randomUUID(), "Produto 1", UUID.randomUUID(), "Cat", BigDecimal.ZERO, true, List.of());
        Page<ProductResponseDTO> page = new PageImpl<>(List.of(p1));

        when(productService.findProducts(any(PageRequest.class), eq(true))).thenReturn(page);

        mockMvc.perform(get("/api/v1/catalog/products")
                        .param("page", "0")
                        .param("size", "10")
                        .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Produto 1"));
    }

    @Test
    @DisplayName("Deve retornar 204 No Content ao inativar (soft delete) produto")
    void deleteProduct_ShouldReturn204() throws Exception {
        UUID productId = UUID.randomUUID();
        
        doNothing().when(productService).inactivateProduct(productId);

        mockMvc.perform(delete("/api/v1/catalog/products/{id}", productId))
                .andExpect(status().isNoContent());

        verify(productService, times(1)).inactivateProduct(productId);
    }
}
