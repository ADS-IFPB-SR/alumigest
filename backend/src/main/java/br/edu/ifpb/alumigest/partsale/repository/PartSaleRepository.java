package br.edu.ifpb.alumigest.partsale.repository;

import br.edu.ifpb.alumigest.partsale.domain.PartSale;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para a entidade agregadora de Venda de Partes (US-46).
 */
@Repository
public interface PartSaleRepository extends JpaRepository<PartSale, UUID> {

  Optional<PartSale> findByCode(String code);

  @Query("SELECT p.code FROM PartSale p WHERE p.code LIKE :prefix% ORDER BY p.code DESC LIMIT 1")
  Optional<String> findLatestCodeForPrefix(@Param("prefix") String prefix);

  /**
   * Consulta paginada com suporte a filtros dinâmicos de status comercial e busca textual por código ou nome do cliente.
   *
   * @param search   termo de pesquisa (código VP-... ou nome do cliente)
   * @param status   status da venda (DRAFT, APPROVED, CANCELLED)
   * @param pageable parâmetros de paginação e ordenação
   * @return página de vendas de partes
   */
  @Query(value = """
      SELECT p FROM PartSale p
      LEFT JOIN Client c ON p.clientId = c.id
      WHERE (:status IS NULL OR p.status = :status)
        AND (:search IS NULL OR :search = ''
             OR LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
      ORDER BY p.createdAt DESC
  """, countQuery = """
      SELECT COUNT(p) FROM PartSale p
      LEFT JOIN Client c ON p.clientId = c.id
      WHERE (:status IS NULL OR p.status = :status)
        AND (:search IS NULL OR :search = ''
             OR LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
  """)
  Page<PartSale> findAllWithFilters(
      @Param("search") String search,
      @Param("status") PartSaleStatus status,
      Pageable pageable
  );
}
