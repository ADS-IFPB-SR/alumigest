# 🧪 TEA — Testes de Aceitação e Cenários BDD — Sprint 03

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 03 — Clientes, Motor de Orçamentos, Templates de Esquadrias e E2E Cypress |
| **Versão da Baseline** | `B-ALG-v0.3.0-S03-01` |
| **Roteiro Manual PO/QA** | [`RTM-Roteiro_de_Testes_Manuais_Sprint03.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint03.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint03.md`](./RET-Relatorio_Execucao_Testes_Sprint03.md) |
| **Relatório de Testes UI (QA-01.2)** | [`RTE-QA-01.2-Relatorio_Testes_UI_Produtos.md`](./RTE-QA-01.2-Relatorio_Testes_UI_Produtos.md) |
| **Status Global** | 🟢 Homologado e Automatizado (100% de Aceitação) |
| **Data de Homologação** | 31/08/2026 |

---

## 1. Visão Geral e Estratégia de Testes da Sprint 03

A Sprint 03 consolidou uma das maiores expansões de qualidade do AlumiGest:
1. **Módulo de Clientes:** Cadastro e validação de clientes PF (CPF) e PJ (CNPJ) com integridade e busca paginada.
2. **Motor de Cálculo de Orçamentos (Backend):** Fórmulas de corte de perfis ($4W+6H$), área de vidro em $m^2$, ferragens por peso/área e formação de preço com markup.
3. **Automação E2E com Cypress (Frontend):** 23 specs de catálogo cobrindo fluxos críticos das 4 abas de materiais.
4. **Interface CAD e Templates SVG (Frontend QA-01.2):** Renderização vetorial dos modelos de esquadrias e modal de seleção com 40 testes no Vitest.

---

## 2. Matriz Canônica BDD / E2E por História de Usuário

### US-008: Gestão de Clientes PF e PJ (PR #79)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 01 | Cadastro de Cliente Pessoa Física (PF) | `ClientServiceTest` / `ClientControllerTest` | Teste Unitário & Integração MockMvc | Formulário de clientes aberto | Informa nome completo, CPF válido `111.444.777-05` e endereço completo | Salva cliente gerando UUID e status ATIVO | ✅ Passou |
| 02 | Cadastro de Cliente Pessoa Jurídica (PJ) | `ClientServiceTest` / `ClientControllerTest` | Integração MockMvc Spring Boot | Dados da empresa informados | Informa Razão Social, CNPJ válido `12.345.678/0001-90` e Inscrição Estadual | Cria registro com identificação PJ e vínculo comercial | ✅ Passou |
| 03 | Rejeição de Documento Duplicado | `ClientControllerTest` | Validação de Constraint JPA | Cliente existente no banco com CPF `111.444.777-05` | Tenta cadastrar novo cliente com mesmo documento | Rejeita requisição com HTTP 409 Conflict | ✅ Passou |
| 04 | Busca Paginada de Clientes com Debounce | `ClientRepositoryTest` | Query Nativa JPA / PagingAndSorting | Clientes persistidos no banco | Dispara busca GET `/api/v1/clients?busca=silva&page=0&size=10` | Retorna payload paginado com os registros correspondentes | ✅ Passou |

---

### US-009: Motor de Cálculo e Precificação de Orçamentos (PR #108 / PR #117)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 05 | Migrations de Orçamento (Flyway V9) | `V9__create_budgets_schema.sql` | Teste Flyway com PostgreSQL | Schema limpo | Executa a inicialização do Spring Boot | Cria tabelas `tb_budgets`, `tb_budget_items` e `tb_budget_item_options` | ✅ Passou |
| 06 | Cálculo de Perfil Linear ($4W+6H$) | `BudgetQuantityServiceTest` | Teste Unitário Backend (Strategy) | Dimensões de vão $W=1200\text{ mm}$ e $H=1000\text{ mm}$ | Dispara o cálculo de perfis do modelo 2 Folhas Correr | Calcula comprimento nominal e aproveitamento de barras de 6m | ✅ Passou |
| 07 | Cálculo de Área e Vidros por $m^2$ | `BudgetQuantityServiceTest` | Teste Unitário Matemático | Janela de $1.20 \times 1.00\text{ m}$ ($1,20 m^2$) | Aplica espessura 4mm e lapidação | Totaliza custo de vidro observando área mínima de $0,25 m^2$ | ✅ Passou |
| 08 | Aplicação de Markup e Formação de Preço | `BudgetPricingServiceTest` | Teste Unitário Financeiro (BigDecimal) | Custo total de materiais somando R$ 450,00 | Informa markup de 40% e custos indiretos | Preço final de venda é calculado em R$ 630,00 com duas casas decimais | ✅ Passou |
| 09 | Máquina de Estados do Orçamento | `BudgetServiceTest` | Teste de Transição de Domínio | Orçamento criado no status `DRAFT` | Executa envio e aprovação do orçamento | Permite transição `DRAFT` ➔ `SENT` ➔ `APPROVED` e bloqueia edição pós-aprovação | ✅ Passou |

