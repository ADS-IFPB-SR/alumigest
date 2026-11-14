package br.edu.ifpb.alumigest.stock.domain;

/**
 * Tipos de movimentação de almoxarifado em conformidade com a RN-04.
 */
public enum StockMovementType {

    /**
     * Entrada física por nota fiscal de compra de insumos.
     */
    PURCHASE_ENTRY,

    /**
     * Reserva automática de materiais na aprovação da O.S. (US-13) ou Venda Avulsa (US-46).
     */
    PRODUCTION_RESERVATION,

    /**
     * Baixa física definitiva na conclusão da fabricação da O.S. (COMPLETED - US-18).
     */
    PRODUCTION_OUTFLOW,

    /**
     * Estorno automático de reservas quando a O.S. é cancelada (US-15).
     */
    RESERVATION_CANCELLATION,

    /**
     * Ajuste manual de inventário ou contagem física pelo almoxarife.
     */
    MANUAL_ADJUSTMENT,

    /**
     * Perda física por quebra, avaria ou refugo extraordinário de corte.
     */
    SCRAP_LOSS
}
