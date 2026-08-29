package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Schema(description = "Requisição para cadastro ou atualização de Produto / Template de Esquadria")
public record ProductRequestDTO(
        @NotBlank(message = "O nome do produto é obrigatório")
        @Schema(description = "Nome do produto ou modelo da esquadria", example = "Porta de Giro Alumiportas")
        String name,

        @NotNull(message = "A categoria é obrigatória")
        @Schema(description = "ID da categoria do produto", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
        UUID categoryId,

        @NotNull(message = "O custo de mão de obra é obrigatório")
        @PositiveOrZero(message = "O custo não pode ser negativo")
        @Schema(description = "Custo base de mão de obra", example = "150.00")
        BigDecimal laborCost,

        @Schema(description = "Modelo de template de esquadria (GIRO, CORRER, BASCULANTE, GAVETA)", example = "GIRO")
        DoorTemplateType templateType,

        @Schema(description = "Configurações padrão e opções permitidas para orçamento")
        @Valid
        TemplateConfigDTO templateConfig,

        @Schema(description = "Categorias de insumos obrigatórias para este template")
        List<MaterialCategoryType> categoryRequirements,

        @Schema(description = "Itens e insumos fixos opcionais")
        @Valid
        List<ProductItemRequestDTO> items
) {}