package br.edu.ifpb.alumigest.stock.service;

import br.edu.ifpb.alumigest.stock.dto.StockBalanceFilter;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

/**
 * Porta de entrada e contrato de serviços do módulo de estoque.
 *
 * <p>Define as operações fundamentais para automação de reservas, baixas fabris,
 * cancelamentos e auditoria Kardex, assegurando conformidade com o modelo Make-to-Order.
 */
public interface StockPort {

    /**
     * Reserva matérias-primas automaticamente ao aprovar uma Ordem de Serviço (US-13)
     * ou confirmar uma Venda Avulsa (US-46).
     *
     * @param orderId Identificador da Ordem de Serviço ou Venda Avulsa
     */
    void reserveMaterialsForOrder(UUID orderId);

    /**
     * Efetua a baixa física definitiva dos materiais reservados quando a O.S.
     * atinge o status COMPLETED (US-18).
     *
     * @param orderId Identificador da Ordem de Serviço concluída
     */
    void consumeReservedMaterialsForOrder(UUID orderId);

    /**
     * Estorna as reservas de materiais quando uma O.S. é formalmente cancelada (US-15).
     *
     * @param orderId Identificador da Ordem de Serviço cancelada
     */
    void cancelReservationsForOrder(UUID orderId);

    /**
     * Registra movimentação manual de estoque (compras, ajustes ou perdas).
     *
     * @param request Dados da movimentação
     * @return Dados da movimentação persistida na trilha Kardex
     */
    StockMovementResponseDTO registerMovement(StockMovementRequestDTO request);

    /**
     * Consulta o saldo consolidado de um insumo específico.
     *
     * @param materialId Identificador do material
     * @return Saldo físico, reservado e disponível do item
     */
    StockItemResponseDTO getStockBalance(UUID materialId);

    /**
     * Lista os saldos de estoque de todos os insumos cadastrados.
     *
     * @return Lista com os saldos consolidados
     */
    List<StockItemResponseDTO> listStockBalances();

    /**
     * Lista os saldos consolidados aplicando filtros de suprimentos e ordenação segura.
     *
     * @param filter critérios opcionais de filtragem e ordenação
     * @return Lista filtrada e ordenada com os saldos consolidados
     */
    default List<StockItemResponseDTO> listStockBalances(StockBalanceFilter filter) {
        return listStockBalances();
    }

    /**
     * Lista o histórico imutável de movimentações Kardex, opcionalmente filtrado por material.
     *
     * @param materialId Identificador opcional do material
     * @return Lista ordenada cronologicamente do registro mais recente ao mais antigo
     */
    List<StockMovementResponseDTO> listMovements(UUID materialId);
    /**
     * Garante a existência do registro em tb_stock_items para o material e aplica o ponto de pedido, se informado.
     */
    StockItemResponseDTO provisionStockItem(UUID materialId, BigDecimal minimumStock);
}
