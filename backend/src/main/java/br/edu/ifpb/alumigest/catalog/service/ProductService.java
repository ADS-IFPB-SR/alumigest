package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.domain.ProductCategory;
import br.edu.ifpb.alumigest.catalog.domain.ProductItem;
import br.edu.ifpb.alumigest.catalog.dto.ProductItemRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import br.edu.ifpb.alumigest.catalog.mapper.ProductMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductCategoryRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService implements IProductService {

    private final ProductRepository productRepository;
    private final MaterialRepository materialRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          MaterialRepository materialRepository,
                          ProductCategoryRepository productCategoryRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.materialRepository = materialRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.productMapper = productMapper;
    }

    @Override
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        if (productRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessException("Já existe um produto com o nome informado.");
        }

        validateTemplateRequirements(request);

        ProductCategory category = productCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + request.categoryId()));

        Product product = new Product();
        product.setName(request.name());
        product.setCategory(category);
        product.setTemplateType(request.templateType());
        product.setTemplateConfig(productMapper.toTemplateConfig(request.templateConfig()));
        product.setCategoryRequirements(request.categoryRequirements());
        product.setActive(true);

        if (request.items() != null && !request.items().isEmpty()) {
            attachProductItems(product, request.items());
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> findProducts(Pageable pageable, boolean activeOnly) {
        if (activeOnly) {
            return productRepository.findByIsActiveTrue(pageable).map(productMapper::toResponse);
        }
        return productRepository.findAll(pageable).map(productMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO findById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID informado."));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProduct(UUID id, ProductRequestDTO request) {
        if (productRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new BusinessException("Já existe outro produto com o nome informado.");
        }

        validateTemplateRequirements(request);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID informado."));

        ProductCategory category = productCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + request.categoryId()));

        product.setName(request.name());
        product.setCategory(category);
        product.setTemplateType(request.templateType());
        product.setTemplateConfig(productMapper.toTemplateConfig(request.templateConfig()));
        product.setCategoryRequirements(request.categoryRequirements());

        product.getItems().clear();
        if (request.items() != null && !request.items().isEmpty()) {
            attachProductItems(product, request.items());
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void inactivateProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID informado."));

        product.setActive(false);
        productRepository.save(product);
    }

    private void validateTemplateRequirements(ProductRequestDTO request) {
        if (request.templateType() != null) {
            if (request.categoryRequirements() == null || request.categoryRequirements().isEmpty()) {
                throw new BusinessException("Templates de produto exigem ao menos uma categoria de insumo (categoryRequirements).");
            }
        }
    }

    private void attachProductItems(Product product, java.util.List<ProductItemRequestDTO> items) {
        Map<UUID, BigDecimal> groupedItems = items.stream()
                .collect(Collectors.toMap(
                        ProductItemRequestDTO::materialId,
                        ProductItemRequestDTO::quantity,
                        BigDecimal::add
                ));

        for (Map.Entry<UUID, BigDecimal> entry : groupedItems.entrySet()) {
            Material material = materialRepository.findByIdAndIsActiveTrue(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado ou inativo: " + entry.getKey()));

            ProductItem productItem = new ProductItem(material, entry.getValue());
            product.addItem(productItem);
        }
    }
}