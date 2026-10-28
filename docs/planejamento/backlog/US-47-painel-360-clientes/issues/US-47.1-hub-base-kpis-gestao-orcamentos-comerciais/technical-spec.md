# Especificação Técnica de Apoio: US-47.1 — Hub 360° Base, KPIs e Gestão de Orçamentos

Este documento detalha os aspectos de arquitetura, classes e contratos técnicos para a implementação da fatia vertical **US-47.1**.

---

## ☕ 1. Backend Core & Endpoints REST

- **Pacote:** `br.edu.ifpb.alumigest.clients`
- **Controller:** `ClientHubController.java`
  - `@RequestMapping({"/api/v1/clients/{id}", "/api/v1/customers/{id}"})`
  - `@Tag(name = "Central 360 do Cliente")`
  - **Endpoints:**
    - `GET /dashboard`: Retorna indicadores agregados do cliente.
    - `GET /budgets`: Retorna lista paginada de orçamentos vinculados via `BudgetRepository.findByClientId`.
- **DTOs (Java Records imutáveis):**
  - `ClientDashboardDto`:
    ```java
    public record ClientDashboardDto(
        UUID clientId,
        String name,
        String document,
        String phone,
        String email,
        String city,
        PersonType personType,
        BigDecimal totalContractedAmount,
        long totalOrdersCount,
        long totalBudgetsCount
    ) {}
    ```
  - `ClientBudgetSummaryDto`:
    ```java
    public record ClientBudgetSummaryDto(
        UUID id,
        String code,
        LocalDate createdAt,
        LocalDate validUntil,
        BigDecimal total,
        BudgetStatus status
    ) {}
    ```
- **Service:** `ClientHubService.java`
  - Agrega contagens e totais financeiros com `@Transactional(readOnly = true)`.
  - Tratamento de exceção: `ResourceNotFoundException("Cliente não encontrado com ID: " + clientId)` mapeado para HTTP 404.

---

## ⚛️ 2. Frontend UI & Shell Mestre-Detalhe

- **Diretório:** `frontend/src/features/customers/`
- **Componentes:**
  - `CustomerHubPage.tsx`: Shell estrutural principal.
    - Gerencia `selectedCustomerId: string | null`.
    - Renderiza `CustomerMasterSidebar.tsx` à esquerda (320px com busca instantânea).
    - Renderiza `CustomerHeroCard.tsx` no topo da área de trabalho (identificação, dados de contato e 3 cards de KPI).
    - Container de abas dinâmicas renderizando `CustomerBudgetsTab.tsx`.
  - `CustomerMasterSidebar.tsx`: Lista de clientes com filtro dinâmico por nome, CPF/CNPJ ou telefone, com estado `active`.
  - `CustomerHeroCard.tsx`: Destaque com CTAs ("WhatsApp", "➕ Novo Orçamento" apontando para o wizard) e cards de Total Contratado, O.S. e Orçamentos.
  - `CustomerBudgetsTab.tsx`: Tabela com colunas `Código`, `Data`, `Validade`, `Total`, `Status` e ações rápidas (disparo de WhatsApp e download do PDF comercial).
- **Hook de Dados:** `useCustomerHub.ts`
  - Integração TanStack Query com chave `['clients', customerId, 'hub']` e cancelamento de requisições com `AbortSignal`.

---

## 🧪 3. Estratégia de Testes (QA)

- `ClientHubControllerTest.java` (MockMvc):
  - Teste do endpoint `/dashboard` com cliente existente retornando HTTP 200 OK e JSON estruturado.
  - Teste com cliente inexistente retornando HTTP 404.
  - Teste do endpoint `/budgets` validando paginação e serialização de status.
- `CustomerHubPage.test.tsx` (Vitest):
  - Renderização do shell mestre-detalhe.
  - Simulação de clique na barra lateral e atualização dos KPIs do cliente.
- `CustomerBudgetsTab.test.tsx` (Vitest):
  - Renderização da tabela de orçamentos e clique nos botões de ação.

---

## 🎨 4. Referências de Design e Protótipos

- 🖥️ **Protótipo Interativo da Central 360°**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html) — Especifica o layout mestre-detalhe (sidebar de 320px com pesquisa rápida, hero card de topo e container de abas com a aba "Orçamentos").
