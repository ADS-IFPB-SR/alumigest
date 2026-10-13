-- US-15.2: um orçamento pode gerar uma nova O.S. quando todas as anteriores
-- estiverem canceladas. Continua permitido no máximo um pedido ativo por orçamento.
ALTER TABLE tb_orders
    DROP CONSTRAINT IF EXISTS uk_orders_orcamento_id;

CREATE UNIQUE INDEX uk_orders_orcamento_ativo
    ON tb_orders (orcamento_id)
    WHERE status <> 'CANCELLED';
