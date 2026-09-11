package br.edu.ifpb.alumigest.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @NotNull(message = "O modelo de template da esquadria é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false, length = 50)
    private DoorTemplateType templateType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_config", columnDefinition = "jsonb")
    private TemplateConfig templateConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "category_requirements", columnDefinition = "jsonb")
    private List<MaterialCategoryType> categoryRequirements = new ArrayList<>();

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

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

    /**
     * Retorna a categoria canônica da esquadria derivada do template e do nome:
     * Portas, Janelas, Box ou Móveis / Painéis.
     */
    public String getCategoryName() {
        if (templateType == null) return "Geral";
        if (name != null && name.toLowerCase().contains("box")) {
            return "Box";
        }
        if (name != null && name.toLowerCase().contains("janela")) {
            return "Janelas";
        }
        return templateType.getGroupName();
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}