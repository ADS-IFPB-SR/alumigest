# Especificação Funcional: US-47 — Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas

**Identificador**: `US-47`  
**Issue GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)  
**Status**: 🔵 Planejada para Sprint 08 (Release 2 — Gestão Comercial & Fábrica)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como vendedor, operador comercial ou encarregado de produção da Alumiportas, desejo uma interface integrada "Central 360° do Cliente" em layout mestre-detalhe limpo e contínuo, onde ao selecionar um cliente eu visualize instantaneamente todos os seus orçamentos vinculados, todas as suas Ordens de Serviço (O.S.) e os itens físicos/esquadrias da O.S. ativa com suas medidas nominais em milímetros ($L \times A$ mm), podendo acionar diretamente dali a impressão de etiquetas térmicas (100x60mm Elgin L42), a emissão da Ficha Técnica de Produção (A4), o download de comprovantes PDF e a abertura do fluxo de produção no Kanban, eliminando a fragmentação entre módulos e acelerando o atendimento e a expedição.

---

## 🏗️ Estrutura de Decomposição Vertical (*Thin Vertical Slices*)

As sub-tarefas da US-47 foram decompostas em **fatias verticais autônomas por capacidade funcional de negócio**. Cada fatia corta todas as camadas técnicas (banco de dados, endpoints CQRS, componentes de interface e testes automatizados), garantindo que os desenvolvedores entreguem valor ponta a ponta sem bloqueios ou dependências em cascata:

| Código US | Título da Fatia Vertical | Foco Funcional | Entregáveis Fullstack |
|:---:|---|:---:|---|
| **`US-47.1`** | Hub 360° Base, KPIs e Gestão de Orçamentos | Navegação 360° & Propostas | Endpoints CQRS (`GET /dashboard`, `GET /budgets`), layout mestre-detalhe lateral, busca instantânea, Hero com KPIs, aba "Orçamentos" com atalhos e testes MockMvc/Vitest |
| **`US-47.2`** | Gestão de Ordens de Serviço (O.S.) e Esquadrias | Gestão Fabril & Peças | Endpoint `GET /orders` com medidas nominais ($L \times A$ mm), aba de O.S. sem sobreposição flexbox, gaveta/card de esquadrias e testes |
| **`US-47.3`** | Emissão da Ficha Técnica A4 de Produção | Ficha Técnica com Lista de Corte | `TechnicalSheetPdfService` (OpenPDF) com cortes ($45^\circ/90^\circ$) e folgas baseadas nas regras paramétricas do catálogo, modal interativo na Central 360° e testes |
| **`US-47.4`** | Impressão de Etiquetas Térmicas (100x60mm) no Hub | Identificação Física de Peças | Integração direta do botão "🏷️ Etiquetas" da O.S. com o `ThermalLabelModal` (US-17), repassando dados para a impressora térmica Elgin L42 e testes |

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

### US-47.1: Hub 360° Base, KPIs e Gestão de Orçamentos (Fullstack)

- [ ] **Cenário 1: Seleção de Cliente e Carregamento Instantâneo dos KPIs**
  - **Dado que** o operador visualiza a lista lateral de clientes com busca dinâmica por nome, documento ou telefone (`CustomerMasterSidebar`),
  - **Quando** clica sobre um cliente específico (ex: "Antônio Alfredo Figueiredo"),
  - **Então** o cliente recebe destaque ativo imediato,
  - **E** o backend responde `GET /api/v1/customers/{id}/dashboard` com KPIs calculados (Total Contratado, Quantidade de O.S. e Quantidade de Orçamentos),
  - **E** o card Hero exibe os dados cadastrais e botões de ação rápida (WhatsApp, Novo Orçamento).

- [ ] **Cenário 2: Visualização de Orçamentos Comerciais e Ações Rápidas**
  - **Dado que** o cliente está selecionado e a aba "Orçamentos" está ativa,
  - **Quando** a tabela de orçamentos é renderizada (`CustomerBudgetsTable`),
  - **Então** exibe código da proposta, data, validade, valor total e status comercial,
  - **E** disponibiliza botões compactos para download do PDF da proposta e disparo de mensagem comercial no WhatsApp com link da cotação.

- [ ] **Cenário 3: Navegação para Novo Orçamento com Cliente Travado**
  - **Dado que** o cliente está selecionado na tela 360°,
  - **Quando** o operador clica no botão "➕ Novo Orçamento",
  - **Então** o sistema navega para o Wizard de Orçamentos com o identificador do cliente pré-preenchido e bloqueado para edição.

---

### US-47.2: Gestão de Ordens de Serviço (O.S.) e Esquadrias (Fullstack)

