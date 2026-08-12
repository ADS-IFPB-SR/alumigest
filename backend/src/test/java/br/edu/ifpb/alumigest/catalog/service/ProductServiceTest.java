package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.domain.ProductCategory;
import br.edu.ifpb.alumigest.catalog.dto.ProductItemRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import br.edu.ifpb.alumigest.catalog.mapper.ProductMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductCategoryRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private MaterialRepository materialRepository;
    @Mock
    private ProductCategoryRepository productCategoryRepository;
    @Mock
    private ProductMapper productMapper;
    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Deve cadastrar um produto agrupando itens repetidos e retornar o DTO")
    void createProduct_WithValidData_ShouldSaveAndReturnResponse() {
        // Arrange (Preparação)
        UUID materialId = UUID.randomUUID();

        // Simulando que o usuário mandou o mesmo material DUAS vezes na requisição
        ProductItemRequestDTO item1 = new ProductItemRequestDTO(materialId, new BigDecimal("2.0"));
        ProductItemRequestDTO item2 = new ProductItemRequestDTO(materialId, new BigDecimal("3.0"));

        UUID categoryId = UUID.randomUUID();

        ProductRequestDTO request = new ProductRequestDTO(
                "Janela de Correr",
                categoryId,
                new BigDecimal("150.00"),
                List.of(item1, item2)
        );

        Material mockMaterial = new Material();
        mockMaterial.setId(materialId);

        Product mockSavedProduct = new Product();
        ProductResponseDTO mockResponse = new ProductResponseDTO(UUID.randomUUID(), "Janela de Correr", categoryId, "Esquadrias", new BigDecimal("150.00"), true, List.of());

        ProductCategory mockCategory = new ProductCategory();
        mockCategory.setId(categoryId);
        mockCategory.setName("Esquadrias");

        // Comportamento dos Mocks
        when(productCategoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(materialRepository.findByIdAndIsActiveTrue(materialId)).thenReturn(Optional.of(mockMaterial));
        when(productRepository.save(any(Product.class))).thenReturn(mockSavedProduct);
        when(productMapper.toResponse(mockSavedProduct)).thenReturn(mockResponse);

        // Act (Ação)
        ProductResponseDTO result = productService.createProduct(request);

        // Assert (Verificação)
        assertNotNull(result);
        assertEquals("Janela de Correr", result.name());

        // Capturar o Produto exato que foi mandado para o banco para checar a nossa regra da soma!
        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());

        Product capturedProduct = productCaptor.getValue();

        // Verifica se os itens repetidos foram somados em UMA única linha na ficha técnica (2.0 + 3.0 = 5.0)
        assertEquals(1, capturedProduct.getItems().size());
        assertEquals(new BigDecimal("5.0"), capturedProduct.getItems().get(0).getQuantity());

        // Como agrupou, o banco só deve ter sido consultado UMA vez
        verify(materialRepository, times(1)).findByIdAndIsActiveTrue(materialId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar cadastrar produto com material inexistente")
    void createProduct_WithInvalidMaterial_ShouldThrowException() {
        // Arrange
        UUID invalidMaterialId = UUID.randomUUID();
        ProductItemRequestDTO item = new ProductItemRequestDTO(invalidMaterialId, new BigDecimal("1.0"));

        UUID categoryId = UUID.randomUUID();
        ProductCategory mockCategory = new ProductCategory();
        mockCategory.setId(categoryId);

        ProductRequestDTO request = new ProductRequestDTO(
                "Porta",
                categoryId,
                new BigDecimal("50.00"),
                List.of(item)
        );

        when(productCategoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(materialRepository.findByIdAndIsActiveTrue(invalidMaterialId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.createProduct(request);
        });

        assertTrue(exception.getMessage().contains("Material não encontrado ou inativo"));

        // Garante que não tentou salvar o produto no banco se deu erro no material
        verify(productRepository, never()).save(any(Product.class));
    }
}