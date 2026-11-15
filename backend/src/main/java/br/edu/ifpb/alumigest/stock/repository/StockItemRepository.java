package br.edu.ifpb.alumigest.stock.repository;

import br.edu.ifpb.alumigest.stock.domain.StockItem;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para itens de estoque com suporte a bloqueio pessimista
 * contra condições de corrida em reservas, baixas e estornos concorrentes.
 */
@Repository
public interface StockItemRepository extends JpaRepository<StockItem, UUID> {

    Optional<StockItem> findByMaterialId(UUID materialId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM StockItem s WHERE s.material.id = :materialId")
    Optional<StockItem> findByMaterialIdForUpdate(@Param("materialId") UUID materialId);

    @Query("SELECT s FROM StockItem s JOIN FETCH s.material m LEFT JOIN FETCH m.group ORDER BY m.name ASC")
    List<StockItem> findAllWithMaterial();
}
