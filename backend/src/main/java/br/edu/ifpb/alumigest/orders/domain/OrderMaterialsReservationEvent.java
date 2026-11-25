package br.edu.ifpb.alumigest.orders.domain;

import java.util.UUID;

/**
 * Evento de domínio publicado quando uma Ordem de Serviço é aprovada/convertida ({@code CREATED})
 * ou transiciona para aguardando produção ({@code WAITING_PRODUCTION}), acionando a reserva
 * automática não bloqueante de matérias-primas no estoque (RN-05 Make-to-Order).
 *
 * @param orderId identificador único da Ordem de Serviço
 */
public record OrderMaterialsReservationEvent(UUID orderId) {}
