package br.edu.ifpb.alumigest.orders.domain;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Snapshot imutável de insumo/opção associado a um item do pedido de venda.
 * Implementa o padrão Rich Domain Model e Builder Pattern.
 */
@Entity
@Table(name = "tb_order_item_options")
public class OrderItemOption {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "material_name", nullable = false, length = 150)
    private String materialName;

    @Column(name = "unit_measure", nullable = false, length = 20)
    private String unitMeasure;

    @Column(name = "category_type", nullable = false, length = 50)
    private String categoryType;

    @Column(name = "selected_type", length = 100)
    private String selectedType;

    @Column(name = "selected_color", length = 50)
    private String selectedColor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    protected OrderItemOption() {
    }

    private OrderItemOption(Builder builder) {
        this.id = builder.id;
        this.orderItem = builder.orderItem;
        this.material = builder.material;
        this.materialName = builder.materialName;
        this.unitMeasure = builder.unitMeasure;
        this.categoryType = builder.categoryType;
        this.selectedType = builder.selectedType;
        this.selectedColor = builder.selectedColor;
        this.quantity = builder.quantity != null ? builder.quantity : BigDecimal.ZERO;
        this.unitPrice = builder.unitPrice != null ? builder.unitPrice : BigDecimal.ZERO;
        this.totalPrice = builder.totalPrice != null ? builder.totalPrice : BigDecimal.ZERO;
    }

    public static Builder builder() {
        return new Builder();
    }

    public UUID getId() {
        return id;
    }

    public OrderItem getOrderItem() {
        return orderItem;
    }

    void setOrderItem(OrderItem orderItem) {
        this.orderItem = orderItem;
    }

    public Material getMaterial() {
        return material;
    }

    public String getMaterialName() {
        return materialName;
    }

    public String getUnitMeasure() {
        return unitMeasure;
    }

    public String getCategoryType() {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderItemOption other)) {
            return false;
        }
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "OrderItemOption{"
                + "id=" + id
                + ", materialName='" + materialName + '\''
                + ", quantity=" + quantity
                + ", totalPrice=" + totalPrice
                + '}';
    }

    // =========================================================================
    // Builder Pattern (Design Patterns)
    // =========================================================================
    public static class Builder {
        private UUID id;
        private OrderItem orderItem;
        private Material material;
        private String materialName;
        private String unitMeasure;
        private String categoryType;
        private String selectedType;
        private String selectedColor;
        private BigDecimal quantity = BigDecimal.ZERO;
        private BigDecimal unitPrice = BigDecimal.ZERO;
        private BigDecimal totalPrice = BigDecimal.ZERO;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder orderItem(OrderItem orderItem) {
            this.orderItem = orderItem;
            return this;
        }

        public Builder material(Material material) {
            this.material = material;
            return this;
        }

        public Builder materialName(String materialName) {
            this.materialName = materialName;
            return this;
        }

        public Builder unitMeasure(String unitMeasure) {
            this.unitMeasure = unitMeasure;
            return this;
        }

        public Builder categoryType(String categoryType) {
            this.categoryType = categoryType;
            return this;
        }

        public Builder selectedType(String selectedType) {
            this.selectedType = selectedType;
            return this;
        }

        public Builder selectedColor(String selectedColor) {
            this.selectedColor = selectedColor;
            return this;
        }

        public Builder quantity(BigDecimal quantity) {
            this.quantity = quantity;
            return this;
        }

        public Builder unitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
            return this;
        }

        public Builder totalPrice(BigDecimal totalPrice) {
            this.totalPrice = totalPrice;
            return this;
        }

        public OrderItemOption build() {
            return new OrderItemOption(this);
        }
    }
}
