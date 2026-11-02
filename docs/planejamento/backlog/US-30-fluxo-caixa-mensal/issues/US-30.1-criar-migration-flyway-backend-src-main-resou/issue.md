# [US-30.1] Criar Migration Flyway `V23__create_cash_flows_schema.sql`

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.1`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Banco de Dados / Migrations (Flyway)
- **Alvo Principal**: `backend/src/main/resources/db/migration/V23__create_cash_flows_schema.sql`
- **Labels**: `database`, `flyway`, `finance`, `cash-flow`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Criar a modelagem relacional da tabela `tb_cash_flows` para registrar todas as entradas (geradas automaticamente a partir de Ordens de Serviço ou vendas avulsas) e saídas operacionais (despesas manuais lançadas pela oficina).

A modelagem deve implementar **blindagem contra duplicidade (idempotência)** e permitir vínculo tanto com Ordens de Serviço (`order_id`) quanto com Vendas Avulsas de Balcão (`part_sale_id`).

---

## 📐 Estrutura do DDL SQL

```sql
-- V23__create_cash_flows_schema.sql
-- Tabela unificada de fluxo de caixa para receitas e despesas operacionais

CREATE TABLE IF NOT EXISTS tb_cash_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_type VARCHAR(10) NOT NULL, -- 'INFLOW' ou 'OUTFLOW'
    category VARCHAR(30) NOT NULL,      -- 'ORDER_SALE', 'PART_SALE', 'MATERIAIS', 'OPERACIONAL', 'PESSOAL', 'RETIRADA', 'OUTROS'
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    flow_date DATE NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'PIX', 'DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA'
    order_id UUID REFERENCES tb_orders(id) ON DELETE SET NULL,
    part_sale_id UUID, -- Vinculo opcional com venda avulsa da US-46
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices para otimizacao de consultas analiticas mensais
CREATE INDEX IF NOT EXISTS idx_cash_flows_date_type ON tb_cash_flows(flow_date, movement_type);
CREATE INDEX IF NOT EXISTS idx_cash_flows_order_id ON tb_cash_flows(order_id);

-- Constraint de Idempotencia: Impede duplicar entrada ativa para a mesma Ordem de Servico
CREATE UNIQUE INDEX IF NOT EXISTS uk_cash_flows_active_order_inflow 
ON tb_cash_flows(order_id) 
WHERE movement_type = 'INFLOW' AND is_cancelled = FALSE;
```

---

## 🚦 Critérios de Aceitação
1. A migration executa sem falhas com `mvn test-compile` e aplica perfeitamente no PostgreSQL 16.
2. A restrição `CHECK (amount > 0)` impede o registro de movimentações com valores negativos ou zerados.
3. A constraint de unicidade parcial impede que a mesma O.S. gere duas entradas ativas no caixa.
4. Índices criados aceleram filtros por período (`flow_date`) e por pedido (`order_id`).
