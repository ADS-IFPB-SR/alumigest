package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.entity.MaterialGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface MaterialGroupRepository extends JpaRepository<MaterialGroup, UUID> {
    Optional<MaterialGroup> findByCode(String code);
}