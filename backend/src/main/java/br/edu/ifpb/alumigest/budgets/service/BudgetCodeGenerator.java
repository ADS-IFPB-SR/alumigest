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

        int nextNumber = budgetRepository.findTopByCodeStartingWithOrderByCodeDesc(prefix)
                .map(lastBudget -> {
                    String lastCode = lastBudget.getCode();
                    try {
                        int lastNumber = Integer.parseInt(lastCode.substring(prefix.length()));
                        return lastNumber + 1;
                    } catch (NumberFormatException e) {
                        return 1;
                    }
                })
                .orElse(1);

        String candidateCode = String.format("%s%04d", prefix, nextNumber);
        while (budgetRepository.existsByCode(candidateCode)) {
            nextNumber++;
            candidateCode = String.format("%s%04d", prefix, nextNumber);
        }

        return candidateCode;
    }
}