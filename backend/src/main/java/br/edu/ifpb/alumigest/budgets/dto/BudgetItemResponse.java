package br.edu.ifpb.alumigest.budgets.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Record DTO imutável que representa a resposta detalhada de um item de orçamento (esquadria ou insumo).
 *
 * <p>Alinhado com a tarefa US-09.18 (#188) para detalhar dimensões técnicas, precificação e observações da esquadria.
 *
 * @param id            Identificador único do item de orçamento
 * @param productId     Identificador do produto / esquadria associada
 * @param productName   Nome ou descrição da esquadria / produto
 * @param larguraMm     Largura em milímetros da esquadria
 * @param alturaMm      Altura em milímetros da esquadria
 * @param quantidade    Quantidade de unidades do item
 * @param valorUnitario Valor monetário unitário do item
 * @param subtotal      Subtotal monetário do item (valorUnitario * quantidade)
 * @param observacoes   Observações técnicas ou especificações da esquadria
 */
public record BudgetItemResponse(
        UUID id,
        UUID productId,
        String productName,
        BigDecimal larguraMm,
        BigDecimal alturaMm,
        Integer quantidade,
        BigDecimal valorUnitario,
        BigDecimal subtotal,
        String observacoes
) {

    /**
     * Construtor de conveniência que calcula o subtotal automaticamente a partir
     * do valor unitário e da quantidade caso o subtotal não seja informado diretamente.
     */
    public BudgetItemResponse(
            UUID id,
            UUID productId,
            String productName,
            BigDecimal larguraMm,
            BigDecimal alturaMm,
            Integer quantidade,
            BigDecimal valorUnitario,
            String observacoes
    ) {
        this(
                id,
                productId,
                productName,
                larguraMm,
                alturaMm,
                quantidade,
                valorUnitario,
                (valorUnitario != null && quantidade != null)
                        ? valorUnitario.multiply(BigDecimal.valueOf(quantidade))
                        : BigDecimal.ZERO,
                observacoes
        );
    }
}
