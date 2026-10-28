# 🧪 TEA — Testes de Aceitação e Cenários BDD — Sprint 02

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 02 — Catálogo de Materiais Universais e Fichas Técnicas de Produtos |
| **Versão da Baseline** | `B-ALG-v0.2.0-S02-01` |
| **Roteiro Manual PO/QA** | [`RTM-Roteiro_de_Testes_Manuais_Sprint02.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint02.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint02.md`](./RET-Relatorio_Execucao_Testes_Sprint02.md) |
| **Status Global** | 🟢 Homologado e Automatizado (100% de Aceitação) |
| **Data de Homologação** | 18/08/2026 |

---

## 1. Visão Geral e Estratégia de Testes da Sprint 02

A Sprint 02 estabeleceu a fundação arquitetural e de domínio para os insumos fabris do AlumiGest, contemplando o **Catálogo Genérico de Materiais** (Vidros, Perfis de Alumínio, Películas e Ferragens), a máquina de persistência Flyway e a navegação inicial PWA com formulários reativos.

### Estrutura da Tríade Documental:
* **TEA (este documento):** Especificação formal dos critérios de aceitação BDD (*Dado-Quando-Então*) e mapeamento com suítes automatizadas JUnit 5 e Cypress.
* **RTM:** Fichas operacionais executivas para homologação manual com seletores de interface (`[data-cy="..."]`).
* **RET:** Consolidação da pirâmide de testes (48 testes automatizados no backend e 14 cenários BDD homologados).

---

## 2. Matriz Canônica BDD / E2E por História de Usuário

### US-013: Migrations Flyway e Entidades Base do Catálogo (Sub-issue #11)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 01 | Inicialização do Schema do Catálogo | `V1__create_generic_catalog.sql` / `MaterialRepositoryTest` | Integração PostgreSQL / Flyway | Banco de dados ativo sem tabelas | Executa migration inicial do Spring Boot | Cria tabelas e popula os 4 grupos nativos (`VIDRO`, `ALUMINIO`, `PELICULA`, `FERRAGEM`) com `is_system_default = true` | ✅ Passou |
| 02 | Proteção de Grupos Nativos | `MaterialGroupServiceTest` | Teste Unitário Spring / Mockito | Grupo nativo `VIDRO` existente | Tenta realizar exclusão física do grupo | Sistema lança `BusinessException` (HTTP 422) e impede deleção | ✅ Passou |

---

### US-017: Catálogo de Vidros (2mm a 10mm) por m² (Sub-issue #12)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 03 | Cadastro de Vidro 4mm com Cálculo por m² | `cypress/e2e/catalog/catalog-glass.cy.ts` | E2E Cypress Fullstack (`glass-form.json`) | Formulário de Vidros aberto via `[data-cy="material-type-glass"]` | Preenche nome "Vidro Canelado 4mm", espessura 4mm, cor "Incolor" e preço R$ 110,00/m² | Vidro salvo com sucesso, toast exibido e listado na `[data-cy="glass-table"]` | ✅ Passou |
| 04 | Cadastro de Vidro Extra Fino 2mm | `cypress/e2e/catalog/catalog-glass.cy.ts` | E2E Cypress Fullstack | Formulário de Vidros aberto | Informa espessura nominal de 2.00mm e acabamento lapidado | Cadastro persistido com cálculo de área proporcional | ✅ Passou |
| 05 | Bloqueio de Preço Zero ou Negativo | `cypress/e2e/catalog/catalog-glass-validation.cy.ts` | E2E Validação Zod / Client | Formulário de Vidros aberto | Informa preço de venda `0.00` ou negativo | Botão salvar desabilitado e mensagem "Preço deve ser maior que zero" é exibida | ✅ Passou |

---

### US-014: Perfis de Alumínio em Barras de 3m e 6m (Sub-issue #13)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 06 | Cadastro de Perfil Barra 3.00m Linha Rometal | `cypress/e2e/catalog/catalog-profile.cy.ts` | E2E Cypress Fullstack | Formulário de Perfis aberto | Informa linha "Rometal", ref "S83", barra 3m e preço linear R$ 45,00/m | Perfil cadastrado com cálculo de peso por metro e listado na tabela | ✅ Passou |
| 07 | Cadastro de Perfil Barra 6.00m Linha Alternativa | `cypress/e2e/catalog/catalog-profile.cy.ts` | E2E Cypress Fullstack | Formulário de Perfis aberto | Informa linha "Alternativa", ref "SPR-060", barra 6m e NCM `7604.29.00` | Perfil salvo com NCM válido e exibição em Caixa Alta | ✅ Passou |
| 08 | Unicidade de Referência Comercial | `AluminumProfileServiceTest` | Teste Unitário Backend / Mockito | Perfil já existente com ref "S83" no grupo | Tenta cadastrar outro material com mesma referência | Backend rejeita com `DuplicateResourceException` (HTTP 409) | ✅ Passou |

