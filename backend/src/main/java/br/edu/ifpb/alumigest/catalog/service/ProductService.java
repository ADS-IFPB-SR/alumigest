package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import br.edu.ifpb.alumigest.catalog.mapper.ProductMapper;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProductService implements IProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Override
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        if (productRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessException("Já existe um produto com o nome informado.");
        }

        validateTemplateRequirements(request);

        Product product = new Product();
        product.setName(request.name());
        product.setTemplateType(request.templateType());
        product.setTemplateConfig(productMapper.toTemplateConfig(request.templateConfig()));
        product.setCategoryRequirements(request.categoryRequirements());
        product.setActive(true);

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

        product.setName(request.name());
        product.setTemplateType(request.templateType());
        product.setTemplateConfig(productMapper.toTemplateConfig(request.templateConfig()));
        product.setCategoryRequirements(request.categoryRequirements());

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
        if (request.templateType() == null) {
            throw new BusinessException("O modelo de esquadria (templateType) é obrigatório.");
        }
        if (request.categoryRequirements() == null || request.categoryRequirements().isEmpty()) {
            throw new BusinessException("O produto exige ao menos uma categoria de insumo (categoryRequirements).");
        }
    }
}