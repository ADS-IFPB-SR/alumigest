package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import java.time.Year;
import java.time.ZoneOffset;
import org.springframework.stereotype.Component;

/**
 * Gerador de código sequencial para Ordens de Serviço (Pedidos de Venda) no padrão OS-YYYY-NNNN.
 * Responsabilidade única (SRP): apenas gerar o próximo código sequencial anual de forma thread-safe.
 */
@Component
public class OrderCodeGenerator {

    private final OrderRepository orderRepository;

    /**
     * Construtor com injeção de dependência via interface (DIP).
     *
     * @param orderRepository repositório de ordens de serviço
     */
    public OrderCodeGenerator(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Gera o próximo código sequencial no formato OS-YYYY-NNNN.
     * Consulta o último código do ano vigente para incrementar a sequência,
     * garantindo exclusão mútua e avanço defensivo caso o código já exista.
     *
     * @return próximo código único da ordem de serviço
     */
    public synchronized String generateNextCode() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = String.format("OS-%d-", currentYear);

        int nextNumber = orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(prefix)
                .map(lastOrder -> {
                    String lastCode = lastOrder.getCodigo();
                    try {
                        int lastNumber = Integer.parseInt(lastCode.substring(prefix.length()));
                        return lastNumber + 1;
                    } catch (NumberFormatException e) {
                        return 1;
                    }
                })
                .orElse(1);

        String candidateCode = String.format("%s%04d", prefix, nextNumber);
        while (orderRepository.existsByCodigo(candidateCode)) {
            nextNumber++;
            candidateCode = String.format("%s%04d", prefix, nextNumber);
        }

        return candidateCode;
    }
}
