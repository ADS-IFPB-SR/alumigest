package br.edu.ifpb.alumigest.partsale.repository;

import br.edu.ifpb.alumigest.partsale.domain.PartSaleItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para itens da Venda de Partes.
 */
@Repository
public interface PartSaleItemRepository extends JpaRepository<PartSaleItem, UUID> {

  List<PartSaleItem> findByPartSaleId(UUID partSaleId);
}

