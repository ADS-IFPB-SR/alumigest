package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import java.time.Year;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * Gerador de código sequencial para Ordens de Serviço (Pedidos de Venda) no padrão OS-YYYY-NNNN.
 * Responsabilidade única (SRP): apenas gerar o próximo código sequencial anual de forma thread-safe.
 */
@Component
public class OrderCodeGenerator {

    private static final Logger log = LoggerFactory.getLogger(OrderCodeGenerator.class);

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
     * <p>Nota de escalabilidade: A sincronização via {@code synchronized} garante unicidade intra-JVM.
     * Colisões eventuais entre réplicas concorrentes em cluster são tratadas pelo {@code @Retryable}
     * com backoff exponencial no serviço de criação; migração nativa para SEQUENCE do PostgreSQL
     * mapeada para sprints futuras.
     *
     * @return próximo código único da ordem de serviço
     */
    public synchronized String generateNextCode() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = String.format("OS-%d-", currentYear);

        List<String> rawCodes = orderRepository.findRecentCodigosByPrefix(prefix, PageRequest.of(0, 50));
        List<String> recentCodes = rawCodes != null ? new ArrayList<>(rawCodes) : new ArrayList<>();

        // Fallback para testes legados que configuraram apenas findTopByCodigoStartingWithOrderByCodigoDesc
        if (recentCodes.isEmpty()) {
            orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(prefix)
                    .ifPresent(o -> recentCodes.add(o.getCodigo()));
        }

        int dbNextNumber = 1;
        for (String code : recentCodes) {
            if (code == null || !code.startsWith(prefix)) {
                continue;
            }
            String suffix = code.substring(prefix.length());
            try {
                int lastNumber = Integer.parseInt(suffix);
                dbNextNumber = lastNumber + 1;
                break;
            } catch (NumberFormatException e) {
                log.warn("Código malformado com sufixo não numérico ignorado no sequenciador: '{}' com prefixo '{}'.",
                        code, prefix);
            }
        }

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
