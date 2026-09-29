package br.edu.ifpb.alumigest.orders.domain;

import br.edu.ifpb.alumigest.catalog.domain.Product;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Item do Pedido de Venda representando o snapshot técnico e comercial imutável (Lock de Preços).
 * Implementa o padrão Rich Domain Model e Builder Pattern.
 */
@Entity
@Table(name = "tb_order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false, length = 300)
    private String descricao;

    @Column(name = "largura_mm", nullable = false)
    private Integer larguraMm;

    @Column(name = "altura_mm", nullable = false)
    private Integer alturaMm;

    @Column(nullable = false)
    private Integer quantidade = 1;

    @Column(name = "cor_aluminio", length = 50)
    private String corAluminio;

    @Column(name = "tipo_vidro", length = 100)
    private String tipoVidro;

    @Column(name = "orientacao_abertura", length = 30)
    private String orientacaoAbertura;

    @Column(columnDefinition = "TEXT")
    private String ferragens;

    @Column(name = "valor_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorUnitario = BigDecimal.ZERO;

    @Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_config", columnDefinition = "jsonb")
    private String templateConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "handle_config", columnDefinition = "jsonb")
    private String handleConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "drilling_config", columnDefinition = "jsonb")
    private String drillingConfig;

    @Column(nullable = false)
    private Integer ordem = 0;

    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemOption> options = new ArrayList<>();

    protected OrderItem() {
    }

    private OrderItem(Builder builder) {
        this.id = builder.id;
        this.order = builder.order;
        this.product = builder.product;
        this.descricao = builder.descricao;
        this.larguraMm = builder.larguraMm;
        this.alturaMm = builder.alturaMm;
        this.quantidade = builder.quantidade != null ? builder.quantidade : 1;
        this.corAluminio = builder.corAluminio;
        this.tipoVidro = builder.tipoVidro;
        this.orientacaoAbertura = builder.orientacaoAbertura;
        this.ferragens = builder.ferragens;
        this.valorUnitario = builder.valorUnitario != null ? builder.valorUnitario : BigDecimal.ZERO;
        this.valorTotal = builder.valorTotal != null ? builder.valorTotal : BigDecimal.ZERO;
        this.templateConfig = builder.templateConfig;
        this.handleConfig = builder.handleConfig;
        this.drillingConfig = builder.drillingConfig;
        this.ordem = builder.ordem != null ? builder.ordem : 0;
    }

    public static Builder builder() {
        return new Builder();
    }

    public void addOption(OrderItemOption option) {
        if (option != null) {
            options.add(option);
            option.setOrderItem(this);
        }
    }

    public void removeOption(OrderItemOption option) {
        if (option != null) {
            options.remove(option);
            option.setOrderItem(null);
        }
    }

    public UUID getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public String getDescricao() {
        return descricao;
    }

    public Integer getLarguraMm() {
        return larguraMm;
    }

    public Integer getAlturaMm() {
        return alturaMm;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public String getCorAluminio() {
        return corAluminio;
    }

    public String getTipoVidro() {
        return tipoVidro;
    }

    public String getOrientacaoAbertura() {
        return orientacaoAbertura;
    }

    public String getFerragens() {
        return ferragens;
    }

    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public String getTemplateConfig() {
        return templateConfig;
    }

    public String getHandleConfig() {
        return handleConfig;
    }

    public String getDrillingConfig() {
        return drillingConfig;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public List<OrderItemOption> getOptions() {
        return Collections.unmodifiableList(options);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderItem other)) {
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
        return "OrderItem{"
                + "id=" + id
                + ", descricao='" + descricao + '\''
                + ", quantidade=" + quantidade
                + ", valorTotal=" + valorTotal
                + '}';
    }

    // =========================================================================
    // Builder Pattern (Design Patterns)
    // =========================================================================
    public static class Builder {
        private UUID id;
        private Order order;
        private Product product;
        private String descricao;
        private Integer larguraMm;
        private Integer alturaMm;
        private Integer quantidade = 1;
        private String corAluminio;
        private String tipoVidro;
        private String orientacaoAbertura;
        private String ferragens;
        private BigDecimal valorUnitario = BigDecimal.ZERO;
        private BigDecimal valorTotal = BigDecimal.ZERO;
        private String templateConfig;
        private String handleConfig;
        private String drillingConfig;
        private Integer ordem = 0;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder order(Order order) {
            this.order = order;
            return this;
        }

        public Builder product(Product product) {
            this.product = product;
            return this;
        }

        public Builder descricao(String descricao) {
            this.descricao = descricao;
            return this;
        }

        public Builder larguraMm(Integer larguraMm) {
            this.larguraMm = larguraMm;
            return this;
        }

        public Builder alturaMm(Integer alturaMm) {
            this.alturaMm = alturaMm;
            return this;
        }

        public Builder quantidade(Integer quantidade) {
            this.quantidade = quantidade;
            return this;
        }

        public Builder corAluminio(String corAluminio) {
            this.corAluminio = corAluminio;
            return this;
        }

        public Builder tipoVidro(String tipoVidro) {
            this.tipoVidro = tipoVidro;
            return this;
        }

        public Builder orientacaoAbertura(String orientacaoAbertura) {
            this.orientacaoAbertura = orientacaoAbertura;
            return this;
        }

        public Builder ferragens(String ferragens) {
            this.ferragens = ferragens;
            return this;
        }

        public Builder valorUnitario(BigDecimal valorUnitario) {
            this.valorUnitario = valorUnitario;
            return this;
        }

        public Builder valorTotal(BigDecimal valorTotal) {
            this.valorTotal = valorTotal;
            return this;
        }

        public Builder templateConfig(String templateConfig) {
            this.templateConfig = templateConfig;
            return this;
        }

        public Builder handleConfig(String handleConfig) {
            this.handleConfig = handleConfig;
            return this;
        }

        public Builder drillingConfig(String drillingConfig) {
            this.drillingConfig = drillingConfig;
            return this;
        }

        public Builder ordem(Integer ordem) {
            this.ordem = ordem;
            return this;
        }

        public OrderItem build() {
            return new OrderItem(this);
        }
    }
}
