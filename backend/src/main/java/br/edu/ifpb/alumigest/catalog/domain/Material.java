package br.edu.ifpb.alumigest.catalog.domain;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
/**
 * Entidade universal que representa insumos e matérias-primas no catálogo.
 * Suporta vidros (2mm, 4mm, comuns, temperados), perfis de alumínio (linhas Rometal/Alternativa em 3m/6m),
 * películas e ferragens, além de extensões como chapas de MDF via attributesJson.
 */
@Entity
@Table(name = "tb_materials")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotNull(message = "Grupo do material é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private MaterialGroup group;

    @Size(max = 50, message = "Código SKU deve ter no máximo 50 caracteres")
    @Column(name = "sku_code", length = 50)
    private String skuCode;

    @Size(max = 100, message = "Referência comercial deve ter no máximo 100 caracteres")
    @Column(name = "commercial_reference", length = 100)
    private String commercialReference;

    @Size(max = 10, message = "Código NCM deve ter no máximo 10 caracteres")
    @Column(name = "ncm_code", length = 10)
    private String ncmCode;

    @NotBlank(message = "Nome do material é obrigatório")
    @Size(max = 150, message = "Nome do material deve ter no máximo 150 caracteres")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @NotNull(message = "Preço de custo é obrigatório")
    @PositiveOrZero(message = "Preço de custo deve ser maior ou igual a zero")
    @Column(name = "cost_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @NotNull(message = "Preço de venda é obrigatório")
    @PositiveOrZero(message = "Preço de venda deve ser maior ou igual a zero")
    @Column(name = "sale_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal salePrice = BigDecimal.ZERO;

    @NotNull(message = "Unidade de medida é obrigatória")
    @Enumerated(EnumType.STRING)
    @Column(name = "unit_measure", nullable = false, length = 20)
    private UnitMeasure unitMeasure = UnitMeasure.UN;

    @PositiveOrZero(message = "Espessura deve ser maior ou igual a zero")
    @Column(name = "thickness_mm", precision = 6, scale = 2)
    private BigDecimal thicknessMm;

    @Size(max = 50, message = "Cor/Acabamento deve ter no máximo 50 caracteres")
    @Column(name = "color_finish", length = 50)
    private String colorFinish;

    @PositiveOrZero(message = "Comprimento padrão deve ser maior ou igual a zero")
    @Column(name = "standard_length_m", precision = 6, scale = 2)
    private BigDecimal standardLengthM;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes_json", columnDefinition = "jsonb")
    private String attributesJson;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Material() {
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public MaterialGroup getGroup() {
        return group;
    }

    public void setGroup(MaterialGroup group) {
        this.group = group;
    }

    public String getSkuCode() {
        return skuCode;
    }

    public void setSkuCode(String skuCode) {
        this.skuCode = skuCode;
    }

    public String getCommercialReference() {
        return commercialReference;
    }

    public void setCommercialReference(String commercialReference) {
        this.commercialReference = commercialReference;
    }

    public String getNcmCode() {
        return ncmCode;
    }

    public void setNcmCode(String ncmCode) {
        this.ncmCode = ncmCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }

    public UnitMeasure getUnitMeasure() {
        return unitMeasure;
    }

    public void setUnitMeasure(UnitMeasure unitMeasure) {
        this.unitMeasure = unitMeasure;
    }

    public BigDecimal getThicknessMm() {
        return thicknessMm;
    }

    public void setThicknessMm(BigDecimal thicknessMm) {
        this.thicknessMm = thicknessMm;
    }

    public String getColorFinish() {
        return colorFinish;
    }

    public void setColorFinish(String colorFinish) {
        this.colorFinish = colorFinish;
    }

    public BigDecimal getStandardLengthM() {
        return standardLengthM;
    }

    public void setStandardLengthM(BigDecimal standardLengthM) {
        this.standardLengthM = standardLengthM;
    }

    public String getAttributesJson() {
        return attributesJson;
    }

    public void setAttributesJson(String attributesJson) {
        this.attributesJson = attributesJson;
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

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Material material = (Material) o;
        return Objects.equals(id, material.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
