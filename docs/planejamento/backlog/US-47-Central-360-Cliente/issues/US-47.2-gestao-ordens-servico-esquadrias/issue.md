# [US-47.2] Gestão de Ordens de Serviço (O.S.) e Detalhamento de Esquadrias

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.2`
- **Issue GitHub**: `#532`
- **US Pai**: `US-47: Central 360° do Cliente`
- **Release**: Sprint 08
- **Fase**: `Desenvolvimento Fabril e Acompanhamento`
- **User Story**: Como vendedor/encarregado, desejo visualizar a tabela de O.S. de um cliente sem cortes de tela e inspecionar os itens físicos (esquadrias) com suas medidas nominais para oferecer um acompanhamento ágil da produção.
- **Sub-área**: `Frontend (React) & Backend (Projeções)`
- **Execução Paralela**: ✅ Sim (Requer finalização do Hub Base US-47.1)
- **Arquivo / Alvo Principal**: Tabela O.S., Drawer de Esquadrias, DTOs de Pedido
- **Labels Sugeridas**: `feature`, `frontend`, `ux`, `ordens-servico`

---

## 🎯 Objetivo & Descrição

Esta tarefa expande a Central 360° adicionando uma aba dedicada ao acompanhamento fabril das Ordens de Serviço (O.S.). A tabela foi projetada para garantir que as informações (status fabril, esquadrias e medidas em mm) sejam exibidas de forma não destrutiva e sem "espremer" colunas, independentemente da resolução de tela.

### Contexto da Fase / Épico
Resolver o problema de atendimento demorado (ex: cliente liga pedindo status do portão de 1470mm) fornecendo uma interface de expansão contextual imediata que mostra cada peça contratada daquela Ordem.

---

## 🛠️ Checklist de Implementação

- [ ] **Histórico Fabril (Backend)**: Desenvolver consulta otimizada para buscar as O.S. do cliente vinculadas à relação completa de esquadrias e medidas.
- [ ] **Aba de O.S. (Frontend)**: Construir tabela responsiva (sem cortes em 1366x768 ou 1920x1080) listando datas, situação fabril e valores.
- [ ] **Indicadores Visuais**: Implementar badges coloridos para status (Criado, Aguardando Produção, Em Produção, Concluído, Cancelado).
- [ ] **Cartão de Inspeção (Drawer/Panel)**: Desenvolver painel contextual exibindo as medidas nominais (📐 L x A mm), acabamentos, vidro e quantidades de cada peça da O.S. selecionada.
- [ ] **Ações Fabris**: Disponibilizar botões rápidos para `Ficha Técnica` e `Etiquetas`.
- [ ] **Testes Automatizados**: Cobrir cronologia de ordens e validação de resolução no Cypress.

---

## ✅ Critérios de Aceitação

1. Ao acessar a aba "Ordens de Serviço (O.S.)", o sistema deve exibir todas as ordens vinculadas ao cliente selecionado, das mais recentes para as mais antigas.
2. Todas as informações das colunas (código, data, status, valor, esquadrias, ações) devem permanecer legíveis e sem cortes em diferentes resoluções.
3. Clicar sobre uma ordem de serviço deve destacar a linha selecionada e carregar suas esquadrias físicas no cartão inferior.
4. O cartão de esquadrias deve apresentar as medidas nominais em milímetros (L x A), tipo de vidro e cor do alumínio.
5. Cada ordem deve disponibilizar botões de ação rápida para Ficha Técnica e Etiquetas.

---

## 🔗 Referências & Documentos Relacionados

- 🖥️ **Protótipo Interativo (Aba O.S.)**: `docs/planejamento/prototipos/painel-clientes-360.html`
- 📑 **Especificação Técnica**: `technical-spec.md` (Mesmo diretório)
- 📑 **Especificação Pai**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)