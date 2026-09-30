package br.edu.ifpb.alumigest.orders.repository;

import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório Spring Data JPA para a entidade OrderItem.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

  List<OrderItem> findByOrderIdOrderByOrdemAsc(UUID orderId);
}
