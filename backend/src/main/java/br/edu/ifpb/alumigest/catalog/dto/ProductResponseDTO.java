package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Dados de resposta do Produto / Template de Esquadria")
public record ProductResponseDTO(
        @Schema(description = "ID único do produto", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
        UUID id,

        @Schema(description = "Nome do produto ou modelo", example = "Porta de Giro Alumiportas")
        String name,

        @Schema(description = "ID da categoria", example = "b1ffcd88-9c0b-4ef8-bb6d-6bb9bd380a22")
        UUID categoryId,

        @Schema(description = "Nome da categoria", example = "Portas de Giro")
        String categoryName,

        @Schema(description = "Modelo de template de esquadria", example = "GIRO")
        DoorTemplateType templateType,

        @Schema(description = "Configurações padrão e esquema de opções do template")
        TemplateConfigDTO templateConfig,

        @Schema(description = "Categorias de insumos requeridas")
        List<MaterialCategoryType> categoryRequirements,

        @Schema(description = "Indica se o produto está ativo", example = "true")
        boolean isActive,

        @Schema(description = "Itens e insumos fixos vinculados")
        List<ProductItemResponseDTO> items
) {}