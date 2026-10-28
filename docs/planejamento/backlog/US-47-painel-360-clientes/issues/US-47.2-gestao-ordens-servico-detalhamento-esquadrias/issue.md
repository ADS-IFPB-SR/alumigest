# [US-47.2] Gestão de Ordens de Serviço (O.S.) e Detalhamento de Esquadrias

## 🎯 O que esta tarefa faz?

Esta tarefa expande a Central 360° do Cliente para a esfera da **gestão fabril e acompanhamento de produção**, permitindo que vendedores e encarregados da oficina visualizem todas as Ordens de Serviço (O.S.) do cliente selecionado e inspecionem as esquadrias físicas que compõem cada pedido.

Quando um cliente liga para a Alumiportas ou comparece à fábrica para saber o andamento de suas janelas ou portas, a equipe precisa responder em poucos segundos: qual é o estágio de fabricação (se está aguardando corte, em produção ou pronta para entrega), quais foram as medidas contratadas e as cores e vidros escolhidos. Se a tela apresentar textos cortados, botões espremidos ou exigir abrir cada pedido individualmente, o atendimento se torna confuso e lento.

Com esta entrega, a Central 360° ganha uma segunda aba dedicada às **Ordens de Serviço (O.S.)**. A tabela foi desenhada para manter todas as colunas visíveis sem compressão ou cortes visuais, com etiquetas coloridas indicando o status fabril (Criado, Aguardando Produção, Em Produção, Concluído ou Cancelado). Ao clicar em uma linha da tabela, a ordem é destacada e surge logo abaixo um cartão detalhado exibindo cada esquadria física do pedido: o modelo da peça, a quantidade, o acabamento do alumínio, o tipo de vidro e uma etiqueta destacada com as medidas em milímetros (ex.: `📐 350 x 1470 mm`). Dali mesmo, o operador tem botões diretos para imprimir a ficha técnica ou emitir etiquetas para a oficina.

---

## 📋 O que deve ser entregue?

- [ ] **Histórico Fabril de Ordens do Cliente**: Consulta no servidor que recupera todas as ordens de serviço vinculadas ao cliente selecionado, incluindo dados da ordem e a relação completa de esquadrias e medidas.
- [ ] **Aba de Ordens de Serviço sem Cortes Visuais**: Tabela limpa e responsiva que exibe datas, situação fabril, valores e quantidade de peças sem espremer informações ou quebrar linhas de forma feia.
- [ ] **Cartão de Inspeção de Esquadrias e Medidas**: Painel contextual que se abre ao selecionar uma ordem, apresentando cada janela, porta ou portão com suas medidas nominais em milímetros, acabamentos e especificações técnicas.
- [ ] **Indicadores Visuais de Status**: Badges coloridos intuitivos para cada estágio da produção da fábrica.
- [ ] **Testes Automatizados**: Cobertura de testes garantindo que pedidos de um cliente sejam recuperados na ordem cronológica correta e que todas as medidas físicas apareçam intactas na interface.

---

## ✅ Critérios de Aceitação

1. Ao acessar a aba "Ordens de Serviço (O.S.)", o sistema deve exibir todas as ordens vinculadas ao cliente selecionado, ordenadas das mais recentes para as mais antigas.
2. Todas as informações das colunas (código, data, status, valor, esquadrias e ações) devem permanecer legíveis e sem cortes em diferentes resoluções de tela.
3. Clicar sobre uma ordem de serviço deve destacar a linha selecionada e carregar suas esquadrias físicas no cartão inferior.
4. O cartão de esquadrias deve apresentar as medidas nominais de cada peça em milímetros (largura x altura), o tipo de vidro e a cor do alumínio.
5. Cada ordem deve disponibilizar botões de ação rápida para Ficha Técnica e Etiquetas.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-47**: [../../spec.md](../../spec.md)
- 🖥️ **Protótipo Interativo da Central 360° (Aba O.S. e Cartão de Esquadrias)**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)
