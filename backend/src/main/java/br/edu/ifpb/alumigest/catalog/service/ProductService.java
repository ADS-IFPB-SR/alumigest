package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.domain.ProductItem;
import br.edu.ifpb.alumigest.catalog.dto.ProductItemRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import br.edu.ifpb.alumigest.catalog.mapper.ProductMapper;
import br.edu.ifpb.alumigest.catalog.domain.ProductCategory;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductCategoryRepository;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
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
public class ProductService {

    private final ProductRepository productRepository;
    private final MaterialRepository materialRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, MaterialRepository materialRepository, ProductCategoryRepository productCategoryRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.materialRepository = materialRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.productMapper = productMapper;
    }

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        if (productRepository.existsByNameIgnoreCase(request.name())) {
            throw new br.edu.ifpb.alumigest.common.exception.BusinessException("Já existe um produto com o nome informado.");
        }

        ProductCategory category = productCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + request.categoryId()));

        Product product = new Product();
        product.setName(request.name());
        product.setCategory(category);
        product.setLaborCost(request.laborCost());
        product.setActive(true);

        Map<UUID, BigDecimal> groupedItems = request.items().stream()
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

        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }


    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> findProducts(Pageable pageable, boolean activeOnly) {

        if (activeOnly) {
            return productRepository.findByIsActiveTrue(pageable).map(productMapper::toResponse);
        }
        return productRepository.findAll(pageable).map(productMapper::toResponse);
    }

    @Transactional
    public ProductResponseDTO updateProduct(UUID id, ProductRequestDTO request) {
        if (productRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new br.edu.ifpb.alumigest.common.exception.BusinessException("Já existe outro produto com o nome informado.");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID informado."));

        ProductCategory category = productCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + request.categoryId()));

        product.setName(request.name());
        product.setCategory(category);
        product.setLaborCost(request.laborCost());

        product.getItems().clear();

        Map<UUID, BigDecimal> groupedItems = request.items().stream()
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

        return productMapper.toResponse(productRepository.save(product));
    }


    @Transactional
    public void inactivateProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID informado."));

        product.setActive(false);
        productRepository.save(product);
    }


}