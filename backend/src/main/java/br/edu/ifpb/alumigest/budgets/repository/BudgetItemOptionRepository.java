package br.edu.ifpb.alumigest.budgets.repository;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BudgetItemOptionRepository extends JpaRepository<BudgetItemOption, UUID> {
}