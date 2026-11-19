# 📑 Especificação Funcional Integrada — Sprint 08

**Período Oficial da Sprint 08**: 27/10/2026 a 09/11/2026 (**Status:** 🟢 Concluída — `release/v0.8.0`)  
**Histórias de Usuário Contempladas**:
- **US-46**: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas) — Issue [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)
- **US-47**: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas — Issue [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)

---

## 1. 🎯 Objetivos de Negócio

### 1.1 US-46: Venda Avulsa de Partes e Insumos
Permitir que a Alumiportas realize orçamentos e vendas diretas de insumos e partes individualizadas — chapas e peças de vidro sob medida por m², perfis de alumínio por metro linear ou barra cortada, ferragens avulsas por unidade (roldanas, puxadores, fechaduras, braços de articulação) e películas de controle solar/segurança sob medida por m² —, especificando acabamento, medidas dimensionais nominais ($L \times A$ mm) e quantidade, com cálculo automático de preços e faturamento, sem a obrigatoriedade de compor uma esquadria completa.

### 1.2 US-47: Central 360° do Cliente
Prover uma interface integrada "Central 360° do Cliente" em layout mestre-detalhe limpo e contínuo, onde ao selecionar um cliente o operador visualize instantaneamente todos os seus orçamentos vinculados, todas as suas Ordens de Serviço (O.S.) e os itens físicos/esquadrias da O.S. ativa com suas medidas nominais em milímetros ($L \times A$ mm), podendo acionar diretamente dali a impressão de etiquetas térmicas (100x60mm Elgin L42), a emissão da Ficha Técnica de Produção (A4), o download de comprovantes PDF e a abertura do fluxo de produção no Kanban.

---

## 2. 🧪 Fatiamento Vertical e Critérios de Aceitação

A Sprint 08 é estruturada em **Fatias Verticais (*Thin Vertical Slices*)**, onde cada sub-tarefa corta todas as camadas técnicas (BD + Backend + Frontend + Testes automatizados), entregando um incremento de negócio funcional, autônomo e demonstrável.

### 📦 US-46 — Venda de Partes (Fatiamento por Insumo & Capacidade)

#### US-46.1: Venda Avulsa de Ferragens por Unidade (Fullstack)
- [x] Criação da modelagem relacional base `tb_part_sales` e `tb_part_sale_items` (`V23`) com vínculo à tabela de catálogo `tb_materials` (operando comercialmente sem bloqueio de estoque enquanto o módulo de estoque não é implantado).
- [x] Implementação de cálculo por unidade inteira (`quantity` $\times$ `sale_price`) sem exigência de dimensões físicas ($L \times A$ = null) através de `HardwarePartCalculator implements PartItemCalculator`.
- [x] Interface de nova cotação (`/vendas/avulsa/nova`, com redirect de `/vendas/partes/nova`) com campos especializados e testes unitários/MockMvc/Vitest.

#### US-46.2: Venda de Perfis de Alumínio em Metro Linear (Fullstack)
- [x] Criação isolada da classe `AluminumProfilePartCalculator implements PartItemCalculator` apurando comprimento nominal em metros ($\text{mm} / 1000 \times \text{qtd}$) com fator de perda parametrizável e limite de barra de `6000 mm`.
- [x] Criação isolada do subcomponente `AluminumItemFields.tsx` com input `Comprimento (mm)` e badge `Metro Linear`.
- [x] Testes unitários com fator de perda e testes de interface com reatividade via TanStack Query.

#### US-46.3: Venda de Vidros e Películas em m² com Fração Mínima (Fullstack)
- [x] Criação isolada de `GlassPartCalculator` e `FilmPartCalculator` apurando área faturável em m² ($L \times A / 1.000.000$), com aplicação da fração mínima de $0,25\text{ m}^2$ para vidros e perdas de corte para películas.
- [x] Validações dimensionais de limites físicos de chapas/bobinas (`PartSaleValidationService`) retornando HTTP 422 em caso de extrapolação.
- [x] Criação isolada de `GlassItemFields.tsx` e `FilmItemFields.tsx` com campos `Largura (mm)` e `Altura (mm)` e validação visual.
- [x] Testes unitários e de integração de cálculo de frações mínimas e limites operacionais.

#### US-46.4: Emissão e Exportação do Orçamento/Pedido em PDF A4 (Fullstack)
- [x] Serviço de geração gráfica vetorial `PartSalePdfService` (OpenPDF) com tabelas agrupadas pelas 4 categorias (`VIDROS`, `ALUMÍNIOS`, `FERRAGENS` e `PELÍCULAS`), omitindo seções vazias.
- [x] Endpoints `GET /api/v1/part-sales/{id}/pdf` e `POST /api/v1/part-sales/export-pdf` para download direto e prévia de rascunho.
- [x] Exportação via blob stream no frontend (`PartSaleListPage.tsx` / `PartSaleFormPage.tsx`).
- [x] Testes automatizados de geração binária do PDF com as 4 categorias populadas.

