package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface MaterialRepository extends JpaRepository<Material, UUID> {

    @Query("SELECT m FROM Material m WHERE m.materialGroup.code = :groupCode AND m.isActive = true")
    Page<Material> findAllActiveByGroupCode(@Param("groupCode") String groupCode, Pageable pageable);

    Optional<Material> findByIdAndMaterialGroupCode(UUID id, String groupCode);
}