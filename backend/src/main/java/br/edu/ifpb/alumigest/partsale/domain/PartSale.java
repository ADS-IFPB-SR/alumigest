package br.edu.ifpb.alumigest.partsale.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Entidade agregadora de uma Venda Avulsa de Partes (US-46).
 */
@Entity
@Table(name = "tb_part_sales")
public class PartSale {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(name = "code", nullable = false, unique = true, length = 30)
  private String code;

  @Column(name = "client_id", nullable = false)
  private UUID clientId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private PartSaleStatus status;

  @Column(name = "subtotal_amount", nullable = false, precision = 12, scale = 2)
  private BigDecimal subtotalAmount;

  @Column(name = "discount_amount", precision = 12, scale = 2)
  private BigDecimal discountAmount;

  @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
  private BigDecimal totalAmount;

  @OneToMany(mappedBy = "partSale", cascade = CascadeType.ALL, orphanRemoval = true)
  private final List<PartSaleItem> items = new ArrayList<>();

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected PartSale() {
    // Construtor padrão protegido para o Hibernate
  }

  /**
   * Construtor principal para inicialização de uma venda de partes.
   */
  public PartSale(
      String code,
      UUID clientId,
      PartSaleStatus status,
      BigDecimal discountAmount) {
    this.code = Objects.requireNonNull(code, "Código da venda é obrigatório");
    this.clientId = Objects.requireNonNull(clientId, "Cliente é obrigatório");
    this.status = status != null ? status : PartSaleStatus.DRAFT;
    this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
    this.subtotalAmount = BigDecimal.ZERO;
    this.totalAmount = BigDecimal.ZERO;
  }

  @PrePersist
  void prePersist() {
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  /**
   * Adiciona um item e recalcula os totais da venda.
   */
  public void addItem(PartSaleItem item) {
    Objects.requireNonNull(item, "Item não pode ser nulo");
    item.setPartSale(this);
    this.items.add(item);
    recalculateTotals();
  }

  /**
   * Remove um item e recalcula os totais.
   */
  public void removeItem(PartSaleItem item) {
    if (this.items.remove(item)) {
      item.setPartSale(null);
      recalculateTotals();
    }
  }

  /**
   * Recalcula subtotal e total aplicando o desconto.
   */
  public void recalculateTotals() {
    this.subtotalAmount = this.items.stream()
        .map(PartSaleItem::getTotalPrice)
        .reduce(BigDecimal.ZERO, BigDecimal::add)
        .setScale(2, RoundingMode.HALF_EVEN);

    BigDecimal discount = this.discountAmount != null ? this.discountAmount : BigDecimal.ZERO;
    this.totalAmount = this.subtotalAmount.subtract(discount).max(BigDecimal.ZERO)
        .setScale(2, RoundingMode.HALF_EVEN);
  }

  public void updateStatus(PartSaleStatus newStatus) {
    this.status = Objects.requireNonNull(newStatus, "Novo status é obrigatório");
  }

  public UUID getId() {
    return id;
  }

  public String getCode() {
    return code;
  }

  public UUID getClientId() {
    return clientId;
  }

  public PartSaleStatus getStatus() {
    return status;
  }

  public BigDecimal getSubtotalAmount() {
    return subtotalAmount;
  }

  public BigDecimal getDiscountAmount() {
    return discountAmount;
  }

  public void setDiscountAmount(BigDecimal discountAmount) {
    this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
    recalculateTotals();
  }

  public BigDecimal getTotalAmount() {
    return totalAmount;
  }

  public List<PartSaleItem> getItems() {
    return Collections.unmodifiableList(items);
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }
}
