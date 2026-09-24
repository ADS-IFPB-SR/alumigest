package br.edu.ifpb.alumigest.catalog.dto;

import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "Requisição para cadastro ou atualização de Produto / Template de Esquadria")
public record ProductRequestDTO(
        @NotBlank(message = "O nome do produto é obrigatório")
        @Schema(description = "Nome do produto ou modelo da esquadria", example = "Porta de Giro Alumiportas")
        String name,

        @NotNull(message = "O modelo de template da esquadria é obrigatório")
        @Schema(description = "Modelo de template de esquadria (SLIDING_DOOR_2F, SWING_DOOR_1F, etc.)", example = "SLIDING_DOOR_2F")
        DoorTemplateType templateType,

        @Schema(description = "Configurações padrão e opções permitidas para orçamento")
        @Valid
        TemplateConfigDTO templateConfig,

        @Schema(description = "Categorias de insumos obrigatórias para este template")
        List<MaterialCategoryType> categoryRequirements
) {}