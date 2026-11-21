# RET — Relatório de Execução de Testes — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 08 — Venda Avulsa de Partes (US-46), Catálogo por Categoria (US-46.5) e Qualidade PROSA |
| **Versão da Baseline** | B-ALG-v0.8.0-S08-01 |
| **Data de Fechamento** | 07/11/2026 |
| **Responsável QA** | Equipe de Engenharia e Qualidade AlumiGest |
| **Task de QA / Referência** | [US-46.5 (#551)](https://github.com/ADS-IFPB-SR/alumigest/issues/551), [QA-US-46 (#555)](https://github.com/ADS-IFPB-SR/alumigest/issues/555) |
| **Branch de Homologação** | `feat/us-46.5-adicionar-listagem-tipo-material-551` |

---

## 1. 🎯 Resumo Executivo da Qualidade

A Sprint 08 contemplou a entrega e homologação integrada do módulo de **Venda Avulsa de Partes (US-46 #477)** e da sub-task de **Listagem de Tipo de Material no Seletor (US-46.5 #551)**, estabelecendo um fluxo comercial veloz, desacoplado de estoque físico e matematicamente transparente:

1. **Catálogo Integrado por Categoria:** Endpoint `GET /api/v1/materials?category={category}`, cobrindo Vidros (`GLASS`), Perfis de Alumínio (`PROFILE`), Películas (`FILM`) e Ferragens (`HARDWARE`) com consulta otimizada (`JOIN FETCH`) eliminando o problema de queries N+1.
2. **Autocomplete Inteligente e Focado:** Seleção dinâmica por nome e código de família, auto-preenchimento do preço unitário padrão no formulário e supressão de badges de preço na listagem suspensa.
3. **Transparência de Precificação Industrial:** Apuração proporcional de barras de alumínio com perda de corte de 5% já embutida no valor final anunciado, sem acréscimos surpresa no total faturado ($1,0000\text{ m} \times \text{R\$ } 80,00 = \text{R\$ } 80,00$).
4. **Isolamento e Segurança de Dados:** Validação impeditiva de inserção sem material do catálogo, reset reativo de estado ao alternar abas de materiais e limpeza automática de dados de teste (Hard delete em cascata via `TestCleanupController`).

* **Status do Quality Gate:** ✅ **APROVADO (OK)**
* **Taxa de Sucesso dos Testes:** `100%` (Zero falhas na baseline final)
* **Total de Testes Automatizados no Escopo:** **113 testes aprovados** (36 Backend + 73 Frontend + 4 E2E Cypress)
* **Análise Estática e Compilação:** 0 erros no TypeScript (`tsc -b`), 0 erros no linter (`oxlint`), 0 falhas no Maven.

---

## 2. 📊 Consolidação da Pirâmide de Testes

| Camada / Tipo | Framework | Testes Executados | Passaram | Falharam | Status |
|---|---|:---:|:---:|:---:|:---:|
| **Testes Unitários e Integração Backend** | Spring Boot Test + JUnit 5 + Mockito + H2 Database | 36 | 36 | 0 | ✅ 100% Aprovado |
| **Testes de Componentes e Hooks Frontend** | Vitest + React Testing Library + Happy-DOM | 73 | 73 | 0 | ✅ 100% Aprovado |
| **Testes E2E (End-to-End Visual & Isolamento)** | Cypress (`us46_venda_avulsa_visual.cy.ts`) | 4 | 4 | 0 | ✅ Homologado |
| **TOTAL CONSOLIDADO DA SPRINT 08** | — | **113** | **113** | **0** | **✅ 100% Aprovado** |

---

## 3. 🗺️ Matriz de Rastreabilidade por Critério de Aceite (US-46.5 / Sprint 08)

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

---

## 4. 🐞 Defeitos Identificados e Solucionados (RBD)

Durante as sessões de desenvolvimento, auditoria de código e testes automatizados, foram catalogados e formalizados no [RBD do Projeto AlumiGest](../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md) os seguintes defeitos:

| ID | Título do Defeito | Severidade | Módulo | Status | Resolução |
|:---:|---|:---:|:---:|:---:|---|
| **BUG-041** | Falha na Persistência de Venda com Cliente Balcão não Cadastrado (HTTP 404/500) | 🔴 Alta | Backend / PartSale | ✅ Resolvido | Migration `V24` com cliente padrão e método defensivo `resolveClient`. |
| **BUG-042** | Markup Surpresa de Perda de Corte no Alumínio (+5% no Checkout de Venda Avulsa) | 🟡 Média | Frontend / PartSale | ✅ Resolvido | Ajuste do cálculo comercial para perda proporcional embutida no preço unitário. |
| **BUG-043** | Poluição Visual e Redundância de Preço no Seletor de Materiais do Catálogo | 🟢 Baixa | Frontend / UI | ✅ Resolvido | Remoção da badge de preço no dropdown, mantendo foco em Nome e Família. |
| **BUG-044** | Falha de Isolamento em Testes E2E com Resíduos de Vendas Avulsas no PostgreSQL | 🟡 Média | Backend / Testes | ✅ Resolvido | Endpoint de exclusão em cascata ativado no `after()` do Cypress. |

---

## 5. 🖥️ Evidências de Execução Automatizada

### 5.1 Backend (`mvn test`):
```text
[INFO] Running br.edu.ifpb.alumigest.catalog.controller.MaterialControllerTest (3 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.catalog.repository.MaterialRepositoryTest (4 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.partsale.controller.PartSaleControllerTest (14 tests) - SUCCESS
[INFO] Running br.edu.ifpb.alumigest.partsale.service.PartSaleServiceImplTest (12 tests) - SUCCESS
[INFO] Tests run: 36, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 5.2 Frontend (`npx vitest run`):
```text
✓ src/__tests__/features/part-sales/FilmItemFields.test.tsx (6 tests)
✓ src/__tests__/features/part-sales/CustomerSearchSelector.test.tsx (4 tests)
✓ src/__tests__/features/part-sales/MaterialAutocomplete.test.tsx (7 tests)
✓ src/__tests__/features/part-sales/usePartSales.test.tsx (5 tests)
✓ src/__tests__/features/part-sales/PartSalePage.test.tsx (3 tests)
✓ src/__tests__/features/part-sales/PartSaleMaterialForm.test.tsx (6 tests)
✓ src/__tests__/features/part-sales/PartSaleForm.test.tsx (13 tests)
✓ src/__tests__/features/part-sales/GlassItemFields.test.tsx (6 tests)
✓ src/__tests__/features/part-sales/AluminumItemFields.test.tsx (8 tests)
✓ src/__tests__/features/part-sales/PartSaleSummaryCard.test.tsx (2 tests)
✓ src/__tests__/features/part-sales/usePartCalculation.test.tsx (2 tests)
✓ src/__tests__/features/part-sales/partSaleApi.test.ts (5 tests)
✓ src/__tests__/features/part-sales/partSaleSchema.test.ts (6 tests)
Test Files  13 passed (13)
     Tests  73 passed (73)
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

---

*Relatório de Execução de Testes (RET) homologado pela Engenharia de Software e Qualidade AlumiGest — Sprint 08 — Novembro/2026*
