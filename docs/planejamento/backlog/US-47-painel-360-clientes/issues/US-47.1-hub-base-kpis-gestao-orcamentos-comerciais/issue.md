# [US-47.1] Hub 360° Base, KPIs e Gestão de Orçamentos

## 🎯 O que esta tarefa faz?

Esta tarefa entrega a base estrutural e comercial da **Central 360° do Cliente**, criando uma experiência unificada onde o vendedor ou operador comercial pode enxergar toda a vida comercial de um cliente em uma única tela contínua, sem precisar pular entre diferentes menus do sistema.

Atualmente, para consultar o histórico de um cliente, o atendente precisa abrir a tela de clientes, depois ir para a listagem geral de orçamentos, filtrar o nome manualmente, localizar propostas antigas e abrir outra tela para checar pedidos. Isso gera lentidão durante o atendimento presencial ou telefônico e prejudica o fechamento de novas vendas.

Com esta funcionalidade, a Central 360° é dividida em duas áreas integradas (layout mestre-detalhe):
1. **À esquerda (Barra Lateral)**: O operador conta com uma lista de clientes sempre visível com busca instantânea por nome, documento (CPF/CNPJ) ou telefone. Clicar em um cliente atualiza toda a tela na hora.
2. **À direita (Área de Trabalho)**: No topo, um painel de destaque exibe a identificação do cliente, seus canais de contato, botões rápidos (abrir conversa no WhatsApp ou criar novo orçamento com o cliente já travado) e três cartões com os números mais importantes: o valor total já contratado pelo cliente, quantas ordens de serviço ele já teve e quantos orçamentos foram emitidos. Logo abaixo, a aba "Orçamentos" lista todas as propostas comerciais do cliente, com valor, status, data de validade e botões rápidos para baixar o PDF ou reenviar a proposta por WhatsApp.

---

## 📋 O que deve ser entregue?

- [ ] **Visão Consolidada de Indicadores**: Apuração no servidor dos números estratégicos do cliente (total faturado, quantidade de ordens e quantidade de propostas) e histórico de orçamentos vinculados.
- [ ] **Layout Mestre-Detalhe da Central 360°**: Tela principal organizada e elegante com barra lateral de pesquisa rápida e área de trabalho expansiva.
- [ ] **Cartão de Destaque com Atalhos Rápidos**: Bloco superior com dados cadastrais do cliente, botão de contato imediato via WhatsApp e atalho para iniciar uma nova venda com o cliente já selecionado.
- [ ] **Aba de Propostas Comerciais**: Tabela limpa e responsiva listando todas as cotações do cliente com ações diretas para download do PDF e compartilhamento.
- [ ] **Testes Automatizados**: Blindagem de testes garantindo que clientes existentes exibam os totais calculados corretamente e que a busca lateral funcione com agilidade.

---

## ✅ Critérios de Aceitação

1. Ao selecionar um cliente na lista lateral, o painel de trabalho deve carregar instantaneamente seus dados cadastrais, seus indicadores de faturamento e sua lista de orçamentos.
2. A barra lateral deve permitir filtrar clientes por nome, CPF/CNPJ ou telefone, destacando visualmente o cliente ativo.
3. A aba "Orçamentos" deve exibir a listagem completa de propostas com valores formatados e botões funcionais para download de PDF e link de WhatsApp.
4. O botão "➕ Novo Orçamento" deve direcionar o vendedor para o formulário de orçamentos com o cliente já pré-preenchido e bloqueado para troca acidental.
5. Selecionar um identificador de cliente inexistente deve apresentar mensagem informativa sem quebrar a tela.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-47**: [../../spec.md](../../spec.md)
- 🖥️ **Protótipo Interativo da Central 360° (Mestre-Detalhe e Aba Orçamentos)**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)
