# Especificação Funcional: US-47 — Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas

**Identificador**: `US-47`  
**Issue GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)  
**Status**: 🔵 No Backlog (Planejada para Release 2 — Gestão Comercial & Fábrica)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como vendedor, operador comercial ou encarregado de produção da Alumiportas, desejo uma interface integrada "Central 360° do Cliente" em layout mestre-detalhe limpo e contínuo, onde ao selecionar um cliente eu visualize instantaneamente todos os seus orçamentos vinculados, todas as suas Ordens de Serviço (O.S.) e os itens físicos/esquadrias da O.S. ativa com suas medidas nominais em milímetros ($L \times A$ mm), podendo acionar diretamente dali a impressão de etiquetas térmicas (100x60mm Elgin L42), a emissão da Ficha Técnica de Produção (A4), o download de comprovantes PDF e a abertura do fluxo de produção no Kanban, eliminando a fragmentação entre módulos e acelerando o atendimento e a expedição.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Seleção de Cliente e Carregamento Automático do Hub 360°**
  - **Dado que** o usuário visualiza a lista lateral de clientes com busca dinâmica por nome, documento, fone ou bairro,
  - **Quando** clica sobre o cliente "Antônio Alfredo Figueiredo",
  - **Então** o cliente recebe destaque visual imediato (`active`) na lista,
  - **E** o painel de trabalho à direita exibe o Hero com dados cadastrais e botões de ação rápida (WhatsApp, Novo Orçamento),
  - **E** os cards de KPI exibem: Total Contratado (R$), Quantidade de Ordens de Serviço e Quantidade de Propostas/Orçamentos.

- [ ] **Cenário 2: Visualização de Ordens de Serviço e Alternância de Abas Sem Cortes**
  - **Dado que** o cliente possui Ordens de Serviço cadastradas,
  - **Quando** a aba "Ordens de Serviço (O.S.)" estiver ativa,
  - **Então** a tabela exibe colunas padronizadas (`Código O.S.`, `Data`, `Situação Fabril`, `Valor Total`, `Esquadrias`, `Ações Diretas`),
  - **E** todas as linhas mantêm visibilidade integral (sem encolhimento flex ou corte vertical de texto),
  - **E** quando o usuário alternar para a aba "Orçamentos", a tabela de propostas comerciais é apresentada com opções para baixar proposta PDF e enviar via WhatsApp.

- [ ] **Cenário 3: Inspeção Detalhada de Esquadrias e Medidas Nominais ($L \times A$ mm)**
  - **Dado que** o usuário clica sobre uma O.S. específica (ex: `#OS-2026-0615`),
  - **Quando** o card de esquadrias for renderizado logo abaixo da tabela,
  - **Então** apresenta cada peça da esquadria com título, quantidade física (`un`), acabamento de cor, especificação do vidro e etiqueta com medidas nominais em milímetros (ex: `📐 350 x 1470 mm`),
  - **E** exibe botões contextuais no cabeçalho para "Imprimir Ficha Técnica da O.S." e "Imprimir Etiquetas Desta O.S. (100x60mm)".

- [ ] **Cenário 4: Emissão da Ficha Técnica de Produção Fabril (Formato A4)**
  - **Dado que** o usuário clica na ação "Ficha Técnica" da O.S.,
  - **Quando** o modal `techSheetModal` for aberto,
  - **Então** exibe o documento técnico padronizado com cabeçalho institucional da Alumiportas, identificação da O.S., cliente e situação,
  - **E** lista detalhadamente a lista de corte de perfis de alumínio (marco superior/inferior, marco lateral, folhas móveis) com comprimentos em mm e graus de corte ($45^\circ / 90^\circ$),
  - **E** lista a especificação de vidros e deduções de folgas de fábrica conforme norma ABNT NBR 10821,
  - **E** permite o download em PDF e envio direto para a impressora A4 da oficina.

- [ ] **Cenário 5: Impressão de Etiquetas Térmicas (100x60mm Elgin L42) Direta do Hub**
  - **Dado que** o usuário aciona o botão "Etiquetas" de uma O.S. no painel do cliente,
  - **Quando** o modal de etiquetas térmicas for exibido,
  - **Então** o canvas de visualização renderiza o layout idêntico à bobina térmica de 100x60mm com medidas em destaque e especificações técnicas,
  - **E** permite o disparo de impressão direta para o spooler USB Elgin L42 ou download do arquivo PDF compilado.

- [ ] **Cenário 6: Disparo de Novo Orçamento com Cliente Pré-selecionado**
  - **Dado que** o cliente está selecionado na tela 360°,
  - **Quando** o operador clica no botão "➕ Novo Orçamento",
  - **Então** o sistema navega para o Wizard de Orçamentos com o identificador do cliente já preenchido e travado no formulário.

---

## 📋 Regras de Negócio e Restrições (SOLID & Clean Architecture)

