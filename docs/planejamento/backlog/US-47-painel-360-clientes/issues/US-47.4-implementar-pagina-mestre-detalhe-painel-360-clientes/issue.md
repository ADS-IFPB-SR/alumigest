# [US-47.4] Implementar página `CustomerHubPage` com layout mestre-detalhe, tabelas limpas e modais de Ficha Técnica e Etiquetas

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.4`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Release**: Release 2 (v2.0.0) — Gestão Comercial & Frontend
- **Sub-área**: `Frontend UI / Components`
- **Arquivo / Alvo Principal**: `frontend/src/features/customers/pages/CustomerHubPage.tsx`
- **Labels Sugeridas**: `release-2`, `customer`, `frontend`, `react`, `ui`, `design-system`, `modal`

---

## 🎯 Objetivo & Descrição

Construir e integrar a interface completa da "Central 360° do Cliente" no frontend do AlumiGest, transportando fielmente a arquitetura de layout e componentes validada no protótipo homologado (`painel-clientes-360.html`):
1. **Layout Mestre-Detalhe (Master-Detail)**: Barra lateral esquerda com lista de clientes filtrável e contadores de O.S. (`320px`), e área de trabalho direita com rolagem vertical suave e sem compressão de elementos (`flex-shrink: 0`).
2. **Hero e KPIs do Cliente**: Identificação do cliente com badge de tipo (PF/PJ), dados de contato e cards de KPIs (Total Contratado em R$, Total de O.S., Total de Orçamentos).
3. **Abas e Tabelas Sem Sobreposição**: Alternância instantânea entre as abas "Ordens de Serviço (O.S.)" e "Orçamentos", com tabelas estruturadas com `white-space: nowrap`, destaque visual na linha da O.S. ativa e botões de ação compactos (`📋 Ficha`, `🏷️ Etiquetas`, `📄 PDF`, `📊 Kanban`).
4. **Card de Detalhamento de Esquadrias**: Exibição das medidas nominais em milímetros ($L \times A$ mm), quantidades físicas, acabamentos de cor e vidro, com botões de atalho no cabeçalho.
5. **Modais Integrados**:
   - `TechnicalSheetModal`: Preview e impressão da Ficha Técnica A4 com listas de corte de perfis e deduções de vidro.
   - `ThermalLabelModal`: Preview e impressão calibrada de etiquetas térmicas de 100x60mm para Elgin L42.

---

## 🛠️ Checklist de Implementação

- [ ] Criar os subcomponentes modulares em `frontend/src/features/customers/components/`:
  - `CustomerMasterSidebar.tsx`
  - `CustomerHeroCard.tsx`
  - `CustomerOrdersTable.tsx`
  - `CustomerBudgetsTable.tsx`
  - `CustomerOrderItemsDrawer.tsx`
  - `TechnicalSheetModal.tsx`
  - `ThermalLabelModal.tsx`
- [ ] Implementar a página principal `CustomerHubPage.tsx` integrando o hook `useCustomerHub`
- [ ] Aplicar as diretrizes do AlumiGest Design System (fontes `Hanken Grotesk`, `Inter`, `JetBrains Mono` e tokens canônicos)
- [ ] Garantir que nenhum elemento sofra encolhimento de flexbox (`flex-shrink: 0`) e que as tabelas nunca sejam cortadas verticalmente
- [ ] Conectar os botões de ação aos handlers correspondentes (impressão de ficha técnica, etiquetas térmicas, navegação para novo orçamento e kanban)
- [ ] Validar responsividade em resoluções de desktop (1920x1080, 1366x768 e 1280x720)

---

## ✅ Critérios de Aceitação

1. A tela deve reproduzir fielmente o comportamento validado no protótipo `painel-clientes-360.html`.
2. As tabelas de O.S. e Orçamentos devem exibir todas as colunas com dados íntegros, sem sobreposição nem corte vertical de linhas.
3. O botão "📋 Imprimir Ficha Técnica da O.S." e o botão de etiquetas devem abrir seus respectivos modais com os dados dinâmicos da ordem selecionada.
4. Ao trocar de cliente, a interface deve atualizar instantaneamente todos os KPIs, tabelas e detalhamento de esquadrias.
5. A compilação frontend (`npm run build`) deve passar com 0 erros.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 🖥️ **Protótipo Homologado**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)
- 🪝 **Hook de Dados**: [US-47.3](../US-47.3-criar-hook-e-cliente-api-customers-hub/issue.md)
