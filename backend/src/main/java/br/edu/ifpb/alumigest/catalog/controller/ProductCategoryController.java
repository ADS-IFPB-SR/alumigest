package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.ProductCategory;
import br.edu.ifpb.alumigest.catalog.dto.ProductCategoryRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductCategoryResponseDTO;
import br.edu.ifpb.alumigest.catalog.repository.ProductCategoryRepository;
import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/product-categories")
@Tag(name = "Categorias de Produtos", description = "Listagem e cadastro de categorias para esquadrias")
public class ProductCategoryController {

    private final ProductCategoryRepository repository;

    public ProductCategoryController(ProductCategoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(summary = "Listar todas as categorias ativas", description = "Retorna lista de categorias para popular o Dropdown no front-end")
    public ResponseEntity<ApiResponse<List<ProductCategoryResponseDTO>>> findAllActive() {
        List<ProductCategoryResponseDTO> categories = repository.findAll().stream()
                .filter(c -> c.isActive())
                .map(c -> new ProductCategoryResponseDTO(c.getId(), c.getName(), c.getDescription()))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok("Categorias listadas com sucesso", categories));
    }

    @PostMapping
    @Operation(summary = "Criar nova categoria de produto", description = "Cadastra uma nova categoria para produtos/esquadrias")
    public ResponseEntity<ApiResponse<ProductCategoryResponseDTO>> create(@Valid @RequestBody ProductCategoryRequestDTO request) {
        ProductCategory category = new ProductCategory();
        category.setName(request.name().trim());
        category.setDescription(request.description() != null ? request.description().trim() : null);
        category.setActive(true);
        ProductCategory saved = repository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Categoria criada com sucesso", new ProductCategoryResponseDTO(saved.getId(), saved.getName(), saved.getDescription())));
    }
}