---

### US-016: Catálogo de Películas por m² (Sub-issue #14)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 09 | Cadastro de Película Fumê G5 | `cypress/e2e/catalog/catalog-film.cy.ts` | E2E Cypress Fullstack | Aba Películas ativa `[data-cy="catalog-tab-films"]` | Informa nome "Película Fumê G5", tipo "FUMÊ", preço R$ 35,00/m² | Película persistida com unidade M2 e visível na `[data-cy="film-table"]` | ✅ Passou |

---

### US-015: Ferragens e Acessórios por UN, PAR e METRO (Sub-issue #15)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 10 | Cadastro de Ferragem Unidade PAR | `cypress/e2e/catalog/catalog-hardware.cy.ts` | E2E Cypress Fullstack | Aba Ferragens ativa `[data-cy="catalog-tab-hardwares"]` | Informa "Kit Roldana Dupla", unidade "PAR", preço R$ 28,00 | Cadastrado com unidade PAR e preço base | ✅ Passou |
| 11 | Cadastro de Ferragem Linear (METRO) | `cypress/e2e/catalog/catalog-hardware.cy.ts` | E2E Cypress Fullstack | Aba Ferragens ativa | Informa "Escova de Vedação 5x7", unidade "METRO", preço R$ 3,50/m | Cadastrado com fracionamento linear permitido | ✅ Passou |

---

### US-019 a US-021: Categorias de Produtos e Ficha Técnica (Issue #31)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 12 | Criação de Categoria de Produtos | `ProductCategoryControllerTest` | Integração MockMvc Spring Boot | Dados válidos da categoria "Portas de Alumínio" | Dispara `POST /api/v1/products/categories` | Retorna status HTTP 201 Created com UUID persistido | ✅ Passou |
| 13 | Ficha Técnica com Composição Multi-Insumo | `ProductServiceTest` | Teste Unitário Backend | Produto base e insumos cadastrados | Associa perfis, vidros e componentes na ficha técnica | Entidade `Product` vincula itens em `tb_product_items` com cascata | ✅ Passou |

---

### US-022 e US-023: Interface Web PWA e Navegação de Catálogo

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 14 | Alternância Dinâmica de Abas de Insumos | `cypress/e2e/catalog/catalog-navigation.cy.ts` | E2E Cypress Navegação | Catálogo aberto na rota `/` | Clica sequencialmente nas abas Vidros, Alumínio, Películas e Ferragens | URL e grid reagem instantaneamente sem reload de página | ✅ Passou |

---

## 3. Rastreabilidade com os Requisitos do Sistema

| Cenário TEA | Requisito Funcional (RF) | Regra de Negócio (RN) | Issue GitHub / PR |
|:---:|:---:|:---:|:---:|
| 01 – 02 | `RF-001` (Gestão de Insumos) | `RN-CAT01` (Proteção de Grupos Nativos) | Issue #11 / PR #38 |
| 03 – 05 | `RF-002` (Catálogo de Vidros) | `RN-V01` (Espessuras) / `RN-V03` (Área Mínima) | Issue #12 / PR #77 |
| 06 – 08 | `RF-003` (Catálogo de Perfis) | `RN-AL01` (Barras Comerciais) / `RN-AL02` (NCM) | Issue #13 / PR #77 |
| 09 | `RF-004` (Catálogo de Películas) | `RN-PEL01` (Cálculo por $m^2$) | Issue #14 / PR #77 |
| 10 – 11 | `RF-005` (Catálogo de Ferragens) | `RN-FER01` (Unidades de Medida) | Issue #15 / PR #77 |
| 12 – 13 | `RF-006` (Modelos e Ficha Técnica) | `RN-PRD01` (Composição de Materiais) | Issue #31 / PR #79 |
| 14 | `RF-007` (Interface de Catálogo PWA) | `RN-UI01` (Reatividade de Interface) | Issue #23 / PR #77 |
