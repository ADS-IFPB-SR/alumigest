# Especificação Funcional: US-27 — Desdobrar e Gerenciar Parcelamento de Pedidos

**Identificador**: `US-27`  
**Issue GitHub**: [#152](https://github.com/ADS-IFPB-SR/alumigest/issues/152)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como vendedor ou operador financeiro da Alumiportas, desejo desdobrar o valor total negociado de uma Ordem de Serviço em um plano de parcelas com prazos de vencimento, formas de pagamento acordadas e controle individual de liquidação, garantindo que o somatório das parcelas coincida perfeitamente com o total da O.S. sem perdas por arredondamento e permitindo flexibilidade na negociação com o cliente.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Geração Automática de Parcelamento com Divisão Exata**
  - **Dado que** uma Ordem de Serviço possui valor total `totalAmount = R$ 1.500,00`,
  - **Quando** o operador solicita a geração de 3 parcelas mensais (`installmentCount = 3`) sem valor de entrada (`downPayment = 0.00`),
  - **Então** o sistema calcula e gera 3 parcelas (`AccountReceivable`) de `R$ 500,00` cada,
  - **E** define as datas de vencimento (`dueDate`) a cada 30 dias contados a partir da data de faturamento,
  - **E** todas as parcelas iniciam com status `PENDING`.

- [ ] **Cenário 2: Tratamento de Dízima/Resto de Arredondamento com Rateio na Primeira Parcela**
  - **Dado que** uma Ordem de Serviço possui valor total `totalAmount = R$ 1.000,00`,
  - **Quando** o operador gera 3 parcelas (`installmentCount = 3`),
  - **Então** a divisão $1000 / 3 = 333,333...$ é tratada com precisão `BigDecimal`,
  - **E** a 1ª parcela recebe o resto da divisão (`R$ 333,34`),
  - **E** a 2ª e a 3ª parcelas recebem `R$ 333,33` cada,
  - **E** a soma aritmética das 3 parcelas totaliza rigorosamente `R$ 1.000,00`.

- [ ] **Cenário 3: Parcelamento com Entrada (Down Payment) e Saldo Restante**
  - **Dado que** uma O.S. possui total `R$ 3.000,00` e o cliente paga uma entrada de `R$ 1.000,00` via PIX na aprovação,
  - **Quando** o operador configura 2 parcelas para o saldo remanescente (`remainingAmount = R$ 2.000,00`),
  - **Então** o sistema registra a parcela de entrada como `PAID` com `paymentMethod = PIX`,
  - **E** gera as 2 parcelas subsequentes de `R$ 1.000,00` com status `PENDING` para as datas futuras estipuladas.

- [ ] **Cenário 4: Customização Manual de Vencimentos e Valores de Parcelas**
  - **Dado que** o cliente solicita datas específicas de pagamento (ex: dias 10 e 25),
  - **Quando** o operador ajusta manualmente os valores ou as datas de vencimento no grid de parcelamento,
  - **Então** o sistema valida se a soma de todas as parcelas informadas é exatamente igual ao `totalAmount` da O.S.,
  - **E** se houver divergência, bloqueia a confirmação exibindo alerta em vermelho com a diferença faltante ou excedente.

- [ ] **Cenário 5: Cancelamento ou Repactuação do Plano de Parcelas**
  - **Dado que** nenhuma das parcelas futuras foi liquidada,
  - **Quando** o vendedor solicita a repactuação do plano de pagamento do pedido,
  - **Então** o sistema cancela logicamente as parcelas pendentes anteriores (`status = CANCELLED`),
  - **E** gera o novo conjunto de parcelas acordado, registrando log na auditoria da O.S.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Invariante de Fechamento Contábil):** A soma de `amount` de todas as parcelas ativas de um pedido deve ser estritamente igual a `order.totalAmount`. Validação obrigatória com tolerância zero no backend usando `BigDecimal.compareTo() == 0`.