- [ ] **Cenário 4: Listagem de Ordens de Serviço Sem Compressão Visual**
  - **Dado que** o cliente possui ordens de serviço ativas ou concluídas,
  - **Quando** a aba "Ordens de Serviço (O.S.)" é ativada (`CustomerOrdersTable`),
  - **Então** a tabela apresenta colunas padronizadas (`Código O.S.`, `Data`, `Situação Fabril`, `Valor Total`, `Esquadrias`, `Ações Diretas`),
  - **E** todas as linhas mantêm visibilidade integral com `flex-shrink: 0` e `white-space: nowrap` (sem cortes verticais nem sobreposição).

- [ ] **Cenário 5: Inspeção Detalhada de Esquadrias e Medidas Nominais ($L \times A$ mm)**
  - **Dado que** o usuário clica sobre uma O.S. específica na tabela,
  - **Quando** a linha é destacada como ativa,
  - **Então** o componente `CustomerOrderItemsDrawer` renderiza os itens da esquadria com nome da tipologia, quantidade (`un`), acabamento de cor, especificação do vidro e badge com medidas nominais em milímetros (ex: `📐 350 x 1470 mm`),
  - **E** exibe os atalhos de cabeçalho "📋 Ficha Técnica" e "🏷️ Etiquetas Térmicas".

---

### US-47.3: Emissão da Ficha Técnica A4 de Produção com Lista de Corte (Fullstack)

- [ ] **Cenário 6: Cálculo Paramétrico e Compilação da Ficha Técnica A4**
  - **Dado que** uma O.S. possui itens de esquadrias com templates cadastrados no catálogo (ex.: Linha Suprema / Linha 25),
  - **Quando** o endpoint `GET /api/v1/orders/{orderId}/technical-sheet.pdf` é chamado,
  - **Então** o backend executa as fórmulas paramétricas de corte apurando os comprimentos exatos de corte dos perfis (marco superior/inferior, lateral, folhas móveis) com ângulos ($45^\circ / 90^\circ$) e deduções de folgas de vidros (norma ABNT NBR 10821),
  - **E** retorna o documento PDF A4 diagramado vetorialmente em tempo inferior a $1,5\text{ segundo}$.

- [ ] **Cenário 7: Visualização e Impressão via Modal na Central 360°**
  - **Dado que** o usuário clica na ação "📋 Ficha Técnica" de uma ordem de serviço,
  - **Quando** o modal `TechnicalSheetModal` é aberto,
  - **Então** exibe a visualização limpa do documento técnico com cabeçalho institucional Alumiportas, lista de corte de perfis, vidros e ferragens,
  - **E** disponibiliza botões para impressão direta e download do PDF compilado.

---

### US-47.4: Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub (Fullstack / UI)

- [ ] **Cenário 8: Acionamento Contextual do Modal de Etiquetas Elgin L42**
  - **Dado que** o operador clica no botão "🏷️ Etiquetas" de uma O.S. na Central 360°,
  - **Quando** a ação é disparada,
  - **Então** o sistema abre diretamente o componente `ThermalLabelModal` (reutilizado da US-17),
  - **E** repassa o contexto da ordem de serviço com todas as peças físicas identificadas, permitindo a impressão direta para impressora térmica de 100x60mm (Elgin L42) ou download em lote de PDF.

---

## 📋 Regras de Negócio e Restrições (SOLID & Clean Architecture)

- **RN-01 (Segregação Estrita de Responsabilidades - SRP/SOLID):** O frontend atua exclusivamente como camada de renderização e interação do usuário. Nenhuma regra de negócio de plano de corte, dedução de folgas de vidro ou apuração de KPIs reside no cliente; toda computação é provida pelo backend.
- **RN-02 (Projeções Otimizadas de Leitura - CQRS):** Para alimentar o Hub 360°, o backend expõe DTOs Records imutáveis (`CustomerDashboardDto`, `CustomerOrderSummaryDto`, `CustomerBudgetSummaryDto`), evitando over-fetching de grafos pesados de entidades JPA.
- **RN-03 (Imutabilidade do Plano de Corte e Ficha Técnica):** A Ficha Técnica reflete os parâmetros congelados do pedido no momento de sua aprovação, blindando as medidas de fabricação contra alterações cadastrais posteriores no catálogo.
- **RN-04 (Design System AlumiGest):** Tipografia oficial (`Hanken Grotesk` para títulos, `Inter` para texto corrido e `JetBrains Mono` para medidas e códigos), paleta azul profundo (`#041632`) com azul vibrante (`#2563eb`), espaçamentos modulares e cards sem poluição visual.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / OpenPDF / PostgreSQL)
- **Endpoints CQRS de Leitura:**
  - `GET /api/v1/customers/{id}/dashboard`: Indicadores consolidados de KPIs do cliente.
  - `GET /api/v1/customers/{id}/orders`: Histórico de ordens de serviço com status e itens nominais.
  - `GET /api/v1/customers/{id}/budgets`: Histórico de orçamentos e propostas comerciais.
