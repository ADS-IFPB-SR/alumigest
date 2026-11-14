package br.edu.ifpb.alumigest.orders.domain;

import java.util.UUID;

/**
 * Evento de domínio publicado quando uma Ordem de Serviço é cancelada,
 * acionando o estorno automático das reservas de materiais no módulo de estoque.
 *
 * @param orderId identificador único da Ordem de Serviço cancelada
 */
public record OrderStockCancelledEvent(UUID orderId) {}