#### US-46.5 & US-46.6: Seletor por Categoria, Cliente Balcão e Suíte E2E (Fullstack & QA)
- [x] Endpoint `GET /api/v1/materials?category={category}` (`MaterialController`) com consulta `JOIN FETCH`, autocomplete inteligente (`MaterialAutocomplete.tsx`) e seed `Cliente Balcão` (`V24`).
- [x] Suíte E2E Cypress (`us46_venda_avulsa_visual.cy.ts`, `us46_venda_avulsa_partes.cy.ts`, `us46_lista_vendas_avulsas.cy.ts`) com limpeza automática via `TestCleanupController`.

---

### 📦 US-47 — Central 360° do Cliente (Fatiamento por Capacidade Funcional)

#### US-47.1: Hub 360° Base, KPIs e Gestão de Orçamentos (Fullstack)
- [x] Endpoints CQRS de leitura otimizada em `ClientHubController`: `GET /api/v1/clients/{id}/dashboard` (KPIs consolidados) e `GET /api/v1/clients/{id}/budgets` (com aliases `/api/v1/clientes`, `/api/clientes`, `/api/v1/customers`).
- [x] Layout mestre-detalhe shell `CustomerHubPage.tsx`: barra lateral filtrável `CustomerMasterSidebar.tsx`, Hero com dados cadastrais `CustomerHeroCard.tsx` e KPIs `CustomerKpiGrid.tsx`.
- [x] Aba isolada `CustomerBudgetsTab.tsx` com link de envio via WhatsApp e download do PDF comercial existente.
- [x] Testes unitários/integrados backend (`ClientHubControllerIntegrationTest`, `ClientHubControllerTest`) e frontend (`Vitest`).

#### US-47.2: Gestão de Ordens de Serviço (O.S.) e Esquadrias (Fullstack)
- [x] Endpoint `GET /api/v1/clients/{id}/orders` trazendo ordens de serviço ativas com situação fabril, valor total e itens de esquadrias com medidas nominais ($L \times A$ mm).
- [x] Aba isolada `CustomerOrdersTab.tsx` com seleção da linha ativa e detalhamento de esquadrias físicas.
- [x] Testes de serialização de esquadrias e testes de renderização da tabela de ordens de serviço.

#### US-47.3: Emissão da Ficha Técnica A4 de Produção com Lista de Corte (Fullstack)
- [x] Serviços `ProductionSheetService` e `ProductionSheetPdfService` (OpenPDF) com estratégias `SupremaSlidingWindowCalculator` e `DefaultFrameCalculator` calculando cortes de perfis ($45^\circ / 90^\circ$), vidros com folgas e acessórios.
- [x] Endpoints `GET /api/v1/orders/{id}/production-sheet` e `GET /api/v1/orders/{id}/production-sheet/pdf` no `OrderController`.
- [x] Integração do acionamento direto na aba de O.S. da Central 360° e na página de detalhes da O.S.
- [x] Testes de cálculo de folgas e geração de bytes do PDF A4 (`ProductionSheetPdfServiceTest`, `ProductionSheetServiceTest`).

#### US-47.4: Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub (Fullstack / UI)
- [x] Conexão direta da ação "Etiquetas" da O.S. ao modal existente `ThermalLabelModal.tsx` (US-17), repassando identificador do pedido e esquadrias para disparo na impressora Elgin L42.
- [x] Testes unitários e de integração do disparo de etiquetas a partir do Hub 360°.

#### US-47.5 & US-47.6: Edição Cadastral no Hub e Suíte E2E Central 360° (Fullstack & QA)
- [x] Modal `EditCustomerModal.tsx` integrado ao Hub 360° para atualização cadastral rápida do cliente (`US-47.6`).
- [x] Suíte Cypress E2E `us47_hub_360_cliente.cy.ts` validando 12 cenários completos (incluindo 1366×768, 1920×1080 e Modo Escuro com tokens M3).

---

## 3. 📐 Padrões Arquiteturais e Diretrizes de Baixo Acoplamento

1. **Factory + Strategy Pattern no Backend (US-46)**: Implementação obrigatória da interface `PartItemCalculator` e da fábrica `PartCalculatorFactory` (seguindo o mesmo padrão de `MaterialCalculatorFactory` em `budgets`). Cada calculadora de material reside em classe individual, prevenindo alterações no mesmo arquivo.
2. **Composição Especializada no Frontend (US-46)**: Os campos de dimensões de cada tipo de insumo residem em subcomponentes isolados (`HardwareItemFields`, `AluminumItemFields`, `GlassAndFilmItemFields`), eliminando condicionais acopladas dentro de `PartSaleItemGrid.tsx`.
3. **Arquitetura Shell + Abas Modulares no Frontend (US-47)**: A página principal `CustomerHubPage.tsx` atua unicamente como shell estrutural, delegando o conteúdo para as abas `CustomerBudgetsTab.tsx` e `CustomerOrdersTab.tsx`, e acionando modais sob demanda.
4. **Cálculo Paramétrico da Ficha Técnica (US-47.3)**: Utilização dos templates paramétricos de esquadrias já existentes no catálogo para determinar cortes e folgas industriais de fábrica.
5. **Venda Comercial sem Bloqueio de Estoque**: A US-46 referencia materiais do catálogo (`tb_materials`). O sistema opera a venda direta e cotação sem bloqueio de estoque.
6. **Qualidade SonarQube & Coverage**: Manter cobertura $\ge 80\%$, zero code smells críticos e complexidade cognitiva controlada ($\le 15$).
