package br.edu.ifpb.alumigest.stock.domain;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.UUID;

/**
 * Entidade de domínio que representa o saldo consolidado de um insumo no almoxarifado.
 *
 * <p>Mantém a invariante fundamental {@code availableQuantity = physicalQuantity - reservedQuantity}
 * (RN-01) e suporta saldo disponível negativo no modelo Make-to-Order (RN-05).
 */
@Entity
@Table(name = "tb_stock_items")
public class StockItem {

    private static final int QUANTITY_SCALE = 4;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false, unique = true)
    private Material material;

    @Column(name = "physical_quantity", nullable = false, precision = 14, scale = QUANTITY_SCALE)
    private BigDecimal physicalQuantity = zeroScaled();

    @Column(name = "reserved_quantity", nullable = false, precision = 14, scale = QUANTITY_SCALE)
    private BigDecimal reservedQuantity = zeroScaled();

    @Column(name = "available_quantity", nullable = false, precision = 14, scale = QUANTITY_SCALE)
    private BigDecimal availableQuantity = zeroScaled();

    @Column(name = "minimum_stock", nullable = false, precision = 14, scale = QUANTITY_SCALE)
    private BigDecimal minimumStock = zeroScaled();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected StockItem() {
        // Construtor padrão exigido pelo JPA
    }

    /**
     * Cria um item de estoque zerado para o material informado.
     *
     * @param material material vinculado do catálogo
     */
    public StockItem(Material material) {
        this.material = Objects.requireNonNull(material, "O material é obrigatório para o item de estoque.");
        this.physicalQuantity = zeroScaled();
        this.reservedQuantity = zeroScaled();
        this.availableQuantity = zeroScaled();
        this.minimumStock = zeroScaled();
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        recalculateAvailable();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
        recalculateAvailable();
    }

    /**
     * Aloca reserva de material para produção (RN-05 Make-to-Order: não bloqueante).
     *
     * @param quantity quantidade positiva a reservar
     */
    public void reserve(BigDecimal quantity) {
        BigDecimal normalized = requirePositiveQuantity(quantity, "A quantidade a reservar deve ser maior que zero.");
        this.reservedQuantity = this.reservedQuantity.add(normalized);
        recalculateAvailable();
    }

    /**
     * Converte reserva em baixa física definitiva na conclusão da produção (COMPLETED).
     * Decrementa simultaneamente {@code physicalQuantity} e {@code reservedQuantity},
     * preservando o saldo disponível inalterado ({@code Δphysical - Δreserved = 0}).
     *
     * @param quantity quantidade reservada a baixar fisicamente
     * @return quantidade efetivamente baixada
     */
    public BigDecimal consumeReserved(BigDecimal quantity) {
        BigDecimal normalized = requirePositiveQuantity(quantity, "A quantidade de baixa deve ser maior que zero.");
        BigDecimal effectiveQty = normalized.min(this.reservedQuantity);
        if (effectiveQty.compareTo(BigDecimal.ZERO) <= 0) {
            return zeroScaled();
        }
        this.physicalQuantity = this.physicalQuantity.subtract(effectiveQty);
        this.reservedQuantity = this.reservedQuantity.subtract(effectiveQty);
        recalculateAvailable();
        return effectiveQty;
    }

    /**
     * Estorna a reserva vinculada a uma O.S. cancelada, recompondo o saldo disponível.
     *
     * @param quantity quantidade reservada a estornar
     * @return quantidade efetivamente estornada
     */
    public BigDecimal cancelReservation(BigDecimal quantity) {
        BigDecimal normalized = requirePositiveQuantity(quantity, "A quantidade a estornar deve ser maior que zero.");
        BigDecimal effectiveQty = normalized.min(this.reservedQuantity);
        if (effectiveQty.compareTo(BigDecimal.ZERO) <= 0) {
            return zeroScaled();
        }
        this.reservedQuantity = this.reservedQuantity.subtract(effectiveQty);
        recalculateAvailable();
        return effectiveQty;
    }

    /**
     * Adiciona entrada física no almoxarifado (compras ou ajuste positivo).
     *
     * @param quantity quantidade positiva a adicionar
     */
    public void addPhysical(BigDecimal quantity) {
        BigDecimal normalized = requirePositiveQuantity(quantity, "A quantidade de entrada deve ser maior que zero.");
        this.physicalQuantity = this.physicalQuantity.add(normalized);
        recalculateAvailable();
    }

    /**
     * Registra saída física extraordinária manual (perdas/sucata ou ajuste negativo),
     * impedindo saldo físico negativo conforme RN-03.
     *
     * @param quantity quantidade positiva a subtrair
     */
    public void removePhysical(BigDecimal quantity) {
        BigDecimal normalized = requirePositiveQuantity(quantity, "A quantidade de saída deve ser maior que zero.");
        BigDecimal nextPhysical = this.physicalQuantity.subtract(normalized);
        if (nextPhysical.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(
                "Saldo físico insuficiente para o material '" + resolveMaterialName()
                    + "'. Disponível fisicamente: " + this.physicalQuantity.stripTrailingZeros().toPlainString()
            );
        }
        this.physicalQuantity = nextPhysical;
        recalculateAvailable();
    }

    /**
     * Define o estoque mínimo de segurança (ponto de pedido).
     *
     * @param minimumStock valor mínimo não negativo
     */
    public void updateMinimumStock(BigDecimal minimumStock) {
        if (minimumStock == null || minimumStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("O estoque mínimo não pode ser negativo.");
        }
        this.minimumStock = scale(minimumStock);
    }

    /**
     * Calcula o status de alerta de suprimento com base no saldo disponível atual.
     *
     * @return status de alerta correspondente
     */
    public StockAlertStatus resolveAlertStatus() {
        if (this.availableQuantity.compareTo(BigDecimal.ZERO) < 0) {
            return StockAlertStatus.NEED_PURCHASE;
        }
        if (this.minimumStock.compareTo(BigDecimal.ZERO) > 0
                && this.availableQuantity.compareTo(this.minimumStock) <= 0) {
            return StockAlertStatus.ORDER_POINT;
        }
        return StockAlertStatus.IN_STOCK;
    }

    private void recalculateAvailable() {
        this.physicalQuantity = scale(this.physicalQuantity);
        this.reservedQuantity = scale(this.reservedQuantity);
        this.minimumStock = scale(this.minimumStock);
        this.availableQuantity = this.physicalQuantity.subtract(this.reservedQuantity).setScale(QUANTITY_SCALE, RoundingMode.HALF_UP);
    }

    private String resolveMaterialName() {
        return this.material != null && this.material.getName() != null
            ? this.material.getName()
            : "Desconhecido";
    }

    private static BigDecimal requirePositiveQuantity(BigDecimal quantity, String errorMessage) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(errorMessage);
        }
        return scale(quantity);
    }

    private static BigDecimal scale(BigDecimal value) {
        return (value != null ? value : BigDecimal.ZERO).setScale(QUANTITY_SCALE, RoundingMode.HALF_UP);
    }

    private static BigDecimal zeroScaled() {
        return BigDecimal.ZERO.setScale(QUANTITY_SCALE, RoundingMode.HALF_UP);
    }

    public UUID getId() {
        return id;
    }

    public Material getMaterial() {
        return material;
    }

    public BigDecimal getPhysicalQuantity() {
        return physicalQuantity;
    }

    public BigDecimal getReservedQuantity() {
        return reservedQuantity;
    }

    public BigDecimal getAvailableQuantity() {
        return availableQuantity;
    }

    public BigDecimal getMinimumStock() {
        return minimumStock;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StockItem other)) {
            return false;
        }
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

