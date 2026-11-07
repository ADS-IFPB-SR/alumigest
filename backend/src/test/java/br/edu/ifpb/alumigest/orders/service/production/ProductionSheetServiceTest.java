package br.edu.ifpb.alumigest.orders.service.production;

import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários: ProductionSheetService")
class ProductionSheetServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private FrameCalculatorStrategy calculatorStrategy;

    private ProductionSheetService productionSheetService;

    @BeforeEach
    void setUp() {
        productionSheetService = new ProductionSheetService(orderRepository, List.of(calculatorStrategy));
    }

    @Test
    @DisplayName("generateSheetData - Deve gerar dados da ficha técnica quando a strategy for compatível")
    void generateSheetData_ShouldGenerateData_WhenStrategySupports() {
        UUID orderId = UUID.randomUUID();

        Order order = Order.builder()
                .codigo("OS-2026-0042")
                .clienteNome("Antônio Alfredo")
                .build();

        OrderItem item = OrderItem.builder()
                .descricao("Janela de Correr Suprema")
                .larguraMm(1200)
                .alturaMm(1000)
                .quantidade(1)
                .valorUnitario(new BigDecimal("900.00"))
                .build();
        order.addItem(item);

        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.of(order));
        when(calculatorStrategy.supports(item)).thenReturn(true);

        ProductionSheetResponse response = productionSheetService.generateSheetData(orderId);

        assertThat(response).isNotNull();
        assertThat(response.orderCode()).isEqualTo("OS-2026-0042");
        assertThat(response.clientName()).isEqualTo("Antônio Alfredo");

        verify(calculatorStrategy).calculateCuts(any(OrderItem.class), any(ProductionSheetBuilder.class));
    }

    @Test
    @DisplayName("generateSheetData - Deve lançar ResourceNotFoundException quando pedido não existir")
    void generateSheetData_ShouldThrowException_WhenOrderNotFound() {
        UUID orderId = UUID.randomUUID();
        when(orderRepository.findByIdWithDetails(orderId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productionSheetService.generateSheetData(orderId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
