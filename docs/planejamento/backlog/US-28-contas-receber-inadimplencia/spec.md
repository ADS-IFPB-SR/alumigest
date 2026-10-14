# Especificação Funcional: US-28 — Controlar Contas a Receber, Vencimentos e Inadimplência

**Identificador**: `US-28`  
**Issue GitHub**: [#153](https://github.com/ADS-IFPB-SR/alumigest/issues/153)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como gestor financeiro ou operador de caixa da Alumiportas, desejo monitorar e gerenciar a carteira de contas a receber com filtros por cliente, período de vencimento e status, apurando taxas de inadimplência e identificando prontamente parcelas em atraso para executar ações de cobrança e manter o fluxo de caixa saudável.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta Paginada de Títulos com Filtros Combinados**
  - **Dado que** o gestor acessa a página `ReceivablesPage` (`/financeiro/contas-a-receber`),
  - **Quando** aplica filtros por `clientId = 12`, `status = OVERDUE` e intervalo de vencimento (`dueDate` entre `2026-10-01` e `2026-10-31`),
  - **Então** o sistema retorna uma listagem paginada de parcelas correspondentes via `Page<AccountReceivableResponse>`,
  - **E** exibe colunas com Código da O.S., Nome do Cliente, Parcela (ex: "2/3"), Vencimento, Valor Nominal, Valor Pago e Badge de Status.

- [ ] **Cenário 2: Atualização Dinâmica e Automática de Títulos Vencidos (Inadimplência)**
  - **Dado que** uma parcela possui `status = PENDING` e data de vencimento `dueDate < LocalDate.now()`,
  - **Quando** o sistema carrega os dados ou executa a rotina de conferência diária,
  - **Então** o status do título é atualizado para `OVERDUE`,
  - **E** o badge na interface é exibido em vermelho com os dias de atraso calculados (ex: "Atrasado há 5 dias").

- [ ] **Cenário 3: Registro de Baixa / Liquidação Manual de Parcela**
  - **Dado que** o cliente realiza o pagamento via transferência bancária ou dinheiro em balcão,
  - **Quando** o operador clica em "Registrar Recebimento", informa a data de pagamento (`paymentDate = 2026-10-14`), método (`paymentMethod = CASH`) e valor integral,
  - **Então** o sistema altera o status da parcela para `PAID`, preenche `paidAmount` e vincula o recibo,
  - **E** atualiza em tempo real o saldo restante da Ordem de Serviço.

- [ ] **Cenário 4: Baixa Parcial e Saldo Remanescente**
  - **Dado que** uma parcela possui valor nominal de `R$ 500,00`,
  - **Quando** o cliente paga `R$ 300,00`,
  - **Então** o sistema define o status como `PARTIALLY_PAID`,
  - **E** registra `paidAmount = 300.00` e calcula `remainingBalance = 200.00`, mantendo a parcela em cobrança para o saldo restante.

- [ ] **Cenário 5: Cards de Indicadores Consolidados (KPIs Financeiros)**
  - **Dado que** existem títulos registrados no sistema,
  - **Quando** o operador abre a tela de contas a receber,
  - **Então** o topo da página exibe 4 cards de síntese:
    1. **Total a Vencer no Mês**: soma de parcelas `PENDING` com vencimento até o fim do mês corrente.
    2. **Total Vencido / Em Atraso**: soma de todas as parcelas `OVERDUE` ativas (Inadimplência acumulada).
    3. **Total Recebido no Mês**: soma de valores efetivamente liquidados no mês.
    4. **Índice de Inadimplência**: percentual calculado $\frac{\text{Total Vencido}}{\text{Total a Receber}} \times 100$.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Transição de Status Temporal):** Toda parcela com saldo pendente e `dueDate < LocalDate.now()` é estritamente classificada como `OVERDUE`.
- **RN-02 (Precisão Financeira):** Todos os cálculos de somatório e apuração de saldos devem ser feitos em `BigDecimal` no backend para prevenir discrepâncias de ponto flutuante.
- **RN-03 (Imutabilidade de Título Quitado):** Uma parcela com status `PAID` não pode sofrer nova baixa a menos que seja estornada por um usuário com perfil `ADMIN`.
- **RN-04 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e serviços usam termos em inglês: `amount`, `paidAmount`, `remainingBalance`, `dueDate`, `paymentDate`, `overdueDays`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/finance/receivables` (consulta paginada com Specification dinâmica: `clientId`, `status`, `startDate`, `endDate`, `search`)
  - `POST /api/v1/finance/receivables/{id}/pay` (registro de baixa de pagamento)
  - `GET /api/v1/finance/receivables/summary` (indicadores consolidados para cards do dashboard)

### Frontend (React 19 / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `ReceivablesPage.tsx` (`/financeiro/contas-a-receber`)
  - `ReceivablesSummaryCards.tsx` (cards de topo com indicadores)
  - `ReceivablesTable.tsx` (grid com paginação, ordenação e badges de status)
  - `ReceivePaymentDialog.tsx` (modal de baixa de parcela)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário em `AccountReceivableServiceTest` validando cálculo de inadimplência e atualização dinâmica para `OVERDUE`.
- [ ] Teste de integração do endpoint `GET /api/v1/finance/receivables` com múltiplos filtros e paginação Spring Data.
- [ ] Teste de componente com React Testing Library validando exibição de cards de métricas e modal de baixa.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (5 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-28.1](issues/US-28.1-implementar-metodo-listar-pageable-status-cli/issue.md) | Implementar método `listar(Pageable, status, clientId, startDate, endDate, search)` no `AccountReceivableService` com atualização dinâmica de status `OVERDUE` | 🔲 No Backlog |
| [US-28.2](issues/US-28.2-criar-endpoint-get-api-finance-receivables-no/issue.md) | Criar endpoint GET `/api/v1/finance/receivables` no `AccountReceivableController` | 🔲 No Backlog |
| [US-28.3](issues/US-28.3-criar-interfaces-typescript-e-servico-axios-r/issue.md) | Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts` | 🔲 No Backlog |
| [US-28.4](issues/US-28.4-criar-componente-receivablestable-com-badges-/issue.md) | Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx` | 🔲 No Backlog |
| [US-28.5](issues/US-28.5-criar-pagina-receivablespage-e-registrar-rota/issue.md) | Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-28-contas-receber-inadimplencia`
