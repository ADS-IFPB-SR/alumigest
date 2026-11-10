package br.edu.ifpb.alumigest.orders.service.production;

import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import br.edu.ifpb.alumigest.orders.service.production.strategies.DefaultFrameCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductionSheetService {

    private final OrderRepository orderRepository;
    private final List<FrameCalculatorStrategy> calculationStrategies;
    private final FrameCalculatorStrategy defaultCalculator;

    public ProductionSheetService(OrderRepository orderRepository, List<FrameCalculatorStrategy> calculationStrategies) {
        this.orderRepository = orderRepository;
        this.calculationStrategies = calculationStrategies != null ? calculationStrategies : List.of();
        this.defaultCalculator = new DefaultFrameCalculator();
    }

    @Transactional(readOnly = true)
    public ProductionSheetResponse generateSheetData(UUID orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", orderId.toString()));

        ProductionSheetBuilder sheetBuilder = new ProductionSheetBuilder(order);

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                FrameCalculatorStrategy strategy = calculationStrategies.stream()
                        .filter(s -> s.supports(item))
                        .findFirst()
                        .orElse(defaultCalculator);

                strategy.calculateCuts(item, sheetBuilder);
            }
        }

        return sheetBuilder.build();
    }
}