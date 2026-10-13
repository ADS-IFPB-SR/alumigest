package br.edu.ifpb.alumigest.common.port;

import java.util.Optional;
import java.util.UUID;

/**
 * Porta de consulta do módulo de pedidos para consumidores que não devem
 * depender diretamente do domínio ou do repositório de orders.
 */
public interface OrderQueryPort {

    Optional<LinkedOrder> findLatestByBudgetId(UUID budgetId);

    record LinkedOrder(String code, boolean cancelled) {
    }
}
