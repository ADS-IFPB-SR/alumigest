package br.edu.ifpb.alumigest.orders.mapper;

import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.domain.OrderItemOption;
import br.edu.ifpb.alumigest.orders.dto.OrderItemOptionResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderItemResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

/**
 * Mapper MapStruct para conversão entre entidades do domínio Order e DTOs Records imutáveis.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OrderMapper {

  @Mapping(target = "clienteId", source = "cliente.id")
  @Mapping(
      target = "statusDescricao",
      expression = "java(order.getStatus() != null ? order.getStatus().getDescription() : null)"
  )
  @Mapping(
      target = "canalAprovacaoDescricao",
      expression = "java(order.getCanalAprovacao() != null"
          + " ? order.getCanalAprovacao().getDescription() : null)"
  )
  @Mapping(target = "items", source = "items")
  OrderResponse toResponse(Order order);

  @Mapping(target = "orderId", source = "order.id")
  @Mapping(target = "productId", source = "product.id")
  @Mapping(target = "options", source = "options")
  OrderItemResponse toItemResponse(OrderItem item);

  @Mapping(target = "orderItemId", source = "orderItem.id")
  @Mapping(target = "materialId", source = "material.id")
  OrderItemOptionResponse toOptionResponse(OrderItemOption option);

  @Mapping(
      target = "statusDescricao",
      expression = "java(order.getStatus() != null ? order.getStatus().getDescription() : null)"
  )
  @Mapping(
      target = "canalAprovacaoDescricao",
      expression = "java(order.getCanalAprovacao() != null"
          + " ? order.getCanalAprovacao().getDescription() : null)"
  )
  @Mapping(
      target = "quantidadeItens",
      expression = "java(order.getItems() != null ? order.getItems().size() : 0)"
  )
  OrderSummaryResponse toSummaryResponse(Order order);
}
