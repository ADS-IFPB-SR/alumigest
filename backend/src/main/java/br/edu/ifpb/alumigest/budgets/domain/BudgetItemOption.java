package br.edu.ifpb.alumigest.budgets.domain;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.budgets.domain.CategoryType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tb_budget_item_options")
public class BudgetItemOption {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_item_id", nullable = false)
    private BudgetItem budgetItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "material_name", nullable = false, length = 150)
    private String materialName;

    @Column(name = "unit_measure", nullable = false, length = 20)
    private String unitMeasure;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false, length = 50)
    private CategoryType categoryType;

    @Column(name = "selected_type", length = 100)
    private String selectedType;

    @Column(name = "selected_color", length = 50)
    private String selectedColor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    public String getMaterialName() {
        return materialName;
    }

    public UUID getId() {
        return id;
    }

    public BudgetItem getBudgetItem() {
        return budgetItem;
    }

    public Material getMaterial() {
        return material;
    }

    public String getUnitMeasure() {
        return unitMeasure;
    }

    public CategoryType getCategoryType() {
        return categoryType;
    }

    public String getSelectedType() {
        return selectedType;
    }

    public String getSelectedColor() {
        return selectedColor;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setCategoryType(CategoryType categoryType) {
        this.categoryType = categoryType;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setBudgetItem(BudgetItem budgetItem) {
        this.budgetItem = budgetItem;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public void setMaterialName(String materialName) {
        this.materialName = materialName;
    }

    public void setUnitMeasure(String unitMeasure) {
        this.unitMeasure = unitMeasure;
    }

    public void setSelectedType(String selectedType) {
        this.selectedType = selectedType;
    }

    public void setSelectedColor(String selectedColor) {
        this.selectedColor = selectedColor;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}