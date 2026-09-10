package br.edu.ifpb.alumigest.budgets.domain;

public enum BudgetStatus {
    DRAFT("Rascunho"),
    SENT("Enviado"),
    APPROVED("Aprovado"),
    REJECTED("Rejeitado"),
    CANCELLED("Cancelado"),
    EXPIRED("Expirado");

    private final String descricao;

    BudgetStatus(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}