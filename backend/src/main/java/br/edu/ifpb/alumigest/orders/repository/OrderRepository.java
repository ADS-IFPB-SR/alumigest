package br.edu.ifpb.alumigest.orders.repository;

import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

  Optional<Order> findTopByOrcamentoIdOrderByCreatedAtDesc(UUID orcamentoId);

  /**
   * Busca os pedidos vinculados a um orçamento em ordem determinística (mais recente primeiro),
   * utilizando o tamanho e valor lexicográfico do código e o UUID como critérios de desempate.
   *
   * @param orcamentoId identificador único do orçamento
   * @param pageable    limite da paginação (esperado {@code PageRequest.of(0, 1)})
   * @return lista ordenada de pedidos vinculados
   */
  @Query("""
        SELECT o FROM Order o
        WHERE o.orcamentoId = :orcamentoId
        ORDER BY o.createdAt DESC, LENGTH(o.codigo) DESC, o.codigo DESC, o.id DESC
      """)
  List<Order> findLatestOrdersByOrcamentoId(
      @Param("orcamentoId") UUID orcamentoId, Pageable pageable);

  /**
   * Recupera o pedido mais recente vinculado a um orçamento de origem.
   *
   * @param orcamentoId identificador único do orçamento
   * @return pedido mais recente, caso exista
   */
  default Optional<Order> findLatestByOrcamentoId(UUID orcamentoId) {
    return findLatestOrdersByOrcamentoId(orcamentoId, PageRequest.of(0, 1)).stream().findFirst();
  }

  boolean existsByOrcamentoIdAndStatusNot(UUID orcamentoId, OrderStatus status);

  boolean existsByCodigo(String codigo);

  Page<Order> findByStatus(OrderStatus status, Pageable pageable);

  Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

  /**
   * Busca os códigos recentes por prefixo anual ordenados numericamente
   * (maior comprimento de string primeiro, seguido de maior valor lexicográfico).
   * Garante que "OS-2026-10000" preceda "OS-2026-9999".
   *
   * @param prefix Prefixo anual do código (ex: "OS-2026-")
   * @param pageable Limite e paginação da busca
   * @return Lista de códigos encontrados
   */
  @Query("""
        SELECT o.codigo FROM Order o
        WHERE o.codigo LIKE CONCAT(:prefix, '%')
        ORDER BY LENGTH(o.codigo) DESC, o.codigo DESC
      """)
  List<String> findRecentCodigosByPrefix(@Param("prefix") String prefix, Pageable pageable);

  /**
   * Busca pedidos recentes por prefixo anual com ordenação numérica.
   *
   * @param prefix Prefixo anual do código (ex: "OS-2026-")
   * @param pageable Limite e paginação da busca
   * @return Lista de pedidos ordenados
   */
  @Query("""
        SELECT o FROM Order o
        WHERE o.codigo LIKE CONCAT(:prefix, '%')
        ORDER BY LENGTH(o.codigo) DESC, o.codigo DESC
      """)
  List<Order> findTopOrdersByPrefix(@Param("prefix") String prefix, Pageable pageable);

  /**
   * Busca o pedido com o código mais recente por prefixo anual,
   * delegando para consulta ordenada por comprimento numérico.
   *
   * @param prefix Prefixo anual do código (ex: "OS-2026-")
   * @return Pedido mais recente
   */
  default Optional<Order> findTopByCodigoStartingWithOrderByCodigoDesc(String prefix) {
    return findTopOrdersByPrefix(prefix, PageRequest.of(0, 1)).stream().findFirst();
  }

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
          AND (:channel IS NULL OR o.canalAprovacao = :channel)
          AND (CAST(:search AS string) IS NULL OR :search = ''
               OR LOWER(o.codigo) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(o.clienteNome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR o.orcamentoId IN (SELECT b.id FROM Budget b WHERE LOWER(b.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))))
          AND o.ativo = true
      """)
  Page<Order> findAllWithFilters(
      @Param("status") OrderStatus status,
      @Param("channel") ApprovalChannel channel,
      @Param("search") String search,
      Pageable pageable
  );
}
