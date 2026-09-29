package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class BudgetPricingService {

    private final MaterialRepository materialRepository;

    public BudgetPricingService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    /**
     * Calcula todos os preços e totais de um orçamento modificando a própria entidade.
     * Deve ser chamado antes do budgetRepository.save().
     */
    public void calculatePricing(Budget budget) {
        BigDecimal budgetSubtotal = BigDecimal.ZERO;

        for (BudgetItem item : budget.getItems()) {
            BigDecimal itemMaterialsSubtotal = BigDecimal.ZERO;

            for (BudgetItemOption option : item.getOptions()) {
                Material material = materialRepository.findById(option.getMaterial().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado: " + option.getMaterial().getId()));

                // Pega o preço de venda atualizado do catálogo
                BigDecimal salePrice = material.getSalePrice();
                option.setUnitPrice(salePrice);

                // totalPrice = salePrice * quantity
                BigDecimal totalPrice = salePrice.multiply(option.getQuantity()).setScale(2, RoundingMode.HALF_UP);
                option.setTotalPrice(totalPrice);

                // Acumula no subtotal dos materiais da esquadria
                itemMaterialsSubtotal = itemMaterialsSubtotal.add(totalPrice);
            }

            // Multiplica pelo número de esquadrias
            int itemQty = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;
            BigDecimal itemSubtotal = itemMaterialsSubtotal.multiply(BigDecimal.valueOf(itemQty));

            // A mão de obra (laborCost) já vem preenchida do frontend (graças a nossa correção no DTO)
            BigDecimal itemLaborCost = item.getLaborCost() != null ? item.getLaborCost() : BigDecimal.ZERO;
            itemSubtotal = itemSubtotal.add(itemLaborCost);

            item.setSubtotal(itemSubtotal);
            budgetSubtotal = budgetSubtotal.add(itemSubtotal);
        }

        budget.setSubtotal(budgetSubtotal);

        // Aplica o desconto percentual
        BigDecimal discountPercent = budget.getDiscountPercent() != null ? budget.getDiscountPercent() : BigDecimal.ZERO;
        if (discountPercent.compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("O desconto percentual não pode ser maior que 100%");
        }
        if (discountPercent.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("O desconto percentual não pode ser negativo");
        }

        // discountValue = subtotal * (discountPercent / 100)
        BigDecimal discountValue = budgetSubtotal.multiply(discountPercent)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        budget.setDiscountValue(discountValue);

        // total = subtotal - discountValue
        BigDecimal total = budgetSubtotal.subtract(discountValue);
        budget.setTotal(total);
    }
}
