# 📑 Especificação Funcional Integrada — Sprint 08

**Período Oficial da Sprint 08**: 27/10/2026 a 09/11/2026  
**Histórias de Usuário Contempladas**:
- **US-46**: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas) — Issue [#171](https://github.com/ADS-IFPB-SR/alumigest/issues/171)
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
- [ ] Criação da modelagem relacional base `tb_part_sales` e `tb_part_sale_items` com vínculo à tabela de catálogo `tb_materials` (operando comercialmente sem bloqueio de estoque enquanto o módulo de estoque não é implantado).
- [ ] Implementação de cálculo por unidade inteira (`quantity` $\times$ `sale_price`) sem exigência de dimensões físicas ($L \times A$ = null) através de `HardwarePartCalculator implements PartItemCalculator`.
- [ ] Interface de nova cotação (`/vendas/partes/nova`) com subcomponente modular `HardwareItemFields.tsx` (campos de medidas com rótulo "N/A" e badge roxo `Ferragem (un)`).
- [ ] Testes unitários de cálculo, testes MockMvc da API de criação/status e testes Vitest do formulário.

#### US-46.2: Venda de Perfis de Alumínio em Metro Linear (Fullstack)
- [ ] Criação isolada da classe `AluminumProfilePartCalculator implements PartItemCalculator` apurando comprimento nominal em metros ($\text{mm} / 1000 \times \text{qtd}$) com fator de perda parametrizável.
- [ ] Criação isolada do subcomponente `AluminumItemFields.tsx` com input `Comprimento (mm)` e badge âmbar `Metro Linear (m)`.
- [ ] Testes unitários com fator de perda e testes de interface com reatividade via TanStack Query.

#### US-46.3: Venda de Vidros e Películas em m² com Fração Mínima (Fullstack)
- [ ] Criação isolada de `GlassPartCalculator` e `FilmPartCalculator` apurando área faturável em m² ($L \times A / 1.000.000$), com aplicação da fração mínima de $0,25\text{ m}^2$ para vidros e perdas de corte para películas.
- [ ] Validações dimensionais de limites físicos de chapas/bobinas retornando HTTP 422 em caso de extrapolação.
- [ ] Criação isolada de `GlassAndFilmItemFields.tsx` com campos `Largura (mm)` e `Altura (mm)`, badges ciano `Vidro` e esmeralda `Película (m²)`, com validação visual no evento `onBlur`.
- [ ] Testes unitários e de integração de cálculo de frações mínimas e limites operacionais.

#### US-46.4: Emissão e Exportação do Orçamento/Pedido em PDF A4 (Fullstack)
- [ ] Serviço de geração gráfica vetorial `PartSalePdfService` (OpenPDF) com tabelas agrupadas pelas 4 categorias (`VIDROS`, `ALUMÍNIOS`, `FERRAGENS` e `PELÍCULAS`), omitindo seções vazias.
- [ ] Endpoint `GET /api/v1/part-sales/{id}/pdf` com cabeçalhos de anexo para download direto.
- [ ] Componente `PartSalePdfExportButton` no frontend com feedback visual e tratamento de blob stream.
- [ ] Testes automatizados de geração binária do PDF com as 4 categorias populadas.

---

### 📦 US-47 — Central 360° do Cliente (Fatiamento por Capacidade Funcional)

#### US-47.1: Hub 360° Base, KPIs e Gestão de Orçamentos (Fullstack)
- [ ] Endpoints CQRS de leitura otimizada: `GET /api/v1/customers/{id}/dashboard` (KPIs consolidados) e `GET /api/v1/customers/{id}/budgets`.
- [ ] Layout mestre-detalhe shell `CustomerHubPage.tsx`: barra lateral filtrável `CustomerMasterSidebar.tsx`, Hero com dados cadastrais e cards de KPI `CustomerHeroCard.tsx`.
- [ ] Aba isolada `CustomerBudgetsTab.tsx` com tabela não comprimida (`flex-shrink: 0`), link de envio via WhatsApp e download do PDF comercial existente.
- [ ] Hook `useCustomerHub` com TanStack Query e testes unitários/integrados backend (`MockMvc`) e frontend (`Vitest`).

#### US-47.2: Gestão de Ordens de Serviço (O.S.) e Esquadrias (Fullstack)
- [ ] Endpoint `GET /api/v1/customers/{id}/orders` trazendo ordens de serviço ativas com situação fabril, valor total e itens de esquadrias com medidas nominais ($L \times A$ mm).
- [ ] Aba isolada `CustomerOrdersTab.tsx` com seleção da linha ativa e gaveta/card de esquadrias detalhadas (`CustomerOrderItemsDrawer.tsx`).
- [ ] Testes de serialização de esquadrias e testes de renderização da tabela de ordens de serviço.

#### US-47.3: Emissão da Ficha Técnica A4 de Produção com Lista de Corte (Fullstack)
- [ ] Serviço `TechnicalSheetPdfService` (OpenPDF) calculando lista de corte de perfis ($45^\circ / 90^\circ$ e comprimentos em mm) e folgas de vidros com base nos templates paramétricos do catálogo (Linha Suprema / Linha 25).
- [ ] Endpoint `GET /api/v1/orders/{orderId}/technical-sheet.pdf` no controlador de produção.
- [ ] Modal interativo autônomo `TechnicalSheetModal.tsx` acionado via prop de callback.
- [ ] Testes de cálculo de folgas e geração de bytes do PDF A4.

#### US-47.4: Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub (Fullstack / UI)
- [ ] Conexão direta da ação "🏷️ Etiquetas" da O.S. ao modal existente `ThermalLabelModal` (US-17), repassando identificador do pedido e esquadrias para disparo na impressora Elgin L42.
- [ ] Testes unitários e de integração do disparo de etiquetas a partir do Hub 360°.

---

## 3. 📐 Padrões Arquiteturais e Diretrizes de Baixo Acoplamento

1. **Factory + Strategy Pattern no Backend (US-46)**: Implementação obrigatória da interface `PartItemCalculator` e da fábrica `PartCalculatorFactory` (seguindo o mesmo padrão de `MaterialCalculatorFactory` em `budgets`). Cada calculadora de material reside em classe individual, prevenindo alterações no mesmo arquivo.
2. **Composição Especializada no Frontend (US-46)**: Os campos de dimensões de cada tipo de insumo residem em subcomponentes isolados (`HardwareItemFields`, `AluminumItemFields`, `GlassAndFilmItemFields`), eliminando condicionais acopladas dentro de `PartSaleItemGrid.tsx`.
3. **Arquitetura Shell + Abas Modulares no Frontend (US-47)**: A página principal `CustomerHubPage.tsx` atua unicamente como shell estrutural, delegando o conteúdo para as abas `CustomerBudgetsTab.tsx` e `CustomerOrdersTab.tsx`, e acionando modais sob demanda.
4. **Cálculo Paramétrico da Ficha Técnica (US-47.3)**: Utilização dos templates paramétricos de esquadrias já existentes no catálogo para determinar cortes e folgas industriais de fábrica.
5. **Venda Comercial sem Bloqueio de Estoque**: A US-46 referencia materiais do catálogo (`tb_materials`). O sistema opera a venda direta e cotação sem bloqueio de estoque.
6. **Qualidade SonarQube & Coverage**: Manter cobertura $\ge 80\%$, zero code smells críticos e complexidade cognitiva controlada ($\le 15$).