---

### US-010 / QA-01.2: Templates Paramétricos CAD e Interface de Produtos (Issue #100)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 10 | Renderização Vetorial CAD dos 10 Modelos | `WindowSvgPreview.test.tsx` | Vitest / Testing Library (40 specs) | Seleção de qualquer um dos 10 modelos canônicos | Informa vão L x A e acabamentos | Renderiza SVG proporcional com cotas milimétricas e puxadores | ✅ Passou |
| 11 | Seleção de Esquadria no Modal de Orçamento | `ProductPickerModal.test.tsx` | Vitest / Component Integration | Modal de seleção aberto no formulário | Aplica busca por categoria e clica em "Selecionar" | Injeta esquadria no orçamento com insumos vinculados | ✅ Passou |

---

### US-022: Suíte Completa de Testes E2E de Catálogo no Cypress (23 Specs)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 12 | Navegação Geral entre Abas | `cypress/e2e/catalog/catalog-navigation.cy.ts` | E2E Cypress Navegação | Catálogo aberto na rota `/` | Alterna entre Vidros, Perfis, Películas e Ferragens | Valida persistência da aba ativa e carregamento dos grids | ✅ Passou |
| 13 | CRUD Completo e Filtros de Vidros | `cypress/e2e/catalog/catalog-glass*.cy.ts` (6 specs) | E2E Cypress (Fixtures JSON) | Aba de Vidros aberta | Cria, filtra por status, visualiza detalhes e edita | Todas as 6 specs passam com 100% de sucesso | ✅ Passou |
| 14 | CRUD Completo e Filtros de Perfis | `cypress/e2e/catalog/catalog-profile*.cy.ts` (6 specs) | E2E Cypress | Aba de Perfis aberta | Cria perfis de 3m/6m, busca por linha e altera status | Todas as 6 specs passam com 100% de sucesso | ✅ Passou |
| 15 | CRUD e Validação de Ferragens | `cypress/e2e/catalog/catalog-hardware*.cy.ts` (5 specs) | E2E Cypress | Aba de Ferragens aberta | Valida unidades UN/PAR/METRO e tratamento de erros | Todas as 5 specs passam com 100% de sucesso | ✅ Passou |
| 16 | CRUD e Validação de Películas | `cypress/e2e/catalog/catalog-film*.cy.ts` (5 specs) | E2E Cypress | Aba de Películas aberta | Cadastra tipos Fumê/Jateada e calcula por $m^2$ | Todas as 5 specs passam com 100% de sucesso | ✅ Passou |

---

## 3. Rastreabilidade com os Requisitos do Sistema

| Cenário TEA | Requisito Funcional (RF) | Regra de Negócio (RN) | Issue GitHub / PR |
|:---:|:---:|:---:|:---:|
| 01 – 04 | `RF-008` (Gestão de Clientes) | `RN-CLI01` (Validação de Documento) | Issue #32 / PR #79 |
| 05 – 09 | `RF-009` (Motor de Orçamentos) | `RN-ORC01` ($4W+6H$) / `RN-ORC02` (Markup) | Issue #33 / PR #108 / PR #117 |
| 10 – 11 | `RF-010` (Studio CAD SVG) | `RN-CAD01` (Proporção e Cotas) | Issue #100 / PR #102 |
| 12 – 16 | `RF-007` (Catálogo PWA E2E) | `RN-UI01` (Reatividade de Interface) | Issue #34 / 23 Specs Cypress |
