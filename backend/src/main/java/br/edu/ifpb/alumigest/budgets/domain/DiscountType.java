package br.edu.ifpb.alumigest.budgets.domain;

public enum DiscountType {
    PERCENTUAL("Percentual (%)"),
    VALOR_FIXO("Valor Fixo (R$)");

    private final String descricao;

    DiscountType(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}