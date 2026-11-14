package br.edu.ifpb.alumigest.stock.repository;

import br.edu.ifpb.alumigest.stock.domain.StockMovement;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA da trilha imutável Kardex ({@link StockMovement}).
 */
@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    List<StockMovement> findByOrderIdAndTypeOrderByCreatedAtAsc(UUID orderId, StockMovementType type);

    List<StockMovement> findByOrderIdOrderByCreatedAtAsc(UUID orderId);

    boolean existsByOrderIdAndType(UUID orderId, StockMovementType type);

    @Query("""
            SELECT sm FROM StockMovement sm
            JOIN FETCH sm.stockItem si
            JOIN FETCH sm.material m
            WHERE m.id = :materialId
            ORDER BY sm.createdAt DESC
            """)
    List<StockMovement> findByMaterialIdOrderByCreatedAtDesc(@Param("materialId") UUID materialId);

    @Query("""
            SELECT sm FROM StockMovement sm
            JOIN FETCH sm.stockItem si
            JOIN FETCH sm.material m
            ORDER BY sm.createdAt DESC
            """)
    List<StockMovement> findAllWithMaterialOrderByCreatedAtDesc();
}

