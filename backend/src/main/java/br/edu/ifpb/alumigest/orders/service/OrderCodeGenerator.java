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

    private static final int MAX_CANDIDATE_ATTEMPTS = 500;

    private int cachedYear = -1;
    private int lastAllocatedNumber = 0;

    /**
     * Gera o próximo código sequencial no formato OS-YYYY-NNNN.
     * Consulta o último código do ano vigente no banco de dados e combina com o sequenciador
     * em memória garantindo que threads concorrentes dentro da mesma JVM não gerem o mesmo
     * identificador enquanto transações irmãs ainda não concluíram o commit físico.
     *
     * @return próximo código único da ordem de serviço
     */
    public synchronized String generateNextCode() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = String.format("OS-%d-", currentYear);

        int dbNextNumber = orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(prefix)
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

        if (currentYear != cachedYear) {
            cachedYear = currentYear;
            lastAllocatedNumber = 0;
        }

        int nextNumber = Math.max(dbNextNumber, lastAllocatedNumber + 1);

        String candidateCode = String.format("%s%04d", prefix, nextNumber);
        int attempts = 0;
        while (orderRepository.existsByCodigo(candidateCode)) {
            attempts++;
            if (attempts > MAX_CANDIDATE_ATTEMPTS) {
                throw new IllegalStateException(
                        "Limite de tentativas para gerar código sequencial único atingido para o prefixo: " + prefix);
            }
            nextNumber++;
            candidateCode = String.format("%s%04d", prefix, nextNumber);
        }

        lastAllocatedNumber = nextNumber;
        return candidateCode;
    }
}
