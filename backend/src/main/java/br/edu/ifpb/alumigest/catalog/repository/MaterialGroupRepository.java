package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialGroupRepository extends JpaRepository<MaterialGroup, UUID> {


    Optional<MaterialGroup> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<MaterialGroup> findByIsActiveTrueOrderByNameAsc();
    List<MaterialGroup> findByIsSystemDefaultTrue();

    Optional<MaterialGroup> findByCode(String code);
}