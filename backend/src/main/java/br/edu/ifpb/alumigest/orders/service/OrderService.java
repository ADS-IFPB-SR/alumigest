package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;

import java.util.UUID;

/**
 * Contrato de serviço para o módulo de Pedidos de Venda.
 * Define as operações de negócio sem acoplamento à implementação (DIP / OCP).
 */
public interface OrderService {

    /**
     * Converte um orçamento aprovado em pedido de venda de forma atômica.
     *
     * @param budgetId ID do orçamento a ser convertido
     * @param request  dados da aprovação (canal, previsão de entrega, observações)
     * @return DTO completo do pedido criado
     */
    OrderResponse convertBudgetToOrder(UUID budgetId, OrderConvertRequest request);

    /**
     * Busca o pedido pelo seu ID retornando a representação detalhada.
     *
     * @param id ID do pedido
     * @return DTO completo do pedido
     */
    OrderResponse findById(UUID id);
}
