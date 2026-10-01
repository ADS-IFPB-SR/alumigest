package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.mapper.OrderMapper;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação das regras de negócio e consultas de Pedidos de Venda.
 */
@Service
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

  private final OrderRepository orderRepository;
  private final OrderMapper orderMapper;

  public OrderServiceImpl(OrderRepository orderRepository, OrderMapper orderMapper) {
    this.orderRepository = orderRepository;
    this.orderMapper = orderMapper;
  }

  @Override
  public OrderResponse findDetailedById(UUID id) {
    Order order = orderRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
    return orderMapper.toResponse(order);
  }
}