- **RN-02 (Algoritmo de Rateio):** Utilizar `InstallmentCalculator` com `RoundingMode.HALF_UP` a 2 casas decimais, alocando a diferença de centavos na primeira parcela.
- **RN-03 (Enums e Idioma Técnico no Modelo):**
  - `ReceivableStatus`: `PENDING`, `OVERDUE`, `PARTIALLY_PAID`, `PAID`, `CANCELLED`
  - `PaymentMethod`: `PIX`, `CREDIT_CARD`, `DEBIT_CARD`, `BOLETO`, `CASH`, `BANK_TRANSFER`
  - `InstallmentType`: `DOWN_PAYMENT`, `STANDARD_INSTALLMENT`

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Tabela:** `account_receivables` (migration `V13__create_account_receivables_schema.sql`)
  - Colunas: `id`, `order_id`, `client_id`, `installment_number`, `total_installments`, `amount`, `paid_amount`, `due_date`, `payment_date`, `status`, `payment_method`, `notes`, `created_at`, `updated_at`.
- **Endpoints:**
  - `POST /api/v1/finance/receivables/order/{orderId}/generate` (gera plano padrão ou customizado)
  - `GET /api/v1/finance/receivables/order/{orderId}` (lista parcelas da O.S.)
  - `PUT /api/v1/finance/receivables/order/{orderId}/renegotiate` (repactua parcelas em aberto)

### Frontend (React 19 / TanStack Query / Tailwind)
- **Componentes:**
  - `InstallmentPlanForm.tsx` (configurador de parcelas com cálculo automático e validação de soma)
  - `InstallmentScheduleTable.tsx` (tabela de parcelas com badges de status e ações)
- **Serviço:** `receivablesApi.ts`

---

## 🛡️ Definition of Done (DoD)

- [ ] Testes unitários do `InstallmentCalculatorTest` cobrindo divisão exata, dízima periódica (ex: 3x de 100,00) e tolerância zero.
- [ ] Testes de integração do `AccountReceivableServiceTest` validando transacionalidade e rollback em caso de inconsistência de soma.
- [ ] Validação no frontend impedindo submissão quando a soma das parcelas diferir do total do pedido.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (11 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-27.1](issues/US-27.1-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables` | 🔲 No Backlog |
| [US-27.2](issues/US-27.2-criar-enums-receivablestatus-a-vencer-vencido/issue.md) | Criar enums `ReceivableStatus` (PENDING, OVERDUE, PARTIALLY_PAID, PAID, CANCELLED) e `InstallmentType` | 🔲 No Backlog |
| [US-27.3](issues/US-27.3-criar-entidade-jpa-accountreceivable-em-backe/issue.md) | Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java` | 🔲 No Backlog |
| [US-27.4](issues/US-27.4-criar-repositorio-accountreceivablerepository/issue.md) | Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java` | 🔲 No Backlog |
| [US-27.5](issues/US-27.5-criar-servico-utilitario-installmentcalculato/issue.md) | Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela | 🔲 No Backlog |
| [US-27.6](issues/US-27.6-criar-record-accountreceivableresponse-em-bac/issue.md) | Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java` | 🔲 No Backlog |
| [US-27.7](issues/US-27.7-criar-record-installmentplancustomrequest-em-/issue.md) | Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java` | 🔲 No Backlog |
| [US-27.8](issues/US-27.8-criar-mapper-mapstruct-accountreceivablemappe/issue.md) | Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java` | 🔲 No Backlog |
| [US-27.9](issues/US-27.9-implementar-servico-accountreceivableservice-/issue.md) | Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` | 🔲 No Backlog |
| [US-27.10](issues/US-27.10-criar-endpoint-post-api-finance-receivables-o/issue.md) | Criar endpoint POST `/api/v1/finance/receivables/order/{orderId}/generate` no `AccountReceivableController` | 🔲 No Backlog |
| [US-27.11](issues/US-27.11-criar-testes-unitarios-do-installmentcalculat/issue.md) | Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-27-parcelamento-pedidos`
