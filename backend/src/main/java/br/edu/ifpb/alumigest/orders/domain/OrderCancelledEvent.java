package br.edu.ifpb.alumigest.orders.domain;

import java.util.UUID;

/**
 * Evento de domínio publicado quando uma Ordem de Serviço é cancelada,
 * permitindo que o módulo de orçamentos reabra o orçamento de origem quando elegível.
 *
 * @param orcamentoId identificador único do orçamento vinculado à ordem cancelada
 */
public record OrderCancelledEvent(UUID orcamentoId) {}
