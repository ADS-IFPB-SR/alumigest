# 🗺️ Tabela De-Para / Mapeamento de User Stories — AlumiGest

Este documento é a **referência oficial de sincronização** entre a numeração antiga das User Stories (utilizada pelo Product Owner e nas branches legadas) e a numeração atualizada após os reajustes de escopo das Sprints 06, 07, 08 e 11.

> 💡 **Como usar**: Para qualquer alteração futura ou comunicação com o PO, consulte esta tabela para correlacionar imediatamente a **US Antiga (PO)** com a **US Atual (Planejamento)** e a **Issue no GitHub Remoto**.

---

## 📊 Tabela Geral Consolidada (De-Para)

| US Antiga (PO / Branches) | US Atual (Planejamento) | Sprint | Escopo / Título da História | Issue GitHub | Status / Ação |
| :---: | :---: | :---: | :--- | :---: | :---: |
| **US-01** | **US-01** | Sprint 01 | Configurar Infraestrutura Monorepo, Docker e Governança do Projeto | [#122](https://github.com/ADS-IFPB-SR/alumigest/issues/122) | 🟢 Concluída |
| **US-02** | **US-02** | Sprint 02 | Gerenciar Catálogo de Materiais Genérico (Vidros, Perfis, Ferragens) | [#123](https://github.com/ADS-IFPB-SR/alumigest/issues/123) | 🟢 Concluída |
| **US-03** | **US-03** | Sprint 02 | Gerenciar Produtos e Fichas Técnicas de Esquadrias | [#124](https://github.com/ADS-IFPB-SR/alumigest/issues/124) | 🟢 Concluída |
| **US-04** | **US-04** | Sprint 03 | Gerenciar Clientes PF e PJ | [#125](https://github.com/ADS-IFPB-SR/alumigest/issues/125) | 🟢 Concluída |
| **US-05** | **US-05** | Sprint 03 | Refatorar Produtos com Templates Paramétricos de Esquadrias | [#126](https://github.com/ADS-IFPB-SR/alumigest/issues/126) | 🟢 Concluída |
| **US-06** | **US-06** | Sprint 03 | Criar e Gerenciar Orçamentos de Venda | [#127](https://github.com/ADS-IFPB-SR/alumigest/issues/127) | 🟢 Concluída |
| **US-07** | **US-07** | Sprint 03 | Motor de Cálculo Físico e Precificação de Orçamentos | [#128](https://github.com/ADS-IFPB-SR/alumigest/issues/128) | 🟢 Concluída |
| **US-08** | **US-08** | Sprint 03 | Pipeline CI/CD com SonarQube e Testes E2E Cypress | [#129](https://github.com/ADS-IFPB-SR/alumigest/issues/129) | 🟢 Concluída |
| **US-09** | **US-09** | Sprint 04 | Aplicar Descontos e Condições Comerciais no Orçamento | [#133](https://github.com/ADS-IFPB-SR/alumigest/issues/133) | 🔵 Planejada |
| **US-10** | **US-10** | Sprint 04 | Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp | [#134](https://github.com/ADS-IFPB-SR/alumigest/issues/134) | 🔵 Planejada |
| **US-11** | **US-11** | Sprint 04 | Emitir Orçamento em PDF - Via Técnica de Oficina | [#135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) | 🔵 Planejada |
| **US-12** | **US-12** | Sprint 04 | Homologação Integrada e Validação da Release 1 (v1.0.0) | [#136](https://github.com/ADS-IFPB-SR/alumigest/issues/136) | 🔵 Planejada |
| **US-13** | **US-13** | Sprint 05 | Aprovar Orçamento e Converter em Pedido de Venda | [#137](https://github.com/ADS-IFPB-SR/alumigest/issues/137) | 🔵 Planejada |
| **US-14** | **US-14** | Sprint 05 | Snapshot Imutável e Lock de Preços do Pedido | [#138](https://github.com/ADS-IFPB-SR/alumigest/issues/138) | 🔵 Planejada |
| **US-15** | **US-15** | Sprint 05 | Gestão de Status, Prazos e Cancelamento de Pedidos | [#139](https://github.com/ADS-IFPB-SR/alumigest/issues/139) | 🔵 Planejada |
| **US-16** | **US-16** | Sprint 05 | Emissão do Comprovante do Pedido de Venda | [#140](https://github.com/ADS-IFPB-SR/alumigest/issues/140) | 🔵 Planejada |
| **US-17** | ❌ **DESCARTADA** | Sprint 06 | Gerar Ordens de Produção (OP) Individuais por Peça | — | 🚫 Removida do Escopo |
| **US-18** | **US-17** | Sprint 06 | Emitir Etiquetas de Identificação de Peças por Item do Pedido | [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142) | 🔄 Adaptada (Sem QR Code) |
| **US-19** | ❌ **DESCARTADA** | Sprint 06 | Atualizar Status de Produção via Scanner de QR Code | — | 🚫 Removida do Escopo |
| **US-20** | **US-18** | Sprint 06 | Acompanhar Produção via Painel Kanban de Pedidos de Venda | [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143) | 🔄 Adaptada (Foco em Orders) |
| **US-21** | **US-19** | Sprint 07 | Consolidar Lista Linear e Plana de Corte do Pedido | [#144](https://github.com/ADS-IFPB-SR/alumigest/issues/144) | 🔄 Renumerada (-2) |
| **US-22** | **US-20** | Sprint 07 | Gerar Ficha Técnica de Montagem por Item do Pedido | [#145](https://github.com/ADS-IFPB-SR/alumigest/issues/145) | 🔄 Renumerada (-2) |
| **US-23** | ❌ **DESCARTADA** | Sprint 07 | Emitir Romaneio de Oficina em PDF com Checklist de Conferência | — | 🚫 Removida do Escopo |
| **US-24** | **US-21** | Sprint 08 | Reservar e Baixar Matéria-Prima no Estoque Automaticamente | [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146) | 🔄 Renumerada (-3) |
| **US-25** | ❌ **DESCARTADA** | Sprint 08 | Apontar Perdas, Quebras e Descarte de Sucata | — | 🚫 Removida do Escopo |
| **US-26** | **US-22** | Sprint 08 | Consultar Posição de Estoque e Kardex de Movimentações | [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147) | 🔄 Renumerada (-4) |
| **US-27** | **US-23** | Sprint 08 | Homologação Integrada e Validação da Release 2 (v2.0.0) | [#148](https://github.com/ADS-IFPB-SR/alumigest/issues/148) | 🔄 Renumerada (-4) |
| **US-28** | **US-24** | Sprint 09 | Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola | [#149](https://github.com/ADS-IFPB-SR/alumigest/issues/149) | 🔄 Renumerada (-4) |
| **US-29** | **US-25** | Sprint 09 | Confirmar Pagamento PIX via Webhook com Liberação Automática | [#150](https://github.com/ADS-IFPB-SR/alumigest/issues/150) | 🔄 Renumerada (-4) |
| **US-30** | **US-26** | Sprint 09 | Modal PIX Interativo no Frontend e Histórico de Transações | [#151](https://github.com/ADS-IFPB-SR/alumigest/issues/151) | 🔄 Renumerada (-4) |
| **US-31** | **US-27** | Sprint 10 | Desdobrar e Gerenciar Parcelamento de Pedidos | [#152](https://github.com/ADS-IFPB-SR/alumigest/issues/152) | 🔄 Renumerada (-4) |
| **US-32** | **US-28** | Sprint 10 | Controlar Contas a Receber, Vencimentos e Inadimplência | [#153](https://github.com/ADS-IFPB-SR/alumigest/issues/153) | 🔄 Renumerada (-4) |
| **US-33** | **US-29** | Sprint 10 | Emitir Extrato Financeiro do Cliente e Recibo de Quitação | [#154](https://github.com/ADS-IFPB-SR/alumigest/issues/154) | 🔄 Renumerada (-4) |
| **US-34** | ❌ **DESCARTADA** | Sprint 11 | Realizar Baixa Financeira Manual com Parciais, Juros e Descontos | — | 🚫 Removida do Escopo |
| **US-35** | **US-30** | Sprint 11 | Acompanhar Fluxo de Caixa Mensal | [#155](https://github.com/ADS-IFPB-SR/alumigest/issues/155) | 🔄 Adaptada (Apenas Mensal, -5) |
| **US-36** | ❌ **DESCARTADA** | Sprint 11 | Emitir Relatório de Fechamento de Caixa Diário em PDF | — | 🚫 Removida do Escopo |
| **US-37** | **US-31** | Sprint 12 | Agendar Instalação e Gerar Ordem de Serviço (OS) | *Backlog* | 🔄 Renumerada (-6) |
| **US-38** | **US-32** | Sprint 12 | Executar e Concluir OS em Campo com Registro Fotográfico (PWA) | *Backlog* | 🔄 Renumerada (-6) |
| **US-39** | **US-33** | Sprint 12 | Visualizar Calendário de Instalações e Prevenção de Conflitos | *Backlog* | 🔄 Renumerada (-6) |
| **US-40** | **US-34** | Sprint 12 | Emitir Ordem de Serviço (OS) em PDF | *Backlog* | 🔄 Renumerada (-6) |
| **US-41** | **US-35** | Sprint 13 | Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais | *Backlog* | 🔄 Renumerada (-6) |
| **US-42** | **US-36** | Sprint 13 | Apurar DRE Gerencial (Competência e Caixa) | *Backlog* | 🔄 Renumerada (-6) |
| **US-43** | **US-37** | Sprint 13 | Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel | *Backlog* | 🔄 Renumerada (-6) |
| **US-44** | **US-38** | Sprint 14 | Instalar PWA e Consultar Pedidos e OS Offline via IndexedDB | *Backlog* | 🔄 Renumerada (-6) |
| **US-45** | **US-39** | Sprint 14 | Sincronizar Fila de Alterações e Fotos em Segundo Plano | *Backlog* | 🔄 Renumerada (-6) |
| **US-46** | **US-40** | Sprint 14 | Comprimir Imagens no Dispositivo e Otimizar Performance Web | *Backlog* | 🔄 Renumerada (-6) |
| **US-47** | **US-41** | Sprint 15 | Executar Carga Inicial de Dados e Importador de Clientes via CSV | *Backlog* | 🔄 Renumerada (-6) |
| **US-48** | **US-42** | Sprint 15 | Homologação Integrada Ponta a Ponta da Release 3 (v3.0.0) | *Backlog* | 🔄 Renumerada (-6) |
| **US-49** | **US-43** | Sprint 15 | Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda | *Backlog* | 🔄 Renumerada (-6) |
| **US-50** | **US-44** | Sprint 16 | Executar Rotinas de Backup Automático e Disaster Recovery | *Backlog* | 🔄 Renumerada (-6) |
| **US-51** | **US-45** | Sprint 16 | Registrar Trilha de Auditoria Imutável para Ações Críticas | *Backlog* | 🔄 Renumerada (-6) |
| **US-52** | **US-46** | Sprint 16 | Monitorar Saúde do Sistema com Actuator e Publicar Documentação | *Backlog* | 🔄 Renumerada (-6) |

---

## 📌 Resumo da Regra de Conversão por Bloco

- **Sprints 01 a 05 (`US-01` a `US-16`)**: Sem alteração (`US-X` = `US-X`).
- **Sprint 06**:
  - Antiga `US-17` (OPs) e Antiga `US-19` (Scanner QR): **Descartadas**.
  - Antiga `US-18` (Etiquetas): virou **`US-17`** ([#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)).
  - Antiga `US-20` (Kanban): virou **`US-18`** ([#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)).
- **Sprint 07**:
  - Antiga `US-21` (Lista de Corte): virou **`US-19`** ([#144](https://github.com/ADS-IFPB-SR/alumigest/issues/144), `-2`).
  - Antiga `US-22` (Ficha de Montagem): virou **`US-20`** ([#145](https://github.com/ADS-IFPB-SR/alumigest/issues/145), `-2`).
  - Antiga `US-23` (Romaneio Oficina em PDF): **Descartada**.
- **Sprint 08**:
  - Antiga `US-24` (Reserva e Baixa de Estoque): virou **`US-21`** ([#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146), `-3`).
  - Antiga `US-25` (Perdas e Sucata): **Descartada**.
  - Antiga `US-26` (Posição e Kardex): virou **`US-22`** ([#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147), `-4`).
  - Antiga `US-27` (Homologação Release 2): virou **`US-23`** ([#148](https://github.com/ADS-IFPB-SR/alumigest/issues/148), `-4`).
- **Sprint 09 (`US-28` a `US-30` antigas)**:
  - Deslocamento contínuo em **`-4`**: **`US-24`** ([#149](https://github.com/ADS-IFPB-SR/alumigest/issues/149)), **`US-25`** ([#150](https://github.com/ADS-IFPB-SR/alumigest/issues/150)), **`US-26`** ([#151](https://github.com/ADS-IFPB-SR/alumigest/issues/151)).
- **Sprint 10 (`US-31` a `US-33` antigas)**:
  - Deslocamento contínuo em **`-4`**: **`US-27`** ([#152](https://github.com/ADS-IFPB-SR/alumigest/issues/152)), **`US-28`** ([#153](https://github.com/ADS-IFPB-SR/alumigest/issues/153)), **`US-29`** ([#154](https://github.com/ADS-IFPB-SR/alumigest/issues/154)).
- **Sprint 11**:
  - Antiga `US-34` (Baixa Manual): **Descartada**.
  - Antiga `US-35` (Fluxo de Caixa): virou **`US-30`** ([#155](https://github.com/ADS-IFPB-SR/alumigest/issues/155), `-5`) adaptada para **apenas Fluxo Mensal**.
  - Antiga `US-36` (Fechamento Diário PDF): **Descartada**.
- **Sprints 12 a 16 (`US-37` a `US-52` antigas)**:
  - Todas deslocadas em **`-6`**: `US_Nova = US_Antiga - 6` (totalizando até a **`US-46`**).
