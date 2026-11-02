# Especificação Funcional: US-30 — Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)

**Identificador**: `US-30`  
**Issue GitHub**: [#155](https://github.com/ADS-IFPB-SR/alumigest/issues/155)  
**Status**: 📅 Planejada para a Sprint 09 (Fechamento Funcional)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como gestor da Alumiportas, desejo que cada **Ordem de Serviço (O.S.) / Pedido de Venda aprovado seja automaticamente contabilizado como entrada financeira** no caixa e que eu possa **lançar rapidamente as despesas operacionais** da oficina (fornecedores de alumínio e vidro, energia, combustível, manutenção), para acompanhar o **saldo líquido real do mês** em um painel consolidado e intuitivo, **eliminando a necessidade de redigitar dados em planilhas do Excel**.

---

## 🚦 Critérios de Aceitação (Dado que / Quando / Então)

### Cenário 1: Contabilização Automática de Entradas a partir da O.S. (Zero Retrabalho)
- **Dado que** um orçamento é aprovado e convertido formalmente em Pedido de Venda / O.S. (`US-13`),
- **Quando** a transação de conversão for concluída com sucesso pelo backend (`OrderService`),
- **Então** o sistema gera automaticamente uma movimentação de entrada (`movementType = INFLOW`) na tabela `tb_cash_flows`,
- **E** preenche automaticamente: `amount` (valor total líquido da O.S.), `flowDate` (data da aprovação), `orderId` (UUID do pedido), `description` ("O.S. PED-YYYY-NNNN - [Nome do Cliente]") e `paymentMethod` (canal informado na aprovação).

### Cenário 2: Lançamento Simplificado de Despesas Operacionais (Saídas)
- **Dado que** a oficina realiza um pagamento operacional (ex: compra de perfis de alumínio, chapa de vidro com têmpera parceira, conta de luz ou combustível),
- **Quando** o operador clica no botão `+ Nova Despesa` na página financeira e preenche:
  - Descrição (ex: "Compra Perfis Linha Suprema - Fornecedor X")
  - Categoria (`MATERIAIS`, `OPERACIONAL`, `PESSOAL`, `RETIRADA`, `OUTROS`)
  - Data do Pagamento (`flowDate`)
  - Valor em R$ (`amount`)
  - Forma de Pagamento (`PIX`, `BOLETO`, `CARTAO`, `DINHEIRO`)
- **Então** o backend persiste a movimentação de saída (`movementType = OUTFLOW`) associada à categoria,
- **E** atualiza instantaneamente o saldo do mês em tela.

### Cenário 3: Painel Consolidado de Fluxo de Caixa Mensal (Substituto do Excel)
- **Dado que** o gestor acessa `/financeiro/fluxo-de-caixa`,
- **Quando** o painel for renderizado para o mês selecionado (padrão: mês corrente),
- **Então** o backend entrega e o frontend exibe os 3 cartões principais de métricas:
  - 🟢 **Total de Entradas:** Soma de todas as O.S. e receitas do mês selecionado.
  - 🔴 **Total de Despesas:** Soma de todas as saídas e gastos operacionais lançados no mês.
  - 🔵 **Saldo Líquido do Mês:** Diferença matemática estrita ($\text{Entradas} - \text{Despesas}$).

### Cenário 4: Extrato Cronológico de Movimentações com Filtro por Mês/Ano
- **Dado que** o gestor deseja auditar as movimentações de um determinado período,
- **Quando** seleciona o mês e ano no seletor de período,
- **Então** a tabela lista todas as movimentações em ordem cronológica decrescente,
- **E** exibe badges visuais claras (Verde para `Entrada` com link direto para a O.S. correspondente; Vermelho para `Despesa` com sua categoria),
- **E** permite busca textual instantânea por cliente, número de O.S. ou descrição da despesa.

### Cenário 5: Tratamento de Cancelamento de Pedido de Venda
- **Dado que** uma Ordem de Serviço previamente contabilizada é cancelada formalmente (`OrderStatus = CANCELLED` na US-15),
- **Quando** o cancelamento for processado no backend,
- **Então** a entrada correspondente na `tb_cash_flows` é marcada como estornada/cancelada ou um lançamento de estorno é computado,
- **E** o saldo do mês é recalculado de forma atômica e transparente.

---

## 📐 Regras de Negócio e Princípios SOLID

- **RN-01 (Lógica de Negócio Estrita no Backend - Arquitetura Limpa):** Todos os cálculos de agregação de entradas, saídas e saldo líquido do mês devem ser processados no backend via queries indexadas ou serviço Spring (`CashFlowService`). O frontend jamais deve calcular totais financeiros em memória a partir de arrays brutos.
- **RN-02 (Precisão Monetária):** Todos os valores monetários utilizam `BigDecimal` no Java e `NUMERIC(15,2)` no PostgreSQL, com arredondamento `HALF_UP`.
- **RN-03 (Desacoplamento e Single Responsibility):** O módulo `finance` atua como um Bounded Context independente. A integração com `orders` ocorre de forma desacoplada (via Event Listener Spring ou chamada transacional em Service), garantindo que alterações no módulo fabril não quebrem o financeiro.
- **RN-04 (Zero Redigitação):** É terminantemente proibido exigir input manual para vendas que já possuem Ordem de Serviço cadastrada no sistema.

---

## 🛠️ Especificação Técnica Resumida

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Tabela:** `tb_cash_flows` (Flyway Migration `V23__create_cash_flows_schema.sql`):
  ```sql
  CREATE TABLE tb_cash_flows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      movement_type VARCHAR(10) NOT NULL, -- INFLOW ou OUTFLOW
      category VARCHAR(30) NOT NULL,      -- ORDER_SALE, MATERIAIS, OPERACIONAL, etc.
      description VARCHAR(255) NOT NULL,
      amount NUMERIC(15,2) NOT NULL,
      flow_date DATE NOT NULL,
      payment_method VARCHAR(20) NOT NULL,
      order_id UUID REFERENCES tb_orders(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **Endpoints REST:**
  - `GET /api/v1/finance/cash-flow/summary?year=2026&month=11`: Retorna totais (`totalInflows`, `totalOutflows`, `netBalance`).
  - `GET /api/v1/finance/cash-flow/movements?year=2026&month=11`: Lista paginada das movimentações do mês.
  - `POST /api/v1/finance/expenses`: Cadastra uma nova despesa operacional manual.
  - `DELETE /api/v1/finance/expenses/{id}`: Remove ou estorna uma despesa lançada erroneamente.

### Frontend (React 19 / TanStack Query / Tailwind)
- **Componentes:**
  - `CashFlowPage.tsx` (`/financeiro/fluxo-de-caixa`): Página central de controle.
  - `CashFlowSummaryCards.tsx`: 3 cartões de destaque (Receitas, Despesas e Saldo Líquido).
  - `ExpenseModal.tsx`: Modal rápido para registrar despesas da oficina.
  - `CashFlowTable.tsx`: Tabela cronológica limpa com cores indicativas e filtros.

---

## 🏁 Definition of Done (DoD)

- [ ] Teste unitário de `CashFlowServiceTest` validando cálculo de saldo mensal e criação de entrada automática ao aprovar O.S.
- [ ] Testes de integração `MockMvc` cobrindo o endpoint de sumário financeiro e criação de despesa.
- [ ] Interface reativa validada no Vitest com atualização instantânea de saldo ao adicionar despesa.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.
