package br.edu.ifpb.alumigest.stock.domain;

import br.edu.ifpb.alumigest.catalog.domain.Material;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Registro imutável (append-only) da trilha de auditoria Kardex de estoque.
 */
@Entity
@Table(name = "tb_stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_item_id", nullable = false, updatable = false)
    private StockItem stockItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false, updatable = false)
    private Material material;

    @Column(name = "order_id", updatable = false)
    private UUID orderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40, updatable = false)
    private StockMovementType type;

    @Column(name = "quantity", nullable = false, precision = 14, scale = 4, updatable = false)
    private BigDecimal quantity;

    @Column(name = "unit_cost", precision = 12, scale = 2, updatable = false)
    private BigDecimal unitCost;

    @Column(name = "previous_physical_quantity", nullable = false, precision = 14, scale = 4, updatable = false)
    private BigDecimal previousPhysicalQuantity;

    @Column(name = "new_physical_quantity", nullable = false, precision = 14, scale = 4, updatable = false)
    private BigDecimal newPhysicalQuantity;

    @Column(name = "previous_reserved_quantity", nullable = false, precision = 14, scale = 4, updatable = false)
    private BigDecimal previousReservedQuantity;

    @Column(name = "new_reserved_quantity", nullable = false, precision = 14, scale = 4, updatable = false)
    private BigDecimal newReservedQuantity;

    @Column(name = "reference_document", length = 100, updatable = false)
    private String referenceDocument;

    @Column(name = "reason", columnDefinition = "TEXT", updatable = false)
    private String reason;

    @Column(name = "registered_by", length = 150, updatable = false)
    private String registeredBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected StockMovement() {
        // Construtor padrão exigido pelo JPA
    }

    private StockMovement(Builder builder) {
        this.stockItem = builder.stockItem;
        this.material = builder.material;
        this.orderId = builder.orderId;
        this.type = builder.type;
        this.quantity = builder.quantity;
        this.unitCost = builder.unitCost;
        this.previousPhysicalQuantity = builder.previousPhysicalQuantity;
        this.newPhysicalQuantity = builder.newPhysicalQuantity;
        this.previousReservedQuantity = builder.previousReservedQuantity;
        this.newReservedQuantity = builder.newReservedQuantity;
        this.referenceDocument = builder.referenceDocument;
        this.reason = builder.reason;
        this.registeredBy = builder.registeredBy;
    }

    public static Builder builder() {
        return new Builder();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
        }
    }

    public UUID getId() {
        return id;
    }

    public StockItem getStockItem() {
        return stockItem;
    }

    public Material getMaterial() {
        return material;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public StockMovementType getType() {
        return type;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public BigDecimal getPreviousPhysicalQuantity() {
        return previousPhysicalQuantity;
    }

    public BigDecimal getNewPhysicalQuantity() {
        return newPhysicalQuantity;
    }

    public BigDecimal getPreviousReservedQuantity() {
        return previousReservedQuantity;
    }

    public BigDecimal getNewReservedQuantity() {
        return newReservedQuantity;
    }

    public String getReferenceDocument() {
        return referenceDocument;
    }

    public String getReason() {
        return reason;
    }

    public String getRegisteredBy() {
        return registeredBy;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StockMovement other)) {
            return false;
        }
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    /**
     * Builder imutável para criação de registros Kardex.
     */
    public static final class Builder {
        private StockItem stockItem;
        private Material material;
        private UUID orderId;
        private StockMovementType type;
        private BigDecimal quantity;
        private BigDecimal unitCost;
        private BigDecimal previousPhysicalQuantity;
        private BigDecimal newPhysicalQuantity;
        private BigDecimal previousReservedQuantity;
        private BigDecimal newReservedQuantity;
        private String referenceDocument;
        private String reason;
        private String registeredBy;

        public Builder stockItem(StockItem stockItem) {
            this.stockItem = stockItem;
            return this;
        }

        public Builder material(Material material) {
            this.material = material;
            return this;
        }

        public Builder orderId(UUID orderId) {
            this.orderId = orderId;
            return this;
        }

        public Builder type(StockMovementType type) {
            this.type = type;
            return this;
        }

        public Builder quantity(BigDecimal quantity) {
            this.quantity = quantity;
            return this;
        }

        public Builder unitCost(BigDecimal unitCost) {
            this.unitCost = unitCost;
            return this;
        }

        public Builder previousPhysicalQuantity(BigDecimal previousPhysicalQuantity) {
            this.previousPhysicalQuantity = previousPhysicalQuantity;
            return this;
        }

        public Builder newPhysicalQuantity(BigDecimal newPhysicalQuantity) {
            this.newPhysicalQuantity = newPhysicalQuantity;
            return this;
        }

        public Builder previousReservedQuantity(BigDecimal previousReservedQuantity) {
            this.previousReservedQuantity = previousReservedQuantity;
            return this;
        }

        public Builder newReservedQuantity(BigDecimal newReservedQuantity) {
            this.newReservedQuantity = newReservedQuantity;
            return this;
        }

        public Builder referenceDocument(String referenceDocument) {
            this.referenceDocument = referenceDocument;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public Builder registeredBy(String registeredBy) {
            this.registeredBy = registeredBy;
            return this;
        }

        public StockMovement build() {
            return new StockMovement(this);
        }
    }
}

