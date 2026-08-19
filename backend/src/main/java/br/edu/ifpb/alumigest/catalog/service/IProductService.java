package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IProductService {
    ProductResponseDTO createProduct(ProductRequestDTO request);
    Page<ProductResponseDTO> findProducts(Pageable pageable, boolean activeOnly);
    ProductResponseDTO updateProduct(UUID id, ProductRequestDTO request);
    void inactivateProduct(UUID id);
}
