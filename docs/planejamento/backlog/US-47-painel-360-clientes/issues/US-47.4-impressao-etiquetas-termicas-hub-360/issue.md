# [US-47.4] Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub

## 🎯 O que esta tarefa faz?

Esta tarefa integra a emissão e impressão rápida das **etiquetas térmicas adesivas de identificação física de peças** (no formato industrial padrão de $100 \times 60\text{ mm}$ para impressoras térmicas Elgin L42) diretamente na Central 360° do Cliente.

Na fábrica da Alumiportas, cada janela ou porta que sai da linha de montagem e corte precisa receber uma etiqueta adesiva colada no perfil ou no vidro. Essa etiqueta identifica para qual cliente a peça pertence, qual é o número da ordem de serviço, o cômodo da casa a que se destina e suas medidas finais. Sem essa identificação, peças prontas se misturam no depósito da fábrica, causando extravio na hora de carregar o caminhão de entrega ou na instalação na obra.

Com esta funcionalidade, o encarregado de expedição ou vendedor não precisa sair da Central 360° para ir até o módulo fabril para imprimir etiquetas. Basta clicar no botão "🏷️ Etiquetas" ao lado de qualquer ordem de serviço do cliente. A janela de impressão térmica se abre imediatamente com a pré-visualização das etiquetas de todas as peças físicas daquela ordem. O operador pode selecionar peças específicas ou disparar a impressão completa de todas as etiquetas diretamente para a impressora térmica da expedição ou baixar o PDF compilado para impressão posterior.

---

## 📋 O que deve ser entregue?

- [ ] **Acesso Direto à Impressão Térmica**: Botão de ação rápida na tabela de ordens de serviço e no cartão de esquadrias da Central 360° para acionar a emissão de etiquetas.
- [ ] **Visualização e Seleção de Etiquetas por Peça**: Janela interativa exibindo o layout exato das etiquetas em bobina térmica ($100 \times 60\text{ mm}$), permitindo filtrar peças individuais ou imprimir todas as etiquetas do pedido de uma vez.
- [ ] **Integração com Impressora Elgin L42 e Arquivo PDF**: Envio dos dados para impressão física direta no balcão ou download do lote em arquivo PDF.
- [ ] **Testes Automatizados de Navegação**: Garantia de que a abertura e o fechamento da janela de etiquetas ocorram suavemente, mantendo o cliente e a ordem selecionados na tela sem recarregamentos desnecessários.

---

## ✅ Critérios de Aceitação

1. Clicar no botão "Etiquetas" de uma ordem de serviço na Central 360° deve abrir a janela de impressão térmica populada com todas as peças físicas daquela ordem.
2. A janela deve permitir visualizar o layout das etiquetas de $100 \times 60\text{ mm}$ com o nome do cliente, código da ordem, medidas nominais e acabamento.
3. O operador deve conseguir disparar a impressão física direta ou baixar o PDF com as etiquetas do pedido.
4. Fechar a janela de etiquetas deve manter o operador exatamente na mesma posição da Central 360°, preservando o cliente e a ordem ativos.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-47**: [../../spec.md](../../spec.md)
- 🏷️ **Especificação do Módulo de Etiquetas (US-17)**: [../../../US-17-etiquetas-identificacao/spec.md](../../../US-17-etiquetas-identificacao/spec.md)
- 🖥️ **Protótipo Interativo da Central 360° (Ponto de Acesso na O.S.)**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)
- 🏷️ **Protótipo Visual de Impressão de Etiquetas Térmicas**: [prototipo_etiquetas.html](../../../prototipos/prototipo_etiquetas.html)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)
