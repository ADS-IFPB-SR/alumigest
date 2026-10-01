package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import java.util.UUID;

/**
 * Contrato de serviço para operações de negócio e consultas de Pedidos de Venda.
 */
public interface OrderService {

  /**
   * Recupera a visualização detalhada de um pedido de venda pelo seu identificador.
   *
   * @param id Identificador único (UUID) do pedido
   * @return DTO com dados detalhados do pedido e seus itens congelados
   * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se não encontrado
   */
  OrderResponse findDetailedById(UUID id);
}

