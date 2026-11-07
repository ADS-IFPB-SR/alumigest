package br.edu.ifpb.alumigest.partsale.repository;

import br.edu.ifpb.alumigest.partsale.domain.PartSale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para a entidade agregadora de Venda de Partes.
 */
@Repository
public interface PartSaleRepository extends JpaRepository<PartSale, UUID> {

  Optional<PartSale> findByCode(String code);

  @Query("SELECT p.code FROM PartSale p WHERE p.code LIKE :prefix% ORDER BY p.code DESC LIMIT 1")
  Optional<String> findLatestCodeForPrefix(@Param("prefix") String prefix);
}

