package br.edu.ifpb.alumigest.orders.repository;

import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositório Spring Data JPA para a entidade Order.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

  Optional<Order> findByCodigo(String codigo);

  Optional<Order> findByOrcamentoId(UUID orcamentoId);

  boolean existsByOrcamentoId(UUID orcamentoId);

  boolean existsByCodigo(String codigo);

  Page<Order> findByStatus(OrderStatus status, Pageable pageable);

  Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

  /**
   * Busca o pedido com o código mais recente por prefixo anual (ex: "PED-2026-").
   *
   * @param prefix Prefixo anual do código (ex: "PED-2026-")
   * @return Pedido mais recente com o prefixo
   */
  Optional<Order> findTopByCodigoStartingWithOrderByCodigoDesc(String prefix);

  @Query("""
        SELECT o FROM Order o
        LEFT JOIN FETCH o.cliente c
        LEFT JOIN FETCH o.items i
        WHERE o.id = :id
      """)
  Optional<Order> findByIdWithDetails(@Param("id") UUID id);

  @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
          AND (CAST(:busca AS string) IS NULL OR :busca = ''
               OR LOWER(o.codigo) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%'))
               OR LOWER(o.clienteNome) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%')))
          AND o.ativo = true
      """)
  Page<Order> findAllWithFilters(
      @Param("status") OrderStatus status,
      @Param("busca") String busca,
      Pageable pageable
  );
}
