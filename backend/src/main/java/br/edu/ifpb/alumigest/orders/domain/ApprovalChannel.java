package br.edu.ifpb.alumigest.orders.domain;

/**
 * Canal utilizado pelo cliente para registrar a aprovação formal do orçamento e conversão em pedido.
 */
public enum ApprovalChannel {
  WHATSAPP("WhatsApp"),
  PRESENCIAL("Presencial"),
  TELEFONE("Telefone"),
  EMAIL("E-mail");

  private final String description;

  ApprovalChannel(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }

  public String getDescricao() {
    return description;
  }

  public String getLabel() {
    return description;
  }
}

