package br.edu.ifpb.alumigest.orders.domain;

/**
 * Canal utilizado pelo cliente para registrar a aprovação formal do orçamento e conversão em pedido.
 */
public enum ApprovalChannel {
    WHATSAPP("WhatsApp"),
    PRESENCIAL("Presencial"),
    TELEFONE("Telefone"),
    EMAIL("E-mail");

    private final String descricao;

    ApprovalChannel(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getLabel() {
        return descricao;
    }
}
