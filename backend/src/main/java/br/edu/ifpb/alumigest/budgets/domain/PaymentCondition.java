package br.edu.ifpb.alumigest.budgets.domain;

public enum PaymentCondition {
    A_VISTA_PIX("À Vista (PIX / Dinheiro)"),
    ENTRADA_50_SALDO_ENTREGA("50% Entrada + 50% na Entrega"),
    CARTAO_12X("Cartão de Crédito até 12x"),
    A_COMBINAR("A Combinar");

    private final String descricao;

    PaymentCondition(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}