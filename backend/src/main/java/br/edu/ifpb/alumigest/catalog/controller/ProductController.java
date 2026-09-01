package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.ProductRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.ProductResponseDTO;
import br.edu.ifpb.alumigest.catalog.service.IProductService;
import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/products")
@Tag(name = "Produtos e Templates (Esquadrias)", description = "Gerenciamento de produtos finais, templates paramétricos SVG e esquemas de opções para orçamento")
public class ProductController {

    private final IProductService productService;

    public ProductController(IProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @Operation(summary = "Cadastrar Produto ou Template", description = "Cria um novo produto ou template de esquadria (SWING, SLIDING, TILT, DRAWER) com seu esquema de opções e requisitos de categorias de insumos.")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> createProduct(@Valid @RequestBody ProductRequestDTO request) {
        ProductResponseDTO response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Produto cadastrado com sucesso", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Produto por ID", description = "Retorna os detalhes de um produto específico e sua ficha técnica.")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProductById(@PathVariable UUID id) {
        ProductResponseDTO product = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.ok("Produto encontrado com sucesso", product));
    }

    @GetMapping
    @Operation(summary = "Listar Produtos", description = "Retorna uma lista paginada de produtos e templates. Permite filtrar apenas ativos (padrão) ou todos.")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponseDTO>>> listProducts(
            Pageable pageable,
            @RequestParam(defaultValue = "true") boolean activeOnly) {

        Page<ProductResponseDTO> page = productService.findProducts(pageable, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok("Produtos listados com sucesso", PageResponse.of(page)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar Produto ou Template", description = "Atualiza os dados do produto, template paramétrico, esquema de opções e requisitos de categorias de insumos.")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequestDTO request) {

        ProductResponseDTO response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Produto atualizado com sucesso", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativar Produto", description = "Realiza a exclusão lógica (inativação) do produto ou template.")
    public ResponseEntity<Void> inactivateProduct(@PathVariable UUID id) {
        productService.inactivateProduct(id);
        return ResponseEntity.noContent().build();
    }
}