package br.edu.ifpb.alumigest.partsale.domain;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

/**
 * Entidade que representa um item individual dentro de uma venda avulsa de partes.
 */
@Entity
@Table(name = "tb_part_sale_items")
public class PartSaleItem {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "part_sale_id", nullable = false)
  private PartSale partSale;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "material_id", nullable = false)
  private Material material;

  @Enumerated(EnumType.STRING)
  @Column(name = "material_type", nullable = false, length = 30)
  private MaterialCategoryType materialType;

  @Column(name = "width_mm")
  private Integer widthMm;

  @Column(name = "height_mm")
  private Integer heightMm;

  @Column(name = "quantity", nullable = false)
  private Integer quantity;

  @Column(name = "calculated_unit_measure", nullable = false, precision = 10, scale = 4)
  private BigDecimal calculatedUnitMeasure;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice;

  @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal totalPrice;

  protected PartSaleItem() {
    // Construtor padrão protegido para o Hibernate
  }

  /**
   * Construtor completo do item da venda de partes.
   */
  public PartSaleItem(
      Material material,
      MaterialCategoryType materialType,
      Integer widthMm,
      Integer heightMm,
      Integer quantity,
      BigDecimal calculatedUnitMeasure,
      BigDecimal unitPrice,
      BigDecimal totalPrice) {
    if (quantity == null || quantity <= 0) {
      throw new IllegalArgumentException("A quantidade deve ser positiva.");
    }
    if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
      throw new IllegalArgumentException("Preço unitário não pode ser negativo.");
    }
    if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) < 0) {
      throw new IllegalArgumentException("Preço total não pode ser negativo.");
    }
    this.material = Objects.requireNonNull(material, "Material é obrigatório");
    this.materialType = Objects.requireNonNull(materialType, "Tipo de material é obrigatório");
    this.widthMm = widthMm;
    this.heightMm = heightMm;
    this.quantity = quantity;
    this.calculatedUnitMeasure = Objects.requireNonNull(
        calculatedUnitMeasure, "Medida calculada é obrigatória");
    this.unitPrice = unitPrice;
    this.totalPrice = totalPrice;
  }

  void setPartSale(PartSale partSale) {
    this.partSale = partSale;
  }

  public UUID getId() {
    return id;
  }

  public PartSale getPartSale() {
    return partSale;
  }

  public Material getMaterial() {
    return material;
  }

  public UUID getMaterialId() {
    return material != null ? material.getId() : null;
  }

  public String getDescription() {
    return material != null ? material.getName() : "";
  }

  public MaterialCategoryType getMaterialType() {
    return materialType;
  }

  public Integer getWidthMm() {
    return widthMm;
  }

  public Integer getHeightMm() {
    return heightMm;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public BigDecimal getCalculatedUnitMeasure() {
    return calculatedUnitMeasure;
  }

  public BigDecimal getUnitPrice() {
    return unitPrice;
  }

  public BigDecimal getTotalPrice() {
    return totalPrice;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PartSaleItem that = (PartSaleItem) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
