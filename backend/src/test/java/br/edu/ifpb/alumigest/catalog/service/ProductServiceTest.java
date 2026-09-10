package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.*;
import br.edu.ifpb.alumigest.catalog.dto.*;
import br.edu.ifpb.alumigest.catalog.mapper.ProductMapper;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
    private ProductMapper productMapper;
    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Deve cadastrar um produto com template e categoryRequirements com sucesso")
    void createProduct_WithTemplateAndCategories_ShouldSaveSuccessfully() {
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
                DoorTemplateType.SWING_DOOR_1F,
                templateConfigDTO,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.HARDWARE)
        );

        Product mockSavedProduct = new Product();
        mockSavedProduct.setId(UUID.randomUUID());
        mockSavedProduct.setName("Porta de Giro Alumiportas");
        mockSavedProduct.setTemplateType(DoorTemplateType.SWING_DOOR_1F);

        ProductResponseDTO mockResponse = new ProductResponseDTO(
                mockSavedProduct.getId(),
                "Porta de Giro Alumiportas",
                "Portas",
                DoorTemplateType.SWING_DOOR_1F,
                templateConfigDTO,
                List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.HARDWARE),
                true
        );

        when(productRepository.existsByNameIgnoreCase("Porta de Giro Alumiportas")).thenReturn(false);
        when(productMapper.toTemplateConfig(any())).thenReturn(new TemplateConfig());
        when(productRepository.save(any(Product.class))).thenReturn(mockSavedProduct);
        when(productMapper.toResponse(mockSavedProduct)).thenReturn(mockResponse);

        ProductResponseDTO result = productService.createProduct(request);

        assertNotNull(result);
        assertEquals("Porta de Giro Alumiportas", result.name());
        assertEquals(DoorTemplateType.SWING_DOOR_1F, result.templateType());
        assertEquals(3, result.categoryRequirements().size());

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        Product captured = captor.getValue();
        assertEquals("Porta de Giro Alumiportas", captured.getName());
        assertEquals(DoorTemplateType.SWING_DOOR_1F, captured.getTemplateType());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar cadastrar produto sem templateType")
    void createProduct_WithoutTemplate_ShouldThrowBusinessException() {
        ProductRequestDTO request = new ProductRequestDTO(
                "Produto Sem Template",
                null,
                null,
                List.of(MaterialCategoryType.GLASS)
        );

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> productService.createProduct(request)
        );

        assertEquals("O modelo de esquadria (templateType) é obrigatório.", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar cadastrar template sem categoryRequirements")
    void createProduct_WithTemplateButNoCategories_ShouldThrowBusinessException() {
        ProductRequestDTO request = new ProductRequestDTO(
                "Porta Incompleta",
                DoorTemplateType.SWING_DOOR_1F,
                null,
                List.of()
        );

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> productService.createProduct(request)
        );

        assertEquals("O produto exige ao menos uma categoria de insumo (categoryRequirements).", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao tentar cadastrar produto com nome duplicado")
    void createProduct_WithDuplicateName_ShouldThrowBusinessException() {
        ProductRequestDTO request = new ProductRequestDTO(
                "Porta de Giro",
                DoorTemplateType.SWING_DOOR_1F,
                null,
                List.of(MaterialCategoryType.GLASS)
        );

        when(productRepository.existsByNameIgnoreCase("Porta de Giro")).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> productService.createProduct(request)
        );

        assertEquals("Já existe um produto com o nome informado.", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve atualizar produto existente com sucesso")
    void updateProduct_WithValidData_ShouldUpdateAndReturnResponse() {
        UUID id = UUID.randomUUID();
        Product existingProduct = new Product();
        existingProduct.setId(id);
        existingProduct.setName("Porta Antiga");
        existingProduct.setTemplateType(DoorTemplateType.SWING_DOOR_1F);

        ProductRequestDTO request = new ProductRequestDTO(
                "Porta Nova",
                DoorTemplateType.SLIDING_DOOR_2F,
                null,
                List.of(MaterialCategoryType.PROFILE, MaterialCategoryType.GLASS)
        );

        Product updatedProduct = new Product();
        updatedProduct.setId(id);
        updatedProduct.setName("Porta Nova");
        updatedProduct.setTemplateType(DoorTemplateType.SLIDING_DOOR_2F);

        ProductResponseDTO mockResponse = new ProductResponseDTO(
                id, "Porta Nova", "Portas", DoorTemplateType.SLIDING_DOOR_2F, null,
                List.of(MaterialCategoryType.PROFILE, MaterialCategoryType.GLASS), true
        );

        when(productRepository.existsByNameIgnoreCaseAndIdNot("Porta Nova", id)).thenReturn(false);
        when(productRepository.findById(id)).thenReturn(Optional.of(existingProduct));
        when(productMapper.toTemplateConfig(any())).thenReturn(new TemplateConfig());
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);
        when(productMapper.toResponse(updatedProduct)).thenReturn(mockResponse);

        ProductResponseDTO response = productService.updateProduct(id, request);

        assertNotNull(response);
        assertEquals("Porta Nova", response.name());
        assertEquals(DoorTemplateType.SLIDING_DOOR_2F, response.templateType());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao tentar atualizar produto inexistente")
    void updateProduct_NotFound_ShouldThrowException() {
        UUID id = UUID.randomUUID();
        ProductRequestDTO request = new ProductRequestDTO(
                "Inexistente",
                DoorTemplateType.SWING_DOOR_1F,
                null,
                List.of(MaterialCategoryType.GLASS)
        );

        when(productRepository.existsByNameIgnoreCaseAndIdNot("Inexistente", id)).thenReturn(false);
        when(productRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.updateProduct(id, request));
    }

    @Test
    @DisplayName("Deve inativar produto com sucesso")
    void inactivateProduct_ShouldSetIsActiveFalse() {
        UUID id = UUID.randomUUID();
        Product product = new Product();
        product.setId(id);
        product.setActive(true);

        when(productRepository.findById(id)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        productService.inactivateProduct(id);

        assertFalse(product.isActive());
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("Deve buscar produtos paginados")
    void findProducts_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Janela Maxim-Ar");
        product.setTemplateType(DoorTemplateType.AWNING_WINDOW_1F);

        Page<Product> page = new PageImpl<>(List.of(product));
        ProductResponseDTO mockResponse = new ProductResponseDTO(
                product.getId(), "Janela Maxim-Ar", "Janelas", DoorTemplateType.AWNING_WINDOW_1F, null, List.of(), true
        );

        when(productRepository.findByIsActiveTrue(pageable)).thenReturn(page);
        when(productMapper.toResponse(product)).thenReturn(mockResponse);

        Page<ProductResponseDTO> result = productService.findProducts(pageable, true);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Janela Maxim-Ar", result.getContent().get(0).name());
        assertEquals("Janelas", result.getContent().get(0).categoryName());
    }

    @Test
    @DisplayName("Deve buscar produto por ID com sucesso")
    void findById_ShouldReturnProduct() {
        UUID id = UUID.randomUUID();
        Product product = new Product();
        product.setId(id);
        product.setName("Frente de Gaveta");
        product.setTemplateType(DoorTemplateType.FRONT_DRAWER);

        ProductResponseDTO mockResponse = new ProductResponseDTO(
                id, "Frente de Gaveta", "Móveis / Painéis", DoorTemplateType.FRONT_DRAWER, null, List.of(), true
        );

        when(productRepository.findById(id)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(mockResponse);

        ProductResponseDTO result = productService.findById(id);

        assertNotNull(result);
        assertEquals("Frente de Gaveta", result.name());
        assertEquals(DoorTemplateType.FRONT_DRAWER, result.templateType());
    }
}
