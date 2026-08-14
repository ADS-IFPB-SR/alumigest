package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialRepository extends JpaRepository<Material, UUID> {

    Page<Material> findByIsActiveTrue(Pageable pageable);
    Page<Material> findByGroupIdAndIsActiveTrue(UUID groupId, Pageable pageable);
    List<Material> findByGroupIdAndIsActiveTrue(UUID groupId);
    Optional<Material> findByIdAndIsActiveTrue(UUID id);
    Optional<Material> findBySkuCodeAndIsActiveTrue(String skuCode);

    @Query("SELECT m FROM Material m WHERE m.isActive = true AND " +
            "(LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(m.commercialReference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(m.skuCode) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Material> searchActive(@Param("query") String query, Pageable pageable);

    @Query("SELECT m FROM Material m WHERE m.isActive = true AND m.group.id = :groupId AND " +
            "(LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(m.commercialReference) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Material> searchActiveByGroup(@Param("groupId") UUID groupId, @Param("query") String query, Pageable pageable);

    @Query("SELECT m FROM Material m WHERE m.isActive = true AND m.group.id = :groupId " +
            "AND (:thickness IS NULL OR m.thicknessMm = :thickness) " +
            "AND (CAST(:color AS text) IS NULL OR LOWER(m.colorFinish) LIKE LOWER(CONCAT('%', CAST(:color AS text), '%')))")
    Page<Material> findActiveByGroupWithFilters(
            @Param("groupId") UUID groupId,
            @Param("thickness") BigDecimal thickness,
            @Param("color") String color,
            Pageable pageable
    );
}
