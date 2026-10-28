# 📌 Sprint 08 — Venda Avulsa de Partes e Central 360° do Cliente

**Período Oficial da Sprint 08**: 27/10/2026 a 09/11/2026  
**Status**: 🟢 Em Andamento / Planejada  
**Product Owner (PO)**: José Guylherme dos Santos Melo  
**Scrum Master**: Maylson da Silva Rodrigues  
**Equipe de Desenvolvimento**: Guilherme Kauã, Italo Jefferson, Joseph Nichollas, Júlio Kennedy, Herbert Carvalho, Gabriel de Souza  
**Escopo Oficial Aprovado**: **US-46** e **US-47**  

Esta pasta contém o pacote de engenharia da **Sprint 08** do projeto **AlumiGest**, decomposto estritamente em **Fatias Verticais (*Thin Vertical Slices*)** funcionais e testáveis de ponta a ponta (BD, Backend, Frontend e QA em cada sub-tarefa), blindadas com padrões de **baixo acoplamento** para eliminar bloqueios e conflitos de merge (*git merge conflicts*) entre desenvolvedores em paralelo:
- **US-46**: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas).
- **US-47**: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas.

---

## 🛡️ Padrões de Desacoplamento e Baixo Acoplamento (Zero Merge Conflicts)

Para permitir que múltiplos desenvolvedores trabalhem simultaneamente em branches separadas sem bloquear uns aos outros e sem gerar conflitos de merge, a Sprint 08 adota 3 padrões arquiteturais obrigatórios:

### 1. Backend US-46: Factory + Strategy Pattern (`PartCalculatorFactory`)
Em vez de um serviço monolítico com `switch/case`, a engine de cálculo segue o padrão já consolidado no projeto em `budgets`:
- **Interface Base**: `PartItemCalculator` com métodos `getMaterialType()` e `calculate(request)`.
- **Factory Injetada pelo Spring**: `PartCalculatorFactory` recebe `List<PartItemCalculator>` e mapeia por `PartMaterialType`.
- **Isolamento de Classes**:
  - `US-46.1` cria apenas `HardwarePartCalculator.java`.
  - `US-46.2` cria apenas `AluminumProfilePartCalculator.java`.
  - `US-46.3` cria apenas `GlassPartCalculator.java` e `FilmPartCalculator.java`.
- *Resultado*: Nenhum desenvolvedor altera o arquivo da calculadora do colega.

### 2. Frontend US-46: Composição de Componentes de Medidas (`ItemFields`)
O grid de itens não contém condicionais monolíticas em JSX:
- `PartSaleItemGrid.tsx` atua apenas como container da tabela e seletor de material.
- Os campos de medidas e badges são delegados para subcomponentes especializados:
  - `HardwareItemFields.tsx` (US-46.1): Renderiza "N/A" e badge `Ferragem (un)`.
  - `AluminumItemFields.tsx` (US-46.2): Renderiza `Comprimento (mm)` e badge `Metro Linear (m)`.
  - `GlassAndFilmItemFields.tsx` (US-46.3): Renderiza `Largura (mm)` $\times$ `Altura (mm)` e badges correspondentes.

### 3. Fullstack US-47: Arquitetura Shell + Abas e Modais Modulares
A página central não concentra tabelas e lógicas de diferentes domínios:
- `CustomerHubPage.tsx` gerencia apenas o layout mestre-detalhe (sidebar + hero com KPIs).
- A aba de orçamentos é isolada em `CustomerBudgetsTab.tsx` (US-47.1).
- A aba de ordens de serviço é isolada em `CustomerOrdersTab.tsx` e `CustomerOrderItemsDrawer.tsx` (US-47.2).
- Os modais são componentes autônomos (`TechnicalSheetModal.tsx` na US-47.3 e `ThermalLabelModal.tsx` na US-47.4).

---

## 🗺️ Mapa de Histórias e Fatiamento Vertical (Sprint Backlog)

### 📦 US-46: Módulo de Venda Avulsa de Partes e Insumos
**Issue GitHub**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477) | **Prioridade**: P1 (Comercial / Venda Direta)  
**Branch Base**: `develop` | **Branch de Feature**: `feat/us-46-venda-de-partes`

