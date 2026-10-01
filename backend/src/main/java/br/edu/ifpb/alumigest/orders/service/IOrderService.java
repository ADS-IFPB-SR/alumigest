package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface IOrderService {
    PageResponse<OrderSummaryResponse> findAll(OrderStatus status, String busca, Pageable pageable);
}