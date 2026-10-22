# [US-47.1] Criar endpoints agregados de leitura CQRS para o Painel 360° do Cliente (`GET /dashboard`, `GET /orders`, `GET /budgets`)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.1`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Issue no GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)
- **Release**: Release 2 (v2.0.0) — Gestão Comercial & Fábrica
- **Sub-área**: `Backend Core / REST`
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/customer/controller/CustomerHubController.java`
- **Labels Sugeridas**: `release-2`, `customer`, `backend`, `java`, `spring-boot`, `cqrs`, `rest`

---

## 🎯 Objetivo & Descrição

Criar os endpoints REST otimizados de leitura agregada para alimentar a Central 360° do Cliente no AlumiGest:
1. `GET /api/v1/customers/{id}/dashboard`: Indicadores consolidados do cliente (total contratado em R$, total de O.S., total de orçamentos e dados cadastrais para o Hero).
2. `GET /api/v1/customers/{id}/orders`: Histórico de ordens de serviço do cliente com status fabril (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`), data, valor total e itens físicos de esquadrias com medidas nominais em milímetros ($L \times A$ mm).
3. `GET /api/v1/customers/{id}/budgets`: Histórico de orçamentos e propostas vinculadas ao cliente com valor, data de emissão e status comercial.

Esta issue faz parte da entrega da **Release 2** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais de SOLID (Single Responsibility Principle) e separação de camadas, utilizando Records Java e Projeções DTO do Spring Data JPA para máxima performance e zero over-fetching.

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/backlog/US-47-painel-360-clientes/spec.md`)
- [ ] Criar os Records DTO imutáveis:
  - `CustomerDashboardDto`
  - `CustomerOrderSummaryDto` e `CustomerOrderItemDto`
  - `CustomerBudgetSummaryDto`
- [ ] Criar interface e implementação do serviço `CustomerHubService` com métodos anotados com `@Transactional(readOnly = true)`
- [ ] Criar o controlador REST `CustomerHubController` sob o path `/api/v1/customers/{id}` com documentação OpenAPI v3 (`@Operation`, `@ApiResponse`)
- [ ] Validar tratamento de erro retornando HTTP 404 (`CUSTOMER_NOT_FOUND`) caso o identificador do cliente não exista
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle do projeto

---

## ✅ Critérios de Aceitação

1. O endpoint `/api/v1/customers/{id}/dashboard` deve retornar status HTTP `200 OK` com payload contendo os KPIs consolidados calculados estritamente pelo backend.
2. O endpoint `/api/v1/customers/{id}/orders` deve listar todas as ordens de serviço do cliente com a contagem exata de peças e medidas nominais.
3. Se o cliente não existir, deve responder com HTTP `404 Not Found` no formato padronizado `ErrorResponse`.
4. Nenhuma lógica de negócio de cálculo de totais deve ser delegada ao frontend.
5. Deve compilar no backend com `mvn clean compile` sem warnings bloqueantes.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 🖥️ **Protótipo de Interface**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)
