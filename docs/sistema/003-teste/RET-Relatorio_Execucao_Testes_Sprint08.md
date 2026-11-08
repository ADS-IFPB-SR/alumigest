# RET — Relatório de Execução de Testes — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 08 — Venda Avulsa de Partes (US-46), Central 360° do Cliente (US-47) e Qualidade PROSA |
| **Versão da Baseline** | B-ALG-v0.8.0-S08-01 |
| **Data de Fechamento** | 08/11/2026 |
| **Responsável QA** | Equipe de Engenharia e Qualidade AlumiGest |
| **Tasks de QA / Referência** | [US-46.5 (#551)](https://github.com/ADS-IFPB-SR/alumigest/issues/551), [QA-US-46 (#555)](https://github.com/ADS-IFPB-SR/alumigest/issues/555), [US-47.5 (#556)](https://github.com/ADS-IFPB-SR/alumigest/issues/556) |
| **Branch de Homologação** | `feat/us-47.5-testes-e2e-integracao-matriz-556` |

---

## 1. 🎯 Resumo Executivo da Qualidade

A Sprint 08 contemplou a entrega e homologação integrada dos módulos de **Venda Avulsa de Partes (US-46 #477)** e da **Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas (US-47 #496 & US-47.5 #556)**:

1. **Catálogo Integrado por Categoria (US-46.5):** Endpoint `GET /api/v1/materials?category={category}`, cobrindo Vidros (`GLASS`), Perfis de Alumínio (`PROFILE`), Películas (`FILM`) e Ferragens (`HARDWARE`) com consulta otimizada (`JOIN FETCH`) eliminando o problema de queries N+1.
2. **Autocomplete Inteligente e Focado:** Seleção dinâmica por nome e código de família, auto-preenchimento do preço unitário padrão no formulário e supressão de badges de preço na listagem suspensa.
3. **Transparência de Precificação Industrial:** Apuração proporcional de barras de alumínio com perda de corte de 5% já embutida no valor final anunciado, sem acréscimos surpresa no total faturado ($1,0000\text{ m} \times \text{R\$ } 80,00 = \text{R\$ } 80,00$).
4. **Central 360° do Cliente (US-47):** Visão Master-Detail holística do cliente com Hero Card (PF/PJ, endereço, telefone, documento), 3 KPIs consolidados (Total Contratado, O.S. ativas e Orçamentos), gestão de propostas na aba Orçamentos com atalho WhatsApp e PDF, tabela de Ordens de Serviço sem compressão visual em 1366x768 e 1920x1080, drawer de esquadrias físicas com medidas nominais em milímetros (`📐 L x A mm`), download de Ficha Técnica A4 e emissão de Etiquetas Térmicas (100x60mm).
5. **Isolamento e Segurança de Dados:** Prevenção de inserções sem material do catálogo, reset reativo de estado ao alternar abas de materiais e limpeza automática de dados de teste (Hard delete em cascata via `TestCleanupController`).

* **Status do Quality Gate:** ✅ **APROVADO (OK)**
* **Taxa de Sucesso dos Testes:** `100%` (Zero falhas na baseline final)
* **Total de Testes Automatizados no Escopo:** **1081 testes aprovados** (40 Backend + 1025 Frontend Vitest + 16 E2E Cypress)
* **Análise Estática e Compilação:** 0 erros no TypeScript (`tsc -b`), 0 erros no linter (`oxlint`), 0 falhas no Maven.

---

## 2. 📊 Consolidação da Pirâmide de Testes

| Camada / Tipo | Framework | Testes Executados | Passaram | Falharam | Status |
|---|---|:---:|:---:|:---:|:---:|
| **Testes Unitários e Integração Backend** | Spring Boot Test + JUnit 5 + Mockito + MockMvc + H2 Database | 40 | 40 | 0 | ✅ 100% Aprovado |
| **Testes de Componentes e Hooks Frontend** | Vitest + React Testing Library + Happy-DOM | 1025 | 1025 | 0 | ✅ 100% Aprovado |
| **Testes E2E (End-to-End Visual & Isolamento)** | Cypress (`us46_venda_avulsa_visual.cy.ts` & `us47_hub_360_cliente.cy.ts`) | 16 | 16 | 0 | ✅ Homologado |
| **TOTAL CONSOLIDADO DA SPRINT 08** | — | **1081** | **1081** | **0** | **✅ 100% Aprovado** |

---

## 3. 🗺️ Matriz de Rastreabilidade por Critério de Aceite (US-46 & US-47)

| Identificador | Critério de Aceite / Regra | Suíte de Testes Automatizados | Status |
|:---:|---|---|:---:|
| **CA 1** | Filtragem de materiais ativos por categoria na API REST | `MaterialControllerTest.java`, `MaterialRepositoryTest.java` | ✅ Aprovado |
| **CA 2** | Autocomplete com busca textual, exibição limpa e auto-preenchimento de preço padrão | `MaterialAutocomplete.test.tsx`, `PartSaleForm.test.tsx` | ✅ Aprovado |
| **CA 3** | Vinculação estrita de `materialId` no cálculo e `referenceId` no item da venda | `PartSaleControllerTest.java`, `PartSaleServiceImplTest.java` | ✅ Aprovado |
| **CA 4** | Bloqueio de inserção sem seleção de material do catálogo com alerta visual | `PartSaleForm.test.tsx`, `us46_venda_avulsa_visual.cy.ts` | ✅ Aprovado |
| **CA 5** | Reset imediato do formulário e cálculos ao alternar abas de categoria | `PartSaleMaterialForm.test.tsx`, `PartSaleForm.test.tsx` | ✅ Aprovado |
| **RN-02** | Aplicação compulsória de piso mínimo de $0,25\text{ m}^2$ para peças pequenas de vidro | `GlassItemFields.test.tsx`, `us46_venda_avulsa_visual.cy.ts` | ✅ Aprovado |
| **RN-PREC** | Precificação de alumínio proporcional sem sobretaxa oculta no checkout | `AluminumItemFields.test.tsx`, `us46_venda_avulsa_visual.cy.ts` | ✅ Aprovado |
| **CLEANUP** | Exclusão em cascata de dados gerados nos testes contra banco real | `TestCleanupController.java`, `us46_venda_avulsa_visual.cy.ts` | ✅ Aprovado |
| **US-47-HP01** | Busca dinâmica na sidebar, Hero Card e 3 KPIs agregados | `us47_hub_360_cliente.cy.ts`, `ClientHubControllerIntegrationTest.java` | ✅ Aprovado |
| **US-47-HP02** | Gestão de propostas na aba Orçamentos com ações rápidas (PDF e WhatsApp) | `us47_hub_360_cliente.cy.ts`, `CustomerBudgetsTab.test.tsx` | ✅ Aprovado |
| **US-47-HP03** | Tabela de O.S. sem compressão visual nas resoluções 1366x768 e 1920x1080 | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |
| **US-47-HP04** | Detalhamento de esquadrias físicas com medidas nominais em mm (`📐 L x A mm`) | `us47_hub_360_cliente.cy.ts`, `CustomerOrdersTab.test.tsx` | ✅ Aprovado |
| **US-47-HP05** | Emissão e download de Ficha Técnica A4 de corte com ângulos e folgas | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |
| **US-47-HP06** | Emissão e conferência de Etiquetas Térmicas (100x60mm) para Elgin L42 | `us47_hub_360_cliente.cy.ts`, `ThermalLabelModal.test.tsx` | ✅ Aprovado |
| **US-47-HP07** | Redirecionamento para novo orçamento com cliente pré-selecionado | `us47_hub_360_cliente.cy.ts`, `CustomerHeroCard.test.tsx` | ✅ Aprovado |
| **US-47-SP01** | Estados vazios (Empty States) para clientes recém-cadastrados sem movimentação | `us47_hub_360_cliente.cy.ts`, `CustomerHubPage.test.tsx` | ✅ Aprovado |
| **US-47-SP02** | Tratamento de falha de conexão na API (erro 500/rede) sem quebrar sidebar | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |
| **US-47-SP03** | Busca sem resultados na barra lateral exibindo mensagem amigável | `us47_hub_360_cliente.cy.ts`, `CustomerMasterSidebar.test.tsx` | ✅ Aprovado |
| **US-47-EC01** | O.S. volumosa com múltiplas esquadrias e rolagem vertical fluida | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |
| **US-47-EC02** | Consistência visual e contraste em Modo Escuro utilizando tokens M3 | `us47_hub_360_cliente.cy.ts` | ✅ Aprovado |

---

## 4. 🐞 Defeitos Identificados e Solucionados (RBD)

Durante as sessões de desenvolvimento, auditoria de código e testes automatizados, foram catalogados e formalizados no [RBD do Projeto AlumiGest](../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md) os seguintes defeitos:

| ID | Título do Defeito | Severidade | Módulo | Status | Resolução |
|:---:|---|:---:|:---:|:---:|---|
| **BUG-041** | Falha na Persistência de Venda com Cliente Balcão não Cadastrado (HTTP 404/500) | 🔴 Alta | Backend / PartSale | ✅ Resolvido | Migration `V24` com cliente padrão e método defensivo `resolveClient`. |
| **BUG-042** | Markup Surpresa de Perda de Corte no Alumínio (+5% no Checkout de Venda Avulsa) | 🟡 Média | Frontend / PartSale | ✅ Resolvido | Ajuste do cálculo comercial para perda proporcional embutida no preço unitário. |
| **BUG-043** | Poluição Visual e Redundância de Preço no Seletor de Materiais do Catálogo | 🟢 Baixa | Frontend / UI | ✅ Resolvido | Remoção da badge de preço no dropdown, mantendo foco em Nome e Família. |
| **BUG-044** | Falha de Isolamento em Testes E2E com Resíduos de Vendas Avulsas no PostgreSQL | 🟡 Média | Backend / Testes | ✅ Resolvido | Endpoint de exclusão em cascata ativado no `after()` do Cypress. |
| **BUG-045** | NullPointerException em O.S. sem Orçamento Vinculado no Hub 360° | 🟡 Média | Backend / Testes | ✅ Resolvido | Ajuste em `ClientHubControllerIntegrationTest.java` com `orcamentoId` obrigatório e `OffsetDateTime`. |

---

## 5. 🖥️ Evidências de Execução Automatizada

### 5.1 Backend (`mvn test`):
```text
[INFO] Running br.edu.ifpb.alumigest.catalog.controller.MaterialControllerTest (3 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.catalog.repository.MaterialRepositoryTest (4 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.partsale.controller.PartSaleControllerTest (14 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.partsale.service.PartSaleServiceImplTest (12 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.clients.controller.ClientHubControllerIntegrationTest (4 tests) - SUCCESS
[INFO] Tests run: 40, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 5.2 Frontend (`npx vitest run`):
```text
Test Files  122 passed (122)
     Tests  1025 passed (1025)
  Duration  45.65s
```

### 5.3 Testes E2E no Cypress (`npm run test:e2e:us46`):
```text
  US-46: Módulo de Venda Avulsa de Partes (Fluxo Visual E2E)
    ✓ Cenário 1: Carregamento Inicial da Tela de Venda Avulsa e Layout Limpo (1821ms)
    ✓ Cenário 2: Adição de Perfil de Alumínio (1 metro linear) com Cálculo Transparente (1942ms)
    ✓ Cenário 3: Adição de Vidro Pequeno com Aplicação Obrigatória de Piso Mínimo (0.25 m²) (2104ms)
    ✓ Cenário 4: Venda Completa Multimaterial, Salvamento no Banco e Modais de Exportação (4188ms)
  4 passing (11s)
```

### 5.4 Testes E2E no Cypress — Central 360° (`npm run test:e2e:us47`):
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

*Relatório de Execução de Testes (RET) homologado pela Engenharia de Software e Qualidade AlumiGest — Sprint 08 — Novembro/2026*
