package br.edu.ifpb.alumigest.orders.domain;

import java.util.UUID;

/**
 * Evento de domínio publicado quando uma Ordem de Serviço conclui a produção ({@code COMPLETED}),
 * permitindo a baixa física definitiva das matérias-primas reservadas.
 *
 * @param orderId identificador único da Ordem de Serviço concluída
 */
public record OrderCompletedEvent(UUID orderId) {}

