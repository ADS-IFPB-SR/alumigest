package br.edu.ifpb.alumigest.budgets.repository;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    Page<Budget> findByClientId(UUID clientId, Pageable pageable);
    Page<Budget> findByStatus(BudgetStatus status, Pageable pageable);
    Optional<Budget> findByCode(String code);

    Page<Budget> findAllByOrderByCreatedAtDesc(Pageable pageable);

    //  busca o último código gerado para um prefixo (ex: "ORC-2026-")
    Optional<Budget> findTopByCodeStartingWithOrderByCodeDesc(String prefix);

    @org.springframework.data.jpa.repository.Query("""
        SELECT b FROM Budget b
        LEFT JOIN b.client c
        WHERE (:status IS NULL OR b.status = :status)
          AND (CAST(:busca AS string) IS NULL OR :busca = ''
               OR LOWER(b.code) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%'))
               OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%')))
    """)
    Page<Budget> searchBudgets(
            @org.springframework.data.repository.query.Param("busca") String busca,
            @org.springframework.data.repository.query.Param("status") BudgetStatus status,
            Pageable pageable
    );
}