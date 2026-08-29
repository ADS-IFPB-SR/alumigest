package br.edu.ifpb.alumigest.budgets.domain;

import br.edu.ifpb.alumigest.catalog.domain.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tb_budget_items")
public class BudgetItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "template_type", length = 50)
    private String templateType;

    @Column(name = "template_config", columnDefinition = "jsonb")
    private String templateConfig;

    @Column(name = "handle_config", columnDefinition = "jsonb")
    private String handleConfig;

    @Column(name = "drilling_config", columnDefinition = "jsonb")
    private String drillingConfig;

    @Column(name = "width_mm", nullable = false, precision = 8, scale = 2)
    private BigDecimal widthMm;

    @Column(name = "height_mm", nullable = false, precision = 8, scale = 2)
    private BigDecimal heightMm;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "labor_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "budgetItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BudgetItemOption> options = new ArrayList<>();

    public void addOption(BudgetItemOption option) {
        options.add(option);
        option.setBudgetItem(this);
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Budget getBudget() {
        return budget;
    }

    public void setBudget(Budget budget) {
        this.budget = budget;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getTemplateConfig() {
        return templateConfig;
    }

    public void setTemplateConfig(String templateConfig) {
        this.templateConfig = templateConfig;
    }

    public String getHandleConfig() {
        return handleConfig;
    }

    public void setHandleConfig(String handleConfig) {
        this.handleConfig = handleConfig;
    }

    public String getDrillingConfig() {
        return drillingConfig;
    }

    public void setDrillingConfig(String drillingConfig) {
        this.drillingConfig = drillingConfig;
    }

    public BigDecimal getWidthMm() {
        return widthMm;
    }

    public void setWidthMm(BigDecimal widthMm) {
        this.widthMm = widthMm;
    }

    public BigDecimal getHeightMm() {
        return heightMm;
    }

    public void setHeightMm(BigDecimal heightMm) {
        this.heightMm = heightMm;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getLaborCost() {
        return laborCost;
    }

    public void setLaborCost(BigDecimal laborCost) {
        this.laborCost = laborCost;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<BudgetItemOption> getOptions() {
        return options;
    }

    public void setOptions(List<BudgetItemOption> options) {
        this.options = options;
    }
}