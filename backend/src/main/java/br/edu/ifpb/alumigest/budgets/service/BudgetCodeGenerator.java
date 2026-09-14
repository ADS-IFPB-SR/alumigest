package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.time.ZoneOffset;

@Component
public class BudgetCodeGenerator {

    private final BudgetRepository budgetRepository;

    public BudgetCodeGenerator(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public String generateNextCode() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = String.format("ORC-%d-", currentYear);

        return budgetRepository.findTopByCodeStartingWithOrderByCodeDesc(prefix)
                .map(lastBudget -> {
                    String lastCode = lastBudget.getCode();
                    int lastNumber = Integer.parseInt(lastCode.substring(prefix.length()));
                    return String.format("%s%04d", prefix, lastNumber + 1);
                })
                .orElse(prefix + "0001");
    }
}