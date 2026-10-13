package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.port.OrderQueryPort;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class OrderQueryAdapter implements OrderQueryPort {

    private final OrderRepository orderRepository;

    public OrderQueryAdapter(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public Optional<LinkedOrder> findLatestByBudgetId(UUID budgetId) {
        return orderRepository.findTopByOrcamentoIdOrderByCreatedAtDesc(budgetId)
                .map(order -> new LinkedOrder(
                        order.getCodigo(),
                        order.getStatus() == OrderStatus.CANCELLED
                ));
    }
}
