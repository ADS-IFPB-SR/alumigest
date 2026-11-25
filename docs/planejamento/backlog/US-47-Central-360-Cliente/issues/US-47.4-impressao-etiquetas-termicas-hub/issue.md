# [US-47.4] Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.4`
- **Issue GitHub**: `#534`
- **US Pai**: `US-47: Central 360° do Cliente`
- **Release**: Sprint 08
- **Fase**: `Integração de Equipamentos Industriais`
- **User Story**: Como encarregado de expedição, desejo emitir as etiquetas de identificação de esquadrias prontas (para impressora térmica L42) diretamente da Central 360°, sem precisar abrir o módulo fabril, evitando perdas de peças no galpão.
- **Sub-área**: `Integração de Hardware (Frontend/PDF)`
- **Execução Paralela**: ✅ Sim (Integra na UI da US-47.2)
- **Arquivo / Alvo Principal**: Modal de Etiquetas Térmicas, Payload PDF/Raw.
- **Labels Sugeridas**: `feature`, `etiquetas`, `hardware`, `ux`

---

## 🎯 Objetivo & Descrição

Esta tarefa integra a emissão e impressão das etiquetas térmicas adesivas (padrão industrial 100x60 mm, específicas para Elgin L42 ou Zebra) diretamente no Hub 360°. Isso garante que a identificação de clientes, ambientes e medidas seja atrelada instantaneamente à peça física na bancada.

---

## 🛠️ Checklist de Implementação

- [ ] **Ponto de Acesso (UI)**: Acoplar a ação da janela de impressão ao botão "Etiquetas" da aba de Ordens de Serviço (US-47.2).
- [ ] **Modal Interativo**: Desenvolver janela que exibe a pré-visualização fidedigna das etiquetas (100x60 mm) geradas com dados da O.S.
- [ ] **Filtro / Seleção por Peça**: Permitir selecionar itens específicos ou imprimir a Ordem inteira.
- [ ] **Integração de Equipamento**: Desenvolver ponte de comunicação com o serviço de renderização (PDF compilado) apropriado para a Elgin L42.
- [ ] **UX (Estado Isolado)**: Garantir que ao abrir/fechar o modal, a lista de O.S. principal do cliente se mantenha intocada e no mesmo estado (sem recarregamento).

---

## ✅ Critérios de Aceitação

1. Clicar no botão "Etiquetas" de uma O.S. na Central 360° deve abrir a janela de impressão populada com todas as peças físicas daquela ordem.
2. A janela deve permitir visualizar o layout exato das etiquetas em bobina térmica (100x60 mm), com nome do cliente, código, medidas nominais e acabamento.
3. O operador deve conseguir disparar a impressão física direta ou baixar o PDF com as etiquetas do pedido.
4. Fechar a janela de etiquetas deve manter o operador exatamente na mesma posição da Central 360°, preservando o cliente e a ordem ativos.

---

## 🔗 Referências & Documentos Relacionados

- 🏷️ **Protótipo Visual de Etiquetas**: `docs/planejamento/prototipos/prototipo_etiquetas.html`
- 📑 **Especificação Pai**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)