package br.edu.ifpb.alumigest.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para criação de nova categoria de produto")
public record ProductCategoryRequestDTO(
        @NotBlank(message = "O nome da categoria é obrigatório")
        @Size(max = 100, message = "O nome da categoria deve ter no máximo 100 caracteres")
        @Schema(description = "Nome da categoria", example = "Gavetas")
        String name,

        @Schema(description = "Descrição opcional da categoria", example = "Frentes de gaveta e gaveteiros")
        String description
) {}
