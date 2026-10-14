# Especificação Funcional: US-30 — Acompanhar Fluxo de Caixa Mensal

**Identificador**: `US-30`  
**Issue GitHub**: [#155](https://github.com/ADS-IFPB-SR/alumigest/issues/155)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como diretor ou gestor financeiro da Alumiportas, desejo acompanhar o fluxo de caixa mensal consolidando entradas operacionais realizadas (PIX, dinheiro, cartões e títulos quitados), previsões de recebimento futuro e projeções de saldo diário/mensal, garantindo previsibilidade de liquidez para aquisições de matéria-prima e planejamento orçamentário.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta do Resumo Consolidado do Mês (Regime de Caixa)**
  - **Dado que** o gestor acessa a página `CashFlowPage` (`/financeiro/fluxo-de-caixa`),
  - **Quando** o sistema carrega o mês corrente (ex: Outubro/2026),
  - **Então** exibe os indicadores agregados:
    - `totalRealizedInflows` (Total de Entradas Efetivamente Liquidadas)
    - `totalProjectedInflows` (Total de Entradas Previstas para o Período)
    - `netBalance` (Saldo Líquido Operacional)
  - **E** exibe a evolução diária em gráfico de barras/linha interativo (`CashFlowProjectionChart`).

- [ ] **Cenário 2: Projeção de Entradas com Base nas Parcelas a Vencer**
  - **Dado que** existem parcelas cadastradas no módulo de contas a receber com vencimentos futuros no mês selecionado,
  - **Quando** o backend apura as projeções via `CashFlowService`,
  - **Então** agrega todas as parcelas `PENDING` agrupadas por dia de vencimento (`dueDate`),
  - **E** plota no gráfico uma linha tracejada diferenciando "Realizado" de "Projetado".

- [ ] **Cenário 3: Discriminação por Método de Pagamento**
  - **Dado que** as entradas operacionais foram recebidas por diferentes meios,
  - **Quando** o usuário visualiza a seção "Entradas por Canal de Pagamento",
  - **Então** o sistema apresenta a distribuição percentual e em Reais por `PaymentMethod` (PIX, Cartão de Crédito, Boleto, Dinheiro em Espécie).

- [ ] **Cenário 4: Navegação entre Meses Anteriores e Comparativo Histórico**
  - **Dado que** o gestor deseja avaliar a evolução da serralheria no último trimestre,
  - **Quando** altera o seletor de mês/ano para os períodos anteriores,
  - **Então** os dados são recalculados instantaneamente via React Query,
  - **E** exibe percentual de variação em relação ao mês anterior (ex: "+12.4% em relação a Setembro").

- [ ] **Cenário 5: Detalhamento Analítico das Movimentações do Período**
  - **Dado que** o gestor clica em um dia específico do calendário ou gráfico,
  - **Quando** abre o modal/gaveta de detalhamento analítico,
  - **Então** lista cada lançamento individual com data/hora, O.S. de origem, cliente, valor e canal de recebimento.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Segregação de Regimes Contábeis):** A visão de "Realizado" considera estritamente a data de liquidação (`paymentDate`). A visão de "Projetado" considera as datas pactuadas de vencimento (`dueDate`).
- **RN-02 (Precisão Matemática):** Cálculos de fluxo de caixa e totalizações devem utilizar `BigDecimal` com arredondamento `HALF_UP`.
- **RN-03 (Diretriz de Idioma em Variáveis):** Estruturas técnicas e de domínio em inglês: `CashFlow`, `cash_flows`, `movementType` (`INFLOW`, `OUTFLOW`), `totalRealizedInflows`, `totalProjectedInflows`, `netBalance`, `flowDate`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Tabela:** `cash_flows` (migration `V14__create_cash_flows_schema.sql`)
  - Colunas: `id`, `movement_type`, `amount`, `payment_method`, `flow_date`, `order_id`, `receivable_id`, `description`, `created_at`.
- **Endpoints:**
  - `GET /api/v1/finance/cash-flow/summary?year=2026&month=10` (resumo mensal agregado)
  - `GET /api/v1/finance/cash-flow/daily-projection?startDate=...&endDate=...` (dados diários para gráfico)

### Frontend (React 19 / Chart.js ou Recharts / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `CashFlowPage.tsx` (`/financeiro/fluxo-de-caixa`)
  - `CashFlowSummaryCards.tsx` (cards de métricas de topo)
  - `CashFlowProjectionChart.tsx` (gráfico comparativo realizado vs projetado)
  - `CashFlowChannelDistribution.tsx` (gráfico de rosca por canal)

---

## 🛡️ Definition of Done (DoD)

- [ ] Testes unitários do `CashFlowServiceTest` cobrindo agregação de entradas, distinção entre realizado e projetado e cálculo de saldo líquido.
- [ ] Teste de integração do endpoint `/summary` com transações reais gravadas no banco de testes.
- [ ] Validação visual do gráfico com dados simulados e estados de carregamento suave.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (10 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-30.1](issues/US-30.1-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows` | 🔲 No Backlog |
| [US-30.2](issues/US-30.2-criar-entidade-jpa-cashflow-em-backend-src-ma/issue.md) | Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java` | 🔲 No Backlog |
| [US-30.3](issues/US-30.3-criar-repositorio-cashflowrepository-com-quer/issue.md) | Criar repositório `CashFlowRepository` com queries de agregação por período | 🔲 No Backlog |
| [US-30.4](issues/US-30.4-criar-record-monthlycashflowresponse-em-back/issue.md) | Criar record `CashFlowSummaryResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/CashFlowSummaryResponse.java` | 🔲 No Backlog |
| [US-30.5](issues/US-30.5-implementar-servico-cashflowservice-obterresu/issue.md) | Implementar serviço `CashFlowService.obterResumoFluxoCaixa(LocalDate inicio, LocalDate fim)` agregando entradas e previsões | 🔲 No Backlog |
| [US-30.6](issues/US-30.6-criar-endpoint-get-api-finance-cash-flow-month/issue.md) | Criar endpoint GET `/api/v1/finance/cash-flow/summary` no `CashFlowController` | 🔲 No Backlog |
| [US-30.7](issues/US-30.7-criar-componente-monthlycashflowcards-e-grafi/issue.md) | Criar componente `CashFlowSummaryCards` e `CashFlowProjectionChart` no frontend | 🔲 No Backlog |
| [US-30.8](issues/US-30.8-criar-pagina-monthlycashflowpage-e-registrar-ro/issue.md) | Criar página `CashFlowPage` e registrar rota `/financeiro/fluxo-de-caixa` no React Router | 🔲 No Backlog |
| [US-30.9](issues/US-30.9-criar-testes-unitarios-do-cashflowservicetest/issue.md) | Criar testes unitários do `CashFlowServiceTest` | 🔲 No Backlog |
| [US-30.10](issues/US-30.10-documentacao-openapi-e-atalho-de-menu/issue.md) | Documentação OpenAPI e atalho de menu no frontend | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-30-fluxo-caixa-mensal`
