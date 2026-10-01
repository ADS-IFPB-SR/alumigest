package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;

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
     * Recupera a visualização detalhada de um pedido de venda pelo seu identificador.
     *
     * @param id Identificador único (UUID) do pedido
     * @return DTO com dados detalhados do pedido e seus itens congelados
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se não encontrado
     */
    OrderResponse findDetailedById(UUID id);
}
