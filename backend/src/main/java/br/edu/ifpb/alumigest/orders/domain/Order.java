package br.edu.ifpb.alumigest.orders.domain;

import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Entidade central de Pedido de Venda com snapshot comercial e técnico imutável.
 * Implementa o padrão Rich Domain Model com encapsulamento de estado e transições de ciclo de vida.
 */
@Entity
@Table(name = "tb_orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "orcamento_id", nullable = false, unique = true)
    private UUID orcamentoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Client cliente;

    @Column(name = "cliente_nome", nullable = false, length = 200)
    private String clienteNome;

    @Column(name = "cliente_telefone", length = 20)
    private String clienteTelefone;

    @Column(name = "cliente_endereco", columnDefinition = "TEXT")
    private String clienteEndereco;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private OrderStatus status = OrderStatus.WAITING_PRODUCTION;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_aprovacao", nullable = false, length = 20)
    private ApprovalChannel canalAprovacao;

    @Column(name = "data_aprovacao", nullable = false)
    private LocalDate dataAprovacao = LocalDate.now(ZoneOffset.UTC);

    @Column(name = "data_previsao_entrega", nullable = false)
    private LocalDate dataPrevisaoEntrega;

    @Column(name = "data_conclusao")
    private LocalDate dataConclusao;

    @Column(name = "valor_bruto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorBruto = BigDecimal.ZERO;

    @Column(name = "valor_desconto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "taxa_instalacao", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxaInstalacao = BigDecimal.ZERO;

    @Column(name = "taxa_frete", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxaFrete = BigDecimal.ZERO;

    @Column(name = "valor_liquido", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorLiquido = BigDecimal.ZERO;

    @Column(name = "condicao_pagamento", length = 30)
    private String condicaoPagamento;

    @Column(name = "observacoes_pagamento", columnDefinition = "TEXT")
    private String observacoesPagamento;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "justificativa_cancelamento", columnDefinition = "TEXT")
    private String justificativaCancelamento;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(nullable = false)
    private Boolean ativo = true;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    protected Order() {
    }

    private Order(Builder builder) {
        this.id = builder.id;
        this.codigo = builder.codigo;
        this.orcamentoId = builder.orcamentoId;
        this.cliente = builder.cliente;
        this.clienteNome = builder.clienteNome;
        this.clienteTelefone = builder.clienteTelefone;
        this.clienteEndereco = builder.clienteEndereco;
        this.status = builder.status != null ? builder.status : OrderStatus.WAITING_PRODUCTION;
        this.canalAprovacao = builder.canalAprovacao;
        this.dataAprovacao = builder.dataAprovacao != null
                ? builder.dataAprovacao : LocalDate.now(ZoneOffset.UTC);
        this.dataPrevisaoEntrega = builder.dataPrevisaoEntrega;
        this.dataConclusao = builder.dataConclusao;
        this.valorBruto = builder.valorBruto != null ? builder.valorBruto : BigDecimal.ZERO;
        this.valorDesconto = builder.valorDesconto != null ? builder.valorDesconto : BigDecimal.ZERO;
        this.taxaInstalacao = builder.taxaInstalacao != null ? builder.taxaInstalacao : BigDecimal.ZERO;
        this.taxaFrete = builder.taxaFrete != null ? builder.taxaFrete : BigDecimal.ZERO;
        this.valorLiquido = builder.valorLiquido != null ? builder.valorLiquido : BigDecimal.ZERO;
        this.condicaoPagamento = builder.condicaoPagamento;
        this.observacoesPagamento = builder.observacoesPagamento;
        this.observacoes = builder.observacoes;
        this.justificativaCancelamento = builder.justificativaCancelamento;
        this.ativo = !Boolean.FALSE.equals(builder.ativo);
    }

    public static Builder builder() {
        return new Builder();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
        if (this.dataAprovacao == null) {
            this.dataAprovacao = LocalDate.now(ZoneOffset.UTC);
        }
        if (this.dataPrevisaoEntrega == null) {
            this.dataPrevisaoEntrega = this.dataAprovacao.plusDays(15);
        }
        if (this.status == null) {
            this.status = OrderStatus.WAITING_PRODUCTION;
        }
        if (this.ativo == null) {
            this.ativo = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    // =========================================================================
    // Métodos de Negócio e Transição de Ciclo de Vida (Rich Domain Model / SOLID)
    // =========================================================================

    /**
     * Cancela o pedido de venda com justificativa obrigatória.
     * Somente permitido nos status CREATED e WAITING_PRODUCTION.
     *
     * @param justificativa texto explicando o cancelamento (mínimo 10 caracteres)
     */
    public void cancelar(String justificativa) {
        if (!this.status.canCancel()) {
            throw new BusinessException("Não é possível cancelar um pedido no status " + this.status);
        }
        if (justificativa == null || justificativa.trim().length() < 10) {
            throw new IllegalArgumentException("A justificativa de cancelamento deve ter pelo menos 10 caracteres.");
        }
        this.status = OrderStatus.CANCELLED;
        this.justificativaCancelamento = justificativa.trim();
    }

    /**
     * Transita o pedido para o status de fabricação (IN_PRODUCTION).
     */
    public void iniciarProducao() {
        if (this.status != OrderStatus.WAITING_PRODUCTION) {
            throw new BusinessException("Apenas pedidos aguardando produção podem entrar em produção.");
        }
        this.status = OrderStatus.IN_PRODUCTION;
    }

    /**
     * Finaliza o pedido de venda registrando a data de conclusão.
     *
     * @param dataConclusao data de entrega ou conclusão dos serviços
     */
    public void concluir(LocalDate dataConclusao) {
        if (this.status != OrderStatus.IN_PRODUCTION) {
            throw new BusinessException("Apenas pedidos em produção podem ser concluídos.");
        }
        this.status = OrderStatus.COMPLETED;
        this.dataConclusao = dataConclusao != null ? dataConclusao : LocalDate.now(ZoneOffset.UTC);
    }

    /**
     * Adiciona um item ao pedido mantendo a consistência bidirecional.
     *
     * @param item item do pedido
     */
    public void addItem(OrderItem item) {
        if (item != null) {
            items.add(item);
            item.setOrder(this);
        }
    }

    /**
     * Remove um item do pedido mantendo a consistência bidirecional.
     *
     * @param item item a remover
     */
    public void removeItem(OrderItem item) {
        if (item != null) {
            items.remove(item);
            item.setOrder(null);
        }
    }

    public void atualizarPrevisaoEntrega(LocalDate novaData) {
        if (novaData == null) {
            throw new IllegalArgumentException("A data de previsão de entrega não pode ser nula.");
        }
        this.dataPrevisaoEntrega = novaData;
    }

    // =========================================================================
    // Getters e Acessores (Encapsulamento Estrito)
    // =========================================================================

    public UUID getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public UUID getOrcamentoId() {
        return orcamentoId;
    }

    public Client getCliente() {
        return cliente;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public String getClienteTelefone() {
        return clienteTelefone;
    }

    public String getClienteEndereco() {
        return clienteEndereco;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public ApprovalChannel getCanalAprovacao() {
        return canalAprovacao;
    }

    public LocalDate getDataAprovacao() {
        return dataAprovacao;
    }

    public LocalDate getDataPrevisaoEntrega() {
        return dataPrevisaoEntrega;
    }

    public LocalDate getDataConclusao() {
        return dataConclusao;
    }

    public BigDecimal getValorBruto() {
        return valorBruto;
    }

    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }

    public BigDecimal getTaxaInstalacao() {
        return taxaInstalacao;
    }

    public BigDecimal getTaxaFrete() {
        return taxaFrete;
    }

    public BigDecimal getValorLiquido() {
        return valorLiquido;
    }

    public String getCondicaoPagamento() {
        return condicaoPagamento;
    }

    public String getObservacoesPagamento() {
        return observacoesPagamento;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public String getJustificativaCancelamento() {
        return justificativaCancelamento;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    /**
     * Retorna a lista imutável dos itens para impedir mutação externa fora dos métodos do domínio.
     *
     * @return lista imutável de itens
     */
    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    /**
     * Desativa o pedido (soft delete).
     */
    public void desativar() {
        this.ativo = false;
    }

    /**
     * Reativa o pedido.
     */
    public void reativar() {
        this.ativo = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Order other)) {
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
        return "Order{"
                + "id=" + id
                + ", codigo='" + codigo + '\''
                + ", status=" + status
                + ", valorLiquido=" + valorLiquido
                + ", ativo=" + ativo
                + '}';
    }

    // =========================================================================
    // Builder Pattern (Design Patterns)
    // =========================================================================
    public static class Builder {
        private UUID id;
        private String codigo;
        private UUID orcamentoId;
        private Client cliente;
        private String clienteNome;
        private String clienteTelefone;
        private String clienteEndereco;
        private OrderStatus status = OrderStatus.WAITING_PRODUCTION;
        private ApprovalChannel canalAprovacao;
        private LocalDate dataAprovacao = LocalDate.now(ZoneOffset.UTC);
        private LocalDate dataPrevisaoEntrega;
        private LocalDate dataConclusao;
        private BigDecimal valorBruto = BigDecimal.ZERO;
        private BigDecimal valorDesconto = BigDecimal.ZERO;
        private BigDecimal taxaInstalacao = BigDecimal.ZERO;
        private BigDecimal taxaFrete = BigDecimal.ZERO;
        private BigDecimal valorLiquido = BigDecimal.ZERO;
        private String condicaoPagamento;
        private String observacoesPagamento;
        private String observacoes;
        private String justificativaCancelamento;
        private Boolean ativo = true;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder codigo(String codigo) {
            this.codigo = codigo;
            return this;
        }

        public Builder orcamentoId(UUID orcamentoId) {
            this.orcamentoId = orcamentoId;
            return this;
        }

        public Builder cliente(Client cliente) {
            this.cliente = cliente;
            return this;
        }

        public Builder clienteNome(String clienteNome) {
            this.clienteNome = clienteNome;
            return this;
        }

        public Builder clienteTelefone(String clienteTelefone) {
            this.clienteTelefone = clienteTelefone;
            return this;
        }

        public Builder clienteEndereco(String clienteEndereco) {
            this.clienteEndereco = clienteEndereco;
            return this;
        }

        public Builder status(OrderStatus status) {
            this.status = status;
            return this;
        }

        public Builder canalAprovacao(ApprovalChannel canalAprovacao) {
            this.canalAprovacao = canalAprovacao;
            return this;
        }

        public Builder dataAprovacao(LocalDate dataAprovacao) {
            this.dataAprovacao = dataAprovacao;
            return this;
        }

        public Builder dataPrevisaoEntrega(LocalDate dataPrevisaoEntrega) {
            this.dataPrevisaoEntrega = dataPrevisaoEntrega;
            return this;
        }

        public Builder dataConclusao(LocalDate dataConclusao) {
            this.dataConclusao = dataConclusao;
            return this;
        }

        public Builder valorBruto(BigDecimal valorBruto) {
            this.valorBruto = valorBruto;
            return this;
        }

        public Builder valorDesconto(BigDecimal valorDesconto) {
            this.valorDesconto = valorDesconto;
            return this;
        }

        public Builder taxaInstalacao(BigDecimal taxaInstalacao) {
            this.taxaInstalacao = taxaInstalacao;
            return this;
        }

        public Builder taxaFrete(BigDecimal taxaFrete) {
            this.taxaFrete = taxaFrete;
            return this;
        }

        public Builder valorLiquido(BigDecimal valorLiquido) {
            this.valorLiquido = valorLiquido;
            return this;
        }

        public Builder condicaoPagamento(String condicaoPagamento) {
            this.condicaoPagamento = condicaoPagamento;
            return this;
        }

        public Builder observacoesPagamento(String observacoesPagamento) {
            this.observacoesPagamento = observacoesPagamento;
            return this;
        }

        public Builder observacoes(String observacoes) {
            this.observacoes = observacoes;
            return this;
        }

        public Builder justificativaCancelamento(String justificativaCancelamento) {
            this.justificativaCancelamento = justificativaCancelamento;
            return this;
        }

        public Builder ativo(Boolean ativo) {
            this.ativo = ativo;
            return this;
        }

        public Order build() {
            return new Order(this);
        }
    }
}