- **RN-01 (Segregação Estrita de Responsabilidades - SRP/SOLID):** O frontend atua exclusivamente como camada de renderização e interação do usuário. Nenhuma regra de negócio de cálculo de plano de corte, dedução de folgas de vidro ou validação de status de produção reside no frontend. O backend é a única fonte da verdade e expõe os dados através de endpoints CQRS.
- **RN-02 (Projeções Otimizadas de Leitura - CQRS):** Para alimentar o Hub 360°, o backend disponibiliza projeções DTO leves (`CustomerDashboardDto`, `CustomerOrderSummaryDto`, `CustomerBudgetSummaryDto`), evitando carregar grafos pesados de entidades JPA.
- **RN-03 (Imutabilidade do Plano de Corte e Ficha Técnica):** A Ficha Técnica de Produção da O.S. reflete os parâmetros congelados do pedido no momento de sua aprovação, garantindo que alterações cadastrais posteriores não modifiquem medidas já enviadas ao chão de fábrica.
- **RN-04 (Design System AlumiGest):** O layout deve seguir rigorosamente as diretrizes visuais do AlumiGest: tipografia canônica (`Hanken Grotesk` para títulos, `Inter` para corpo e `JetBrains Mono` para medidas e códigos), paleta azul profundo (`#041632`) com azul vibrante (`#2563eb`), espaçamentos modulares e cards sem poluição visual.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / OpenPDF / PostgreSQL)
- **Endpoints CQRS de Leitura:**
  - `GET /api/v1/customers/{id}/dashboard`: Resumo consolidado de KPIs do cliente.
  - `GET /api/v1/customers/{id}/orders`: Histórico de ordens de serviço com status e itens.
  - `GET /api/v1/customers/{id}/budgets`: Histórico de orçamentos e propostas comerciais.
- **Endpoints de Documentos e Mídia:**
  - `GET /api/v1/orders/{orderId}/technical-sheet.pdf`: Documento PDF da Ficha Técnica A4 de Produção com listas de corte e folgas.
  - `GET /api/v1/orders/{orderId}/labels-pdf`: Documento PDF das etiquetas térmicas 100x60mm.
  - `GET /api/v1/orders/{orderId}/receipt.pdf`: Comprovante formal do pedido para o cliente.
- **Services:**
  - `CustomerHubService`: Agregação e orquestração de leituras otimizadas.
  - `TechnicalSheetPdfService`: Compilação de listas de corte e layout PDF A4.

### Frontend (React 19 / TypeScript / TanStack Query / CSS Canônico)
- **Componentes:**
  - `CustomerHubPage.tsx`: Layout mestre-detalhe com lista lateral e workspace.
  - `CustomerMasterSidebar.tsx`: Lista de clientes com busca instantânea.
  - `CustomerHeroCard.tsx`: Card de identificação com CTAs e KPIs.
  - `CustomerOrdersTable.tsx`: Tabela de O.S. sem sobreposição com ações integradas.
  - `CustomerBudgetsTable.tsx`: Tabela de orçamentos e propostas.
  - `CustomerOrderItemsDrawer.tsx`: Painel de esquadrias e medidas nominais.
  - `TechnicalSheetModal.tsx`: Modal interativo da Ficha Técnica de Produção.
  - `ThermalLabelModal.tsx`: Modal de etiquetas térmicas calibrado para Elgin L42.

---

## 🛡️ Definition of Done (DoD)

- [ ] Endpoints documentados com Swagger / OpenAPI v3 com schemas de resposta estritos;
- [ ] Testes unitários com cobertura $\ge 80\%$ em backend (`MockMvc`) e frontend (`Vitest`);
- [ ] Layout 100% responsivo e testado sem qualquer corte vertical ou sobreposição de linhas;
- [ ] Geração da Ficha Técnica em PDF A4 validada com listas de corte e cálculo de folgas;
- [ ] Geração e impressão de etiquetas térmicas (100x60mm) testadas via modal e download PDF;
- [ ] SonarQube Quality Gate verde sem bugs, vulnerabilidades ou violações de regras arquiteturais.

---

## 🧩 Fatias Verticais de Entrega (Escopo Técnico Previsto)

A história será desdobrada em subtarefas técnicas no momento de sua alocação na Sprint correspondente, contemplando:
1. **Backend CQRS**: Endpoints de leitura agregada (`GET /api/v1/customers/{id}/dashboard`, `GET /orders`, `GET /budgets`);
2. **Ficha Técnica A4**: Serviço `TechnicalSheetPdfService` com listas de corte de perfis e cálculo de folgas industriais de vidro;
3. **Frontend Hub**: Componente `CustomerHubPage` com layout mestre-detalhe, Hero com KPIs, tabelas responsivas e card de esquadrias;
4. **Integração de Mídia**: Emissão de etiquetas térmicas (100x60mm Elgin L42) e comprovantes PDF;
5. **Qualidade & Testes**: Suíte de testes unitários e de integração (`MockMvc` e `Vitest`) com cobertura $\ge 80\%$.

---

**Branch de Referência:** `planejamento`  
**Protótipo Homologado:** `docs/planejamento/prototipos/painel-clientes-360.html`
