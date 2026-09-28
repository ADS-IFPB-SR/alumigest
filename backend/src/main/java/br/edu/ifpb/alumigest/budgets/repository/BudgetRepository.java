package br.edu.ifpb.alumigest.budgets.repository;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    Page<Budget> findByClientId(UUID clientId, Pageable pageable);
    Page<Budget> findByStatus(BudgetStatus status, Pageable pageable);
    Optional<Budget> findByCode(String code);
    boolean existsByCode(String code);

    Page<Budget> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Busca o último código gerado para um prefixo (ex: "ORC-2026-")
    Optional<Budget> findTopByCodeStartingWithOrderByCodeDesc(String prefix);

    @Query("""
        SELECT b FROM Budget b
        JOIN FETCH b.client c
        LEFT JOIN FETCH b.items i
        WHERE b.id = :id
    """)
    Optional<Budget> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
        SELECT b FROM Budget b
        LEFT JOIN b.client c
        WHERE (:status IS NULL OR b.status = :status)
          AND (CAST(:busca AS string) IS NULL OR :busca = ''
               OR LOWER(b.code) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%'))
               OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%')))
    """)
    Page<Budget> searchBudgets(
            @Param("busca") String busca,
            @Param("status") BudgetStatus status,
            Pageable pageable
    );
}