package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.entity.Hardware;
import br.edu.ifpb.alumigest.catalog.entity.UnitType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HardwareRepository extends JpaRepository<Hardware, Long> {

    boolean existsByCode(String code);

    Optional<Hardware> findByIdAndActiveTrue(Long id);

    @Query("SELECT h FROM Hardware h WHERE h.active = true " +
           "AND (:unit IS NULL OR h.unit = :unit) " +
           "AND (:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Hardware> findAllActiveFiltered(@Param("unit") UnitType unit,
                                         @Param("name") String name,
                                         Pageable pageable);
}
