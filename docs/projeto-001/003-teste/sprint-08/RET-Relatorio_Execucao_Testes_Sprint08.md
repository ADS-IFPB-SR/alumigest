# 🧪 RET — Relatório de Execução de Testes — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | 08 — Venda Avulsa de Partes (`US-46`), Central 360° do Cliente (`US-47`) e Qualidade PROSA |
| **Versão da Baseline** | `B-ALG-v0.8.0-S08-01` (`release/v0.8.0`) |
| **Período / Data de Fechamento** | 27/10/2026 a 09/11/2026 (Consolidação em 08/11/2026) |
| **Responsável QA** | Equipe de Engenharia e Qualidade AlumiGest |
| **Tasks / PRs de Referência** | `US-46` ([#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)), `US-46.5` ([#551](https://github.com/ADS-IFPB-SR/alumigest/issues/551)), `QA-US-46` ([#555](https://github.com/ADS-IFPB-SR/alumigest/issues/555)), `US-47` ([#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)), `US-47.5` ([#556](https://github.com/ADS-IFPB-SR/alumigest/issues/556)), PRs `#538`–`#568` |
| **Governança** | Docs-as-Code — Tríade Documental de Testes ([`TEA`](./TEA-Testes_de_Aceitacao_Sprint08.md) • [`RTM`](./RTM-Roteiro_de_Testes_Manuais_Sprint08.md) • [`RET`](./RET-Relatorio_Execucao_Testes_Sprint08.md)) |
| **Status Geral** | 🟢 **APROVADO (100% dos Cenários BDD, Unitários, Integração e Suítes Cypress E2E)** |

---

## 1. 🎯 Resumo Executivo e Escopo dos Testes

A **Sprint 08** consolidou a entrega comercial da **Venda Avulsa de Partes (`US-46`)** e da **Central 360° do Cliente (`US-47`)**, além das correções visuais herdadas no Kanban (`#524` e `#525`):

1. **Catálogo Integrado por Categoria (`US-46.5`):** Endpoint `GET /api/v1/materials?category={category}`, cobrindo Vidros (`GLASS`), Perfis de Alumínio (`PROFILE`), Películas (`FILM`) e Ferragens (`HARDWARE`) com `JOIN FETCH` para evitar consultas N+1.
2. **Autocomplete Limpo e Regras de Domínio (`US-46`):** Busca por Nome/Família sem badges redundantes de preço (`BUG-043`), alumínio proporcional por metro linear até `6000 mm` sem acréscimo oculto (`BUG-042`), piso mínimo de $0,25\text{ m}^2$ para vidro, película com fator de perda e limite de bobina, e ferragem unitária.
3. **Gestão de Vendas Avulsas e Isolamento de Testes:** Listagem em `/vendas/avulsa` e criação em `/vendas/avulsa/nova`, `Cliente Balcão` garantido pela migration `V24` (`BUG-041`), exportação PDF/Etiquetas e limpeza automática via `TestCleanupController` (`BUG-044`).
4. **Central 360° do Cliente (`US-47` & `US-47.5`):** Tela Master-Detail em `/clientes` com Hero Card PF/PJ, 3 KPIs agregados, aba Orçamentos (PDF + WhatsApp), aba Ordens de Serviço responsiva (`1366x768` / `1920x1080`), drawer de esquadrias (`📐 L x A mm`), download de Ficha Técnica A4 (`GET /api/v1/orders/{id}/production-sheet/pdf`) e Etiquetas Térmicas `100×60 mm`.

* **Status do Quality Gate:** ✅ **APROVADO (OK)** — Zero falhas nos pipelines de build (`tsc -b`, `oxlint`, Maven).
* **Taxa de Sucesso dos Testes Executados na Homologação:** `100%` (**1.081** testes na execução focada da Sprint 08 + 14 blocos adicionais das specs `us46_venda_avulsa_partes.cy.ts` e `us46_lista_vendas_avulsas.cy.ts`).

---

## 2. 📊 Consolidação da Pirâmide de Testes da Sprint 08

| Camada / Tipo de Teste | Escopo / Frameworks | Executados | Passaram | Falharam | Status |
|---|---|:---:|:---:|:---:|:---:|
| **Backend Unitário e Integração (Foco Sprint 08)** | Spring Boot Test, JUnit 5, Mockito, MockMvc, H2 (`Material*`, `PartSale*`, `ClientHub*` — catálogo do repo soma 89 arquivos `.java` de teste na baseline `v0.8.0`) | 40 | 40 | 0 | ✅ 100% Aprovado |
| **Frontend Componentes e Hooks (Acumulado Completo)** | Vitest + React Testing Library + Happy-DOM (`122` suítes no frontend) | 1.025 | 1.025 | 0 | ✅ 100% Aprovado |
| **Testes E2E (Foco Homologação Principal S08)** | Cypress (`us46_venda_avulsa_visual.cy.ts` [4] + `us47_hub_360_cliente.cy.ts` [12]) | 16 | 16 | 0 | ✅ Homologado |
| **TOTAL DA EXECUÇÃO DE HOMOLOGAÇÃO S08** | — | **1.081** | **1.081** | **0** | **✅ 100% Aprovado** |

> [!NOTE]
> **Complemento de Suítes E2E na Baseline `release/v0.8.0`:** Além dos **16 cenários** de homologação visual/360° acima, a baseline `v0.8.0` contém outras **2 specs de Venda Avulsa** (`us46_venda_avulsa_partes.cy.ts` com 8 testes de regras/borda e `us46_lista_vendas_avulsas.cy.ts` com 6 testes de listagem/modais), totalizando **30 blocos E2E na Sprint 08** dentro das **39 specs E2E** totais do repositório.

---

## 3. 🗺️ Matriz de Rastreabilidade por Critério de Aceite (`US-46` & `US-47`)

| Identificador | Critério de Aceite / Regra | Suíte de Testes Automatizados | Status |
|:---:|---|---|:---:|
| **CA 1** | Filtragem de materiais ativos por categoria via REST | `MaterialControllerTest.java`, `MaterialRepositoryTest.java` | ✅ Aprovado |
| **CA 2** | Autocomplete limpo com auto-preenchimento de preço padrão | `MaterialAutocomplete.test.tsx`, `PartSaleForm.test.tsx` | ✅ Aprovado |
| **CA 3** | Vinculação estrita de `materialId` e `referenceId` no cálculo e persistência | `PartSaleControllerTest.java`, `PartSaleServiceImplTest.java` | ✅ Aprovado |
| **CA 4** | Bloqueio de inclusão sem material selecionado | `PartSaleForm.test.tsx`, `us46_venda_avulsa_visual.cy.ts` | ✅ Aprovado |
| **CA 5** | Reset imediato de formulário ao alternar abas de categoria | `PartSaleMaterialForm.test.tsx`, `PartSaleForm.test.tsx` | ✅ Aprovado |
| **RN-02** | Piso mínimo obrigatório de $0,25\text{ m}^2$ para vidros | `GlassItemFields.test.tsx`, `us46_venda_avulsa_visual.cy.ts`, `us46_venda_avulsa_partes.cy.ts` | ✅ Aprovado |
| **RN-PREC** | Precificação proporcional de alumínio sem sobretaxa oculta | `AluminumItemFields.test.tsx`, `us46_venda_avulsa_visual.cy.ts`, `us46_venda_avulsa_partes.cy.ts` | ✅ Aprovado |
| **LISTA-VP** | Listagem `/vendas/avulsa`, paginação, status, busca e modais | `us46_lista_vendas_avulsas.cy.ts` | ✅ Aprovado |
| **CLEANUP** | Limpeza em cascata de massa de teste via API | `TestCleanupController.java`, `us46_venda_avulsa_visual.cy.ts` | ✅ Aprovado |
| **US-47-HP01** | Busca na sidebar, Hero Card PF/PJ e 3 KPIs agregados | `us47_hub_360_cliente.cy.ts`, `ClientHubControllerIntegrationTest.java` | ✅ Aprovado |
| **US-47-HP02** | Aba Orçamentos com download PDF e atalho WhatsApp | `us47_hub_360_cliente.cy.ts`, `CustomerBudgetsTab.test.tsx` | ✅ Aprovado |
| **US-47-HP03** | Responsividade da tabela de O.S. (`1366x768` e `1920x1080`) | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |
| **US-47-HP04** | Detalhamento de esquadrias físicas em milímetros (`📐 L x A mm`) | `us47_hub_360_cliente.cy.ts`, `CustomerOrdersTab.test.tsx` | ✅ Aprovado |
| **US-47-HP05** | Emissão e download da Ficha Técnica A4 de corte | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |
| **US-47-HP06** | Modal de Etiquetas Térmicas (100×60 mm) no Hub 360° | `us47_hub_360_cliente.cy.ts`, `ThermalLabelModal.test.tsx` | ✅ Aprovado |
| **US-47-HP07** | Redirecionamento `+ Novo Orçamento` com cliente pré-selecionado | `us47_hub_360_cliente.cy.ts`, `CustomerHeroCard.test.tsx` | ✅ Aprovado |
| **US-47-SP01..03** | Empty states, resiliência HTTP 500 e busca vazia | `us47_hub_360_cliente.cy.ts`, `CustomerHubPage.test.tsx`, `CustomerMasterSidebar.test.tsx` | ✅ Aprovado |
| **US-47-EC01..02** | O.S. volumosa (9+ itens) e contraste em Modo Escuro | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |

---

## 4. 🐛 Defeitos Identificados e Solucionados In-Sprint (`RBD`)

Todos os defeitos tratados durante os ciclos de teste da Sprint 08 foram catalogados no [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md):

| ID / Issue | Descrição Resumida | Severidade | Módulo | Resolução / Status |
|:---:|---|:---:|:---:|---|
| **BUG-041** | Falha na Persistência de Venda com Cliente Balcão não Cadastrado (HTTP 404/500) | 🔴 Alta | Backend / PartSale | ✅ Corrigido via `V24` + método `resolveClient` |
| **BUG-042** | Markup Surpresa de Perda de Corte no Alumínio (+5% no Checkout de Venda Avulsa) | 🟡 Média | Frontend / PartSale | ✅ Corrigido com cálculo proporcional transparente |
| **BUG-043** | Poluição Visual e Redundância de Preço no Seletor de Materiais do Catálogo | 🟢 Baixa | Frontend / UI | ✅ Corrigido removendo badge de preço em `MaterialAutocomplete` |
| **BUG-044** | Falha de Isolamento em Testes E2E com Resíduos de Vendas Avulsas no PostgreSQL | 🟡 Média | Backend / Testes | ✅ Corrigido com limpeza em cascata (`TestCleanupController`) no `after()` |
| **BUG-045** | `NullPointerException` em O.S. sem Orçamento Vinculado no Hub 360° | 🟡 Média | Backend / Testes | ✅ Corrigido em `ClientHubControllerIntegrationTest.java` (`orcamentoId` e `OffsetDateTime`) |
| **#524** | Duplicidade do item Kanban na barra lateral (Sidebar) | 🟢 Baixa | Frontend / Menu | ✅ Corrigido via `PR #544` |
| **#525** | Painel Kanban sem rolagem vertical fluida nas colunas | 🟡 Média | Frontend / Layout | ✅ Corrigido via `PR #540` |

---

## 5. 🖥️ Evidências Consolidada de Execução Automatizada

### 5.1 Backend Focado Sprint 08 (`mvn test`):
```text
[INFO] Running br.edu.ifpb.alumigest.catalog.controller.MaterialControllerTest (3 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.catalog.repository.MaterialRepositoryTest (4 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.partsale.controller.PartSaleControllerTest (14 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.partsale.service.PartSaleServiceImplTest (12 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.clients.controller.ClientHubControllerIntegrationTest (4 tests) - SUCCESS
[INFO] Tests run: 40, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 5.2 Frontend Completo (`npx vitest run`):
```text
Test Files  122 passed (122)
     Tests  1025 passed (1025)
  Duration  45.65s
```

### 5.3 Cypress E2E — Venda Avulsa Visual (`npm run test:e2e:us46`):
```text
  US-46: Módulo de Venda Avulsa de Partes (Fluxo Visual E2E)
    ✓ Cenário 1: Carregamento Inicial da Tela de Venda Avulsa e Layout Limpo (1821ms)
    ✓ Cenário 2: Adição de Perfil de Alumínio (1 metro linear) com Cálculo Transparente (1942ms)
    ✓ Cenário 3: Adição de Vidro Pequeno com Aplicação Obrigatória de Piso Mínimo (0.25 m²) (2104ms)
    ✓ Cenário 4: Venda Completa Multimaterial, Salvamento no Banco e Modais de Exportação (4188ms)
  4 passing (11s)
```

### 5.4 Cypress E2E — Central 360° (`npm run test:e2e:us47`):
```text
  US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas
    ✓ TC-47-HP01: Busca dinâmica, seleção na sidebar e carregamento do Hero Card com 3 KPIs consolidados (3801ms)
    ✓ TC-47-HP02: Gestão e listagem de propostas na aba "Orçamentos" com ações rápidas (PDF e WhatsApp) (1164ms)
    ✓ TC-47-HP03: Tabela de Ordens de Serviço (O.S.) sem compressão visual nas resoluções 1366x768 e 1920x1080 (1285ms)
    ✓ TC-47-HP04: Detalhamento de esquadrias físicas com medidas nominais em milímetros (📐 L x A mm) ao clicar na O.S. (1299ms)
    ✓ TC-47-HP05: Abertura e renderização do fluxo de Ficha Técnica A4 de corte com ângulos e folgas (1169ms)
    ✓ TC-47-HP06: Abertura e renderização do modal de Etiquetas Térmicas (100x60mm) para impressora Elgin L42 (1207ms)
    ✓ TC-47-HP07: Navegação para novo orçamento a partir do botão "+ Novo Orçamento" com cliente pré-selecionado (1040ms)
    ✓ TC-47-SP01: Exibição elegante de Empty States para clientes recém-cadastrados sem movimentação comercial (1107ms)
    ✓ TC-47-SP02: Tratamento de falha de conexão na API (erro 500/rede) sem quebrar a sidebar mestre (7912ms)
    ✓ TC-47-SP03: Busca sem resultados na barra lateral exibindo mensagem amigável (1744ms)
    ✓ TC-47-EC01: O.S. volumosa com múltiplas esquadrias (rolagem e grid fluido sem quebrar o layout mestre) (1212ms)
    ✓ TC-47-EC02: Consistência visual e contraste em Modo Escuro utilizando tokens semânticos M3 (946ms)
  12 passing (24s)
```

---

## 6. 🛡️ Parecer Final de Homologação de QA

A esteira da **Sprint 08** cumpriu integralmente o **Definition of Done (DoD)** e encontra-se **APROVADA** na baseline **`v0.8.0`**, respaldada pela tríade documental canônica ([`TEA`](./TEA-Testes_de_Aceitacao_Sprint08.md), [`RTM`](./RTM-Roteiro_de_Testes_Manuais_Sprint08.md) e [`RET`](./RET-Relatorio_Execucao_Testes_Sprint08.md)) e pelas evidências complementares em [`docs/qualidade/`](../../../qualidade/).

---

*Relatório de Execução de Testes homologado pela Equipe de QA AlumiGest — Baseline B-ALG-v0.8.0-S08-01 — 08/11/2026*
