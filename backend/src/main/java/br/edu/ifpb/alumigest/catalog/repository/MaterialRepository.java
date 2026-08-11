package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    Page<Material> findAllActiveByGroupCode(String groupCode, Pageable pageable);
    Optional<Material> findByIdAndGroupCode(UUID id, String groupCode);

    /**
     * Lista materiais ativos de um grupo com filtros opcionais por unidade de medida e nome.
     * Usado pelo {@code HardwareService.findAll()} para filtrar ferragens dentro do grupo FERRAGEM.
     *
     * @param groupId     UUID do MaterialGroup
     * @param unitMeasure filtro por unidade de medida; {@code null} desativa o filtro
     * @param name        fragmento de nome para busca case-insensitive; {@code null} desativa o filtro
     * @param pageable    configuração de paginação
     */
    @Query("SELECT m FROM Material m " +
           "WHERE m.isActive = true " +
           "AND m.group.id = :groupId " +
           "AND (CAST(:unitMeasure AS string) IS NULL OR m.unitMeasure = :unitMeasure) " +
           "AND (CAST(:name AS string) IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))")
    Page<Material> findAllActiveByGroupFiltered(
            @Param("groupId") UUID groupId,
            @Param("unitMeasure") UnitMeasure unitMeasure,
            @Param("name") String name,
            Pageable pageable);
}