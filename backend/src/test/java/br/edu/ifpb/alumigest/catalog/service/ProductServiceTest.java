package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.*;
import br.edu.ifpb.alumigest.catalog.dto.*;
import br.edu.ifpb.alumigest.catalog.mapper.ProductMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductCategoryRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
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
    @DisplayName("Deve cadastrar um produto com template e categoryRequirements com sucesso")
    void createProduct_WithTemplateAndCategories_ShouldSaveSuccessfully() {
        UUID categoryId = UUID.randomUUID();
        ProductCategory mockCategory = new ProductCategory();
        mockCategory.setId(categoryId);
        mockCategory.setName("Portas de Giro");

        TemplateConfigDTO templateConfigDTO = new TemplateConfigDTO(
                new BigDecimal("20.0"),
                "#212121",
                "#e3f2fd",
                OpeningDirection.LEFT_TO_RIGHT,
                null,
                new HandleConfigDTO(HandleType.LEVER_HANDLE, HandlePosition.RIGHT, new BigDecimal("150.0"), null),
                new DrillingConfigDTO(HoleDrillingMode.EQUAL, 2, List.of()),
                new TemplateOptionSchemaDTO(false, List.of(), true, List.of(OpeningDirection.LEFT_TO_RIGHT, OpeningDirection.RIGHT_TO_LEFT),
                        true, List.of(HandleType.LEVER_HANDLE, HandleType.BAR_TUBULAR), List.of(HandlePosition.RIGHT, HandlePosition.LEFT),
                        true, List.of(HoleDrillingMode.EQUAL), List.of("#212121", "#FFFFFF"), List.of("#e3f2fd", "#595959"))
        );

        ProductRequestDTO request = new ProductRequestDTO(
                "Porta de Giro Alumiportas",
                categoryId,
                new BigDecimal("150.00"),
                DoorTemplateType.GIRO,
                templateConfigDTO,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.HARDWARE),
                List.of()
        );

        Product mockSavedProduct = new Product();
        mockSavedProduct.setId(UUID.randomUUID());
        mockSavedProduct.setName("Porta de Giro Alumiportas");
        mockSavedProduct.setTemplateType(DoorTemplateType.GIRO);

        ProductResponseDTO mockResponse = new ProductResponseDTO(
                mockSavedProduct.getId(),
                "Porta de Giro Alumiportas",
                categoryId,
                "Portas de Giro",
                new BigDecimal("150.00"),
                DoorTemplateType.GIRO,
                templateConfigDTO,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.HARDWARE),
                true,
                List.of()
        );

        when(productRepository.existsByNameIgnoreCase("Porta de Giro Alumiportas")).thenReturn(false);
        when(productCategoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(productMapper.toTemplateConfig(any())).thenReturn(new TemplateConfig());
        when(productRepository.save(any(Product.class))).thenReturn(mockSavedProduct);
        when(productMapper.toResponse(mockSavedProduct)).thenReturn(mockResponse);

        ProductResponseDTO result = productService.createProduct(request);

        assertNotNull(result);
        assertEquals("Porta de Giro Alumiportas", result.name());
        assertEquals(DoorTemplateType.GIRO, result.templateType());
        assertEquals(3, result.categoryRequirements().size());

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        Product captured = captor.getValue();
        assertEquals(DoorTemplateType.GIRO, captured.getTemplateType());
        assertEquals(3, captured.getCategoryRequirements().size());
        assertTrue(captured.isActive());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao criar produto com template mas sem categoryRequirements")
    void createProduct_WithTemplateButNoCategoryRequirements_ShouldThrowException() {
        UUID categoryId = UUID.randomUUID();
        ProductRequestDTO request = new ProductRequestDTO(
                "Porta Inválida",
                categoryId,
                BigDecimal.ZERO,
                DoorTemplateType.GIRO,
                null,
                List.of(),
                List.of()
        );

        when(productRepository.existsByNameIgnoreCase("Porta Inválida")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> productService.createProduct(request));
        assertTrue(ex.getMessage().contains("Templates de produto exigem ao menos uma categoria de insumo"));
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve atualizar produto e alterar template e opções com sucesso")
    void updateProduct_WithNewTemplate_ShouldUpdateSuccessfully() {
        UUID productId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        Product existingProduct = new Product();
        existingProduct.setId(productId);
        existingProduct.setName("Porta Antiga");
        existingProduct.setTemplateType(DoorTemplateType.GIRO);

        ProductCategory mockCategory = new ProductCategory();
        mockCategory.setId(categoryId);
        mockCategory.setName("Portas de Correr");

        TemplateConfigDTO newConfigDTO = new TemplateConfigDTO(
                new BigDecimal("45.0"),
                "#FFFFFF",
                "#595959",
                OpeningDirection.LEFT_TO_RIGHT,
                SlidingMode.BOTH_SLIDING,
                new HandleConfigDTO(HandleType.SHELL_LOCK, HandlePosition.RIGHT, new BigDecimal("120.0"), null),
                new DrillingConfigDTO(HoleDrillingMode.EQUAL, 0, List.of()),
                null
        );

        ProductRequestDTO request = new ProductRequestDTO(
                "Porta de Correr Suprema",
                categoryId,
                new BigDecimal("200.00"),
                DoorTemplateType.CORRER,
                newConfigDTO,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.ROLLERS),
                List.of()
        );

        Product updatedProduct = new Product();
        updatedProduct.setId(productId);
        updatedProduct.setName("Porta de Correr Suprema");
        updatedProduct.setTemplateType(DoorTemplateType.CORRER);

        ProductResponseDTO mockResponse = new ProductResponseDTO(
                productId,
                "Porta de Correr Suprema",
                categoryId,
                "Portas de Correr",
                new BigDecimal("200.00"),
                DoorTemplateType.CORRER,
                newConfigDTO,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.ROLLERS),
                true,
                List.of()
        );

        when(productRepository.existsByNameIgnoreCaseAndIdNot("Porta de Correr Suprema", productId)).thenReturn(false);
        when(productRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
        when(productCategoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(productMapper.toTemplateConfig(any())).thenReturn(new TemplateConfig());
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);
        when(productMapper.toResponse(updatedProduct)).thenReturn(mockResponse);

        ProductResponseDTO result = productService.updateProduct(productId, request);

        assertNotNull(result);
        assertEquals("Porta de Correr Suprema", result.name());
        assertEquals(DoorTemplateType.CORRER, result.templateType());
        verify(productRepository).save(existingProduct);
    }

    @Test
    @DisplayName("Deve buscar produto por ID com sucesso")
    void findById_ExistingId_ShouldReturnProduct() {
        UUID id = UUID.randomUUID();
        Product product = new Product();
        product.setId(id);
        product.setName("Janela Basculante");

        ProductResponseDTO response = new ProductResponseDTO(
                id, "Janela Basculante", UUID.randomUUID(), "Janelas", BigDecimal.ZERO,
                DoorTemplateType.BASCULANTE, null, List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE), true, List.of()
        );

        when(productRepository.findById(id)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(response);

        ProductResponseDTO result = productService.findById(id);

        assertNotNull(result);
        assertEquals("Janela Basculante", result.name());
        assertEquals(DoorTemplateType.BASCULANTE, result.templateType());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao buscar ID inexistente")
    void findById_NonExistingId_ShouldThrowException() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.findById(id));
    }

    @Test
    @DisplayName("Deve inativar produto corretamente (Soft Delete)")
    void inactivateProduct_ShouldSetIsActiveToFalse() {
        UUID productId = UUID.randomUUID();
        Product product = new Product();
        product.setId(productId);
        product.setActive(true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        productService.inactivateProduct(productId);

        assertFalse(product.isActive());
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao criar produto com nome duplicado")
    void createProduct_WithDuplicateName_ShouldThrowBusinessException() {
        ProductRequestDTO request = new ProductRequestDTO("Porta", UUID.randomUUID(), BigDecimal.ZERO, null, null, null, List.of());

        when(productRepository.existsByNameIgnoreCase("Porta")).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> productService.createProduct(request)
        );

        assertEquals("Já existe um produto com o nome informado.", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao atualizar produto com nome de outro já existente")
    void updateProduct_WithDuplicateName_ShouldThrowBusinessException() {
        UUID id = UUID.randomUUID();
        ProductRequestDTO request = new ProductRequestDTO("Porta Nova", UUID.randomUUID(), BigDecimal.ZERO, null, null, null, List.of());

        when(productRepository.existsByNameIgnoreCaseAndIdNot("Porta Nova", id)).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> productService.updateProduct(id, request)
        );

        assertEquals("Já existe outro produto com o nome informado.", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve listar produtos ativos quando activeOnly for true")
    void findProducts_ActiveOnlyTrue_ShouldCallFindByIsActiveTrue() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Produto Ativo");

        org.springframework.data.domain.Page<Product> page = new org.springframework.data.domain.PageImpl<>(List.of(product));
        when(productRepository.findByIsActiveTrue(pageable)).thenReturn(page);
        when(productMapper.toResponse(any())).thenReturn(new ProductResponseDTO(product.getId(), "Produto Ativo", UUID.randomUUID(), "Cat", BigDecimal.ZERO, null, null, null, true, List.of()));

        org.springframework.data.domain.Page<ProductResponseDTO> result = productService.findProducts(pageable, true);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(productRepository).findByIsActiveTrue(pageable);
    }

    @Test
    @DisplayName("Deve listar todos os produtos quando activeOnly for false")
    void findProducts_ActiveOnlyFalse_ShouldCallFindAll() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        Product product = new Product();
        product.setId(UUID.randomUUID());

        org.springframework.data.domain.Page<Product> page = new org.springframework.data.domain.PageImpl<>(List.of(product));
        when(productRepository.findAll(pageable)).thenReturn(page);
        when(productMapper.toResponse(any())).thenReturn(new ProductResponseDTO(product.getId(), "Produto", UUID.randomUUID(), "Cat", BigDecimal.ZERO, null, null, null, false, List.of()));

        org.springframework.data.domain.Page<ProductResponseDTO> result = productService.findProducts(pageable, false);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(productRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Deve cadastrar produto com itens de materiais fixos vinculados")
    void createProduct_WithItems_ShouldAttachItemsCorrectly() {
        UUID categoryId = UUID.randomUUID();
        UUID materialId = UUID.randomUUID();
        ProductCategory mockCategory = new ProductCategory();
        mockCategory.setId(categoryId);

        Material mockMaterial = new Material();
        mockMaterial.setId(materialId);
        mockMaterial.setName("Perfil de Alumínio");
        mockMaterial.setActive(true);

        ProductRequestDTO request = new ProductRequestDTO(
                "Produto com Itens",
                categoryId,
                new BigDecimal("50.00"),
                null,
                null,
                null,
                List.of(new ProductItemRequestDTO(materialId, new BigDecimal("2.5")))
        );

        Product mockSaved = new Product();
        mockSaved.setId(UUID.randomUUID());
        mockSaved.setName("Produto com Itens");

        when(productRepository.existsByNameIgnoreCase("Produto com Itens")).thenReturn(false);
        when(productCategoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(materialRepository.findByIdAndIsActiveTrue(materialId)).thenReturn(Optional.of(mockMaterial));
        when(productRepository.save(any(Product.class))).thenReturn(mockSaved);
        when(productMapper.toResponse(any())).thenReturn(new ProductResponseDTO(mockSaved.getId(), "Produto com Itens", categoryId, "Cat", new BigDecimal("50.00"), null, null, null, true, List.of()));

        ProductResponseDTO response = productService.createProduct(request);

        assertNotNull(response);
        verify(productRepository).save(any(Product.class));
    }
}