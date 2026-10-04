package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.time.ZoneOffset;

/**
 * Gerador de código sequencial para Pedidos de Venda no padrão PED-YYYY-NNNN.
 * Responsabilidade única (SRP): apenas gerar o próximo código sequencial anual.
 */
@Component
public class OrderCodeGenerator {

    private final OrderRepository orderRepository;

    /**
     * Construtor com injeção de dependência via interface (DIP).
     *
     * @param orderRepository repositório de pedidos
     */
    public OrderCodeGenerator(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Gera o próximo código sequencial no formato PED-YYYY-NNNN.
     * Consulta o último código do ano vigente para incrementar a sequência.
     *
     * @return próximo código único do pedido de venda
     */
    public String generateNextCode() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = String.format("PED-%d-", currentYear);

        return orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(prefix)
                .map(lastOrder -> {
                    String lastCode = lastOrder.getCodigo();
                    int lastNumber = Integer.parseInt(lastCode.substring(prefix.length()));
                    return String.format("%s%04d", prefix, lastNumber + 1);
                })
                .orElse(prefix + "0001");
    }
}
