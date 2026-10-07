package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import org.springframework.data.domain.Pageable;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;

import java.util.UUID;

/**
 * Contrato de serviço para operações de negócio e consultas de Pedidos de Venda.
 * Define as operações sem acoplamento à implementação (DIP / OCP).
 */
public interface OrderService {

    /**
     * Converte um orçamento elegível (DRAFT, SENT ou APPROVED) em pedido de venda de forma atômica.
     * O status do orçamento é promovido para APPROVED na mesma transação.
     *
     * @param budgetId ID do orçamento a ser convertido
     * @param request  dados da aprovação (canal, previsão de entrega, observações)
     * @return DTO completo do pedido criado
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se o orçamento não for encontrado
     * @throws br.edu.ifpb.alumigest.common.exception.BusinessException         se o orçamento estiver em status inelegível ou sem itens
     * @throws br.edu.ifpb.alumigest.common.exception.ConflictException         se já existir pedido para o orçamento
     */
    OrderResponse convertBudgetToOrder(UUID budgetId, OrderConvertRequest request);

    /**
     * Cancela formalmente um pedido de venda / ordem de serviço mediante justificativa obrigatória.
     * Somente permitido para pedidos nos status CREATED ou WAITING_PRODUCTION.
     *
     * @param id      identificador único (UUID) do pedido
     * @param request payload contendo justificativa de cancelamento (mínimo 10 caracteres)
     * @return DTO com dados atualizados do pedido com status CANCELLED
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se o pedido não for localizado
     * @throws br.edu.ifpb.alumigest.common.exception.BusinessException         se o pedido estiver em status inelegível (ex: em produção ou concluído)
     */
    OrderResponse cancelOrder(UUID id, OrderCancelRequest request);

    /**
     * Recupera a visualização detalhada de um pedido de venda pelo seu identificador.
     *
     * @param id Identificador único (UUID) do pedido
     * @return DTO com dados detalhados do pedido e seus itens congelados
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se não encontrado
     */
    OrderResponse findDetailedById(UUID id);

    /**
     * Lista pedidos de venda de forma paginada com suporte a filtros dinâmicos.
     *
     * @param status   filtro opcional por status do pedido
     * @param channel  filtro opcional por canal de aprovação
     * @param search   termo para busca textual (código do pedido, cliente ou código do orçamento)
     * @param pageable parâmetros de paginação e ordenação
     * @return página de pedidos sumarizados
     */
    PageResponse<OrderSummaryResponse> findAll(
            OrderStatus status,
            ApprovalChannel channel,
            String search,
            Pageable pageable
    );

    OrderResponse updateStatus(UUID id, OrderStatus status);

}