| Sub-Task | Issue GitHub | Título da Fatia Vertical | Estratégia de Desacoplamento | Tipo | Status |
|---|:---:|---|---|:---:|:---:|
| **[US-46.1](../backlog/US-46-venda-de-partes/issues/US-46.1-venda-avulsa-ferragens-unidade/issue.md)** | [#527](https://github.com/ADS-IFPB-SR/alumigest/issues/527) | Venda Avulsa de Ferragens por Unidade | Cria interface `PartItemCalculator`, `PartCalculatorFactory`, `HardwarePartCalculator` e `HardwareItemFields.tsx` | Fullstack | 🔵 A Fazer |
| **[US-46.2](../backlog/US-46-venda-de-partes/issues/US-46.2-venda-perfis-aluminio-metro-linear/issue.md)** | [#528](https://github.com/ADS-IFPB-SR/alumigest/issues/528) | Venda de Perfis de Alumínio em Metro Linear | Cria isoladamente `AluminumProfilePartCalculator.java` e `AluminumItemFields.tsx` | Fullstack | 🔵 A Fazer |
| **[US-46.3](../backlog/US-46-venda-de-partes/issues/US-46.3-venda-vidros-peliculas-metro-quadrado/issue.md)** | [#529](https://github.com/ADS-IFPB-SR/alumigest/issues/529) | Venda de Vidros e Películas em m² | Cria isoladamente `GlassPartCalculator.java`, `FilmPartCalculator.java` e `GlassAndFilmItemFields.tsx` | Fullstack | 🔵 A Fazer |
| **[US-46.4](../backlog/US-46-venda-de-partes/issues/US-46.4-geracao-exportacao-orcamento-pedido-pdf/issue.md)** | [#530](https://github.com/ADS-IFPB-SR/alumigest/issues/530) | Emissão e Exportação do Orçamento em PDF A4 | Consome DTOs estáveis e implementa `PartSalePdfService.java` e `PartSalePdfExportButton.tsx` | Fullstack | 🔵 A Fazer |

---

### 📦 US-47: Central 360° do Cliente com Gestão Unificada
**Issue GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496) | **Prioridade**: P1 (Atendimento & Gestão Unificada)  
**Branch Base**: `develop` | **Branch de Feature**: `feat/us-47-painel-360-clientes`

| Sub-Task | Issue GitHub | Título da Fatia Vertical | Estratégia de Desacoplamento | Tipo | Status |
|---|:---:|---|---|:---:|:---:|
| **[US-47.1](../backlog/US-47-painel-360-clientes/issues/US-47.1-hub-base-kpis-gestao-orcamentos-comerciais/issue.md)** | [#531](https://github.com/ADS-IFPB-SR/alumigest/issues/531) | Hub 360° Base, KPIs e Gestão de Orçamentos | Constrói o shell mestre-detalhe e a aba modular `CustomerBudgetsTab.tsx` | Fullstack | 🔵 A Fazer |
| **[US-47.2](../backlog/US-47-painel-360-clientes/issues/US-47.2-gestao-ordens-servico-detalhamento-esquadrias/issue.md)** | [#532](https://github.com/ADS-IFPB-SR/alumigest/issues/532) | Gestão de Ordens de Serviço (O.S.) e Esquadrias | Constrói isoladamente a aba `CustomerOrdersTab.tsx` e o drawer `CustomerOrderItemsDrawer.tsx` | Fullstack | 🔵 A Fazer |
| **[US-47.3](../backlog/US-47-painel-360-clientes/issues/US-47.3-emissao-ficha-tecnica-a4-producao-corte/issue.md)** | [#533](https://github.com/ADS-IFPB-SR/alumigest/issues/533) | Emissão da Ficha Técnica A4 de Produção | Constrói `TechnicalSheetPdfService.java` e o modal isolado `TechnicalSheetModal.tsx` via `orderId` | Fullstack | 🔵 A Fazer |
| **[US-47.4](../backlog/US-47-painel-360-clientes/issues/US-47.4-impressao-etiquetas-termicas-hub-360/issue.md)** | [#534](https://github.com/ADS-IFPB-SR/alumigest/issues/534) | Impressão de Etiquetas Térmicas (100x60mm) no Hub | Pluga o callback da ação ao componente existente `ThermalLabelModal.tsx` sem alterar regras | Fullstack / UI | 🔵 A Fazer |

---

## 🔗 Documentos de Referência

- 📑 **Especificação Funcional da Sprint**: [spec.md](spec.md)
- 📝 **Ata da Reunião de Planejamento**: [ATA-Sprint_08_Planning.md](../../projeto-001/001-atas-reuniao/ATA-Sprint_08_Planning.md)
- 📦 **Especificações Detalhadas do Backlog**:
  - [US-46 — Venda de Partes](../backlog/US-46-venda-de-partes/spec.md)
  - [US-47 — Central 360° do Cliente](../backlog/US-47-painel-360-clientes/spec.md)