- **Endpoints de Documentos e Mídia:**
  - `GET /api/v1/orders/{orderId}/technical-sheet.pdf`: Ficha Técnica A4 com listas de corte e folgas de montagem.
- **Services:**
  - `CustomerHubService`: Leitura e orquestração de KPIs.
  - `TechnicalSheetPdfService`: Compilação da Ficha Técnica A4 com base nas fórmulas paramétricas do catálogo.

### Frontend (React 19 / TypeScript / TanStack Query / Tailwind CSS)
- **Componentes:**
  - `CustomerHubPage.tsx`: Layout mestre-detalhe principal.
  - `CustomerMasterSidebar.tsx`: Lista de clientes com filtro instantâneo.
  - `CustomerHeroCard.tsx`: Card de identificação com CTAs e KPIs.
  - `CustomerOrdersTable.tsx`: Tabela de O.S. sem sobreposição flexbox.
  - `CustomerBudgetsTable.tsx`: Tabela de orçamentos e propostas comerciais.
  - `CustomerOrderItemsDrawer.tsx`: Card de esquadrias e medidas nominais.
  - `TechnicalSheetModal.tsx`: Modal interativo da Ficha Técnica de Produção.
  - Reutilização do `ThermalLabelModal.tsx` da US-17.

---

## 🛡️ Definition of Done (DoD)

- [ ] **Testes por Fatia Vertical:** Cada sub-tarefa possui seus testes automatizados unitários e de integração (`MockMvc` no backend e `Vitest` no frontend) com cobertura $\ge 80\%$.
- [ ] **Layout Responsivo:** Homologação sem sobreposição visual ou corte de linhas conforme protótipo `painel-clientes-360.html`.
- [ ] **Performance de Documentos:** Geração e streaming do PDF da Ficha Técnica inferior a $1,5\text{ segundo}$.
- [ ] **SonarQube Quality Gate:** Aprovação com 0 bugs, 0 vulnerabilidades e complexidade controlada.
- [ ] **Branch de Desenvolvimento:** `feat/us-47-painel-360-clientes`.

---

## 📋 Sub-Tarefas / Fatias Verticais Vinculadas (4 fatias)

| Sub-Task | Issue GitHub | Tarefa / Descrição | Tipo | Status |
|---|:---:|---|:---:|:---:|
| [US-47.1](issues/US-47.1-hub-base-kpis-gestao-orcamentos-comerciais/issue.md) | [#531](https://github.com/ADS-IFPB-SR/alumigest/issues/531) | Hub 360° Base, KPIs e Gestão de Orçamentos (Fullstack) | Fullstack | 🔲 No Backlog |
| [US-47.2](issues/US-47.2-gestao-ordens-servico-detalhamento-esquadrias/issue.md) | [#532](https://github.com/ADS-IFPB-SR/alumigest/issues/532) | Gestão de Ordens de Serviço (O.S.) e Detalhamento de Esquadrias (Fullstack) | Fullstack | 🔲 No Backlog |
| [US-47.3](issues/US-47.3-emissao-ficha-tecnica-a4-producao-corte/issue.md) | [#533](https://github.com/ADS-IFPB-SR/alumigest/issues/533) | Emissão da Ficha Técnica A4 de Produção com Lista de Corte (Fullstack) | Fullstack | 🔲 No Backlog |
| [US-47.4](issues/US-47.4-impressao-etiquetas-termicas-hub-360/issue.md) | [#534](https://github.com/ADS-IFPB-SR/alumigest/issues/534) | Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub (Fullstack / UI) | Fullstack / UI | 🔲 No Backlog |

---

## 🔗 Referências & Governança

- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
- 🖥️ **Protótipo Interativo da Central 360°**: [../../prototipos/painel-clientes-360.html](../../prototipos/painel-clientes-360.html)
- 🏷️ **Protótipo de Impressão Térmica de Etiquetas (US-17)**: [../../prototipos/prototipo_etiquetas.html](../../prototipos/prototipo_etiquetas.html)
- 📊 **Protótipo do Kanban de Produção (US-18)**: [../../prototipos/prototipo_kambam.html](../../prototipos/prototipo_kambam.html)
- 🏷️ **Especificação de Etiquetas Térmicas (US-17)**: [../US-17-etiquetas-identificacao/spec.md](../US-17-etiquetas-identificacao/spec.md)
