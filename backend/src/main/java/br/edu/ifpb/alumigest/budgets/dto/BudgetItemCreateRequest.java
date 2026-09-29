package br.edu.ifpb.alumigest.budgets.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO imutável para receber os dados de adição de esquadrias ou insumos avulsos.
 *
 * <p>Utilizado pelo endpoint: {@code POST /api/budgets/{id}/items}
 *
 * @param productId          ID do produto (esquadria ou insumo) — obrigatório
 * @param descricao          Descrição do item — obrigatório
 * @param larguraMm          Largura em milímetros — deve ser estritamente positiva
 * @param alturaMm           Altura em milímetros — deve ser estritamente positiva
 * @param quantidade         Quantidade de itens — mínimo 1
 * @param corAluminio        Cor do alumínio — opcional
 * @param tipoVidro          Tipo do vidro — opcional
 * @param orientacaoAbertura Orientação de abertura — opcional
 * @param ferragens          Descrição das ferragens — opcional
 * @param valorUnitario      Valor unitário — não pode ser negativo
 */
public record BudgetItemCreateRequest(

        @NotNull(message = "O ID do produto é obrigatório")
        UUID productId,

        @NotBlank(message = "A descrição do item é obrigatória")
        String descricao,

        @NotNull(message = "A largura é obrigatória")
        @Positive(message = "A largura (larguraMm) deve ser estritamente positiva")
        BigDecimal larguraMm,

        @NotNull(message = "A altura é obrigatória")
        @Positive(message = "A altura (alturaMm) deve ser estritamente positiva")
        BigDecimal alturaMm,

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 1, message = "A quantidade de itens deve ser pelo menos 1")
        Integer quantidade,

        String corAluminio,

        String tipoVidro,

        String orientacaoAbertura,

        String ferragens,

        @NotNull(message = "O valor unitário é obrigatório")
        @PositiveOrZero(message = "O valor unitário não pode ser negativo")
        BigDecimal valorUnitario

) {}
