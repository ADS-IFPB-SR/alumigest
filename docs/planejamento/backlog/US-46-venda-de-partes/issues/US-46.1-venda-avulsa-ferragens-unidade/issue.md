# [US-46.1] Venda Avulsa de Ferragens por Unidade

## 🎯 O que esta tarefa faz?

Esta tarefa disponibiliza a primeira experiência funcional completa para a venda direta de insumos avulsos no AlumiGest, focando especificamente no comércio de **ferragens por unidade** (como roldanas para portas de correr, fechaduras, puxadores avulsos e braços de articulação).

Na prática do dia a dia da Alumiportas, serralheiros parceiros e clientes finais frequentemente vão à oficina apenas para comprar uma peça de reposição ou ferragens extras, sem adquirir uma janela ou porta completa. Hoje, o sistema exige orçar uma esquadria inteira para registrar qualquer material. 

Com esta entrega, o consultor comercial ganha uma nova tela simples e ágil de venda de partes. Nela, o vendedor seleciona o cliente, escolhe a ferragem desejada diretamente no catálogo de materiais da empresa, digita a quantidade inteira necessária (ex.: 10 roldanas) e vê o valor total ser calculado na hora. O sistema entende automaticamente que ferragens são vendidas por peça e não necessitam de medidas físicas de largura ou altura, desabilitando esses campos para evitar confusão ou digitação errada. O vendedor pode salvar a cotação como rascunho ou aprová-la comercialmente, gerando uma proposta formal imediata.

---

## 📋 O que deve ser entregue?

- [ ] **Estrutura de Armazenamento**: Base de dados para registrar orçamentos de partes avulsas e seus respectivos itens, vinculando-os com segurança ao cliente e aos materiais do catálogo da empresa, permitindo a venda imediata sem travas de estoque.
- [ ] **Mecanismo de Precificação de Ferragens**: Regra no servidor que apura o valor total multiplicando a quantidade inteira pelo preço unitário cadastrado, desconsiderando dimensões de corte.
- [ ] **Tela de Nova Venda de Partes**: Tela com visual limpo e moderno onde o vendedor adiciona itens, visualiza a indicação visual de "Unidade" e acompanha o subtotal em um cartão flutuante sempre visível.
- [ ] **Blindagem de Qualidade**: Conjunto completo de testes automatizados garantindo que cálculos com valores válidos funcionem com precisão e que quantidades inválidas (zero ou negativas) sejam barradas com alertas claros.

---

## ✅ Critérios de Aceitação

1. O vendedor deve conseguir criar uma cotação selecionando uma ou mais ferragens do catálogo e informando apenas as quantidades desejadas.
2. Ao selecionar uma ferragem, a interface deve indicar claramente a cobrança por unidade e desabilitar os campos de largura e altura.
3. O valor total do item e o valor consolidado da proposta devem ser calculados instantaneamente ao alterar a quantidade.
4. A proposta deve ser gravada no sistema associada ao cliente selecionado, podendo ser salva como rascunho ou aprovada.
5. Tentativas de informar quantidades zeradas ou negativas devem exibir alertas amigáveis e bloquear a finalização da venda.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-46**: [../../spec.md](../../spec.md)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)
