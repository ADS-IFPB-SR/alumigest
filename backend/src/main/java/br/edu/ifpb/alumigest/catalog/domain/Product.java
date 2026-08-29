package br.edu.ifpb.alumigest.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tb_products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank(message = "O nome do produto é obrigatório")
    @Size(max = 150)
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @NotNull(message = "A categoria do produto é obrigatória")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @NotNull(message = "O custo de mão de obra não pode ser nulo")
    @PositiveOrZero(message = "O custo de mão de obra não pode ser negativo")
    @Column(name = "labor_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", length = 50)
    private DoorTemplateType templateType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_config", columnDefinition = "jsonb")
    private TemplateConfig templateConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "category_requirements", columnDefinition = "jsonb")
    private List<MaterialCategoryType> categoryRequirements = new ArrayList<>();

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public BigDecimal getLaborCost() {
        return laborCost;
    }

    public void setLaborCost(BigDecimal laborCost) {
        this.laborCost = laborCost;
    }

    public DoorTemplateType getTemplateType() {
        return templateType;
    }

    public void setTemplateType(DoorTemplateType templateType) {
        this.templateType = templateType;
    }

    public TemplateConfig getTemplateConfig() {
        return templateConfig;
    }

    public void setTemplateConfig(TemplateConfig templateConfig) {
        this.templateConfig = templateConfig;
    }

    public List<MaterialCategoryType> getCategoryRequirements() {
        return categoryRequirements;
    }

    public void setCategoryRequirements(List<MaterialCategoryType> categoryRequirements) {
        this.categoryRequirements = categoryRequirements != null ? categoryRequirements : new ArrayList<>();
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public List<ProductItem> getItems() {
        return items;
    }

    public void setItems(List<ProductItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    // Método auxiliar para adicionar itens na Ficha Técnica e manter os dois lados sincronizados
    public void addItem(ProductItem item) {
        this.items.add(item);
        item.setProduct(this);
    }
}