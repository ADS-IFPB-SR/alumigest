package br.edu.ifpb.alumigest.partsale.domain;

/**
 * Estados do ciclo de vida comercial da Venda de Partes (US-46 / US-46.1).
 */
public enum PartSaleStatus {
  DRAFT,
  APPROVED,
  CANCELLED;

  /**
   * Valida se a transição para o novo status é permitida pela máquina de estados.
   *
   * @param targetStatus novo status pretendido
   * @return true se a transição for válida, false caso contrário
   */
  public boolean canTransitionTo(PartSaleStatus targetStatus) {
    if (this == targetStatus) {
      return true;
    }

    return switch (this) {
      case DRAFT -> targetStatus == APPROVED || targetStatus == CANCELLED;
      case APPROVED -> targetStatus == CANCELLED;
      case CANCELLED -> false;
    };
  }
}

