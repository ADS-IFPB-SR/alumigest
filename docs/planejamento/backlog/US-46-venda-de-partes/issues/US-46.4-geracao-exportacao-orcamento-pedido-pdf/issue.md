# [US-46.4] Geração e Exportação do Orçamento em PDF A4

## 🎯 O que esta tarefa faz?

Esta tarefa fecha o ciclo comercial do módulo de partes, permitindo a emissão instantânea do **documento oficial em PDF do orçamento ou pedido de venda de partes avulsas**, formatado no padrão visual profissional da Alumiportas (tamanho A4).

Quando um serralheiro ou cliente solicita uma cotação de materiais avulsos, ele necessita de um comprovante impresso ou arquivo digital com validade formal, identificação da empresa e descrição clara de cada item para conferência e pagamento. Apresentar uma folha confusa com colunas vazias causa má impressão e gera dúvidas no balcão.

Com esta funcionalidade, o vendedor clica no botão "Exportar PDF" e o sistema gera na hora um documento perfeitamente diagramado. Os materiais são automaticamente organizados e agrupados em tabelas separadas por categoria: uma seção exclusiva para Vidros (com medidas e metros quadrados), outra para Perfis de Alumínio (com comprimentos e metros lineares faturados), outra para Ferragens (apenas peças e quantidades) e outra para Películas. Categorias que não foram compradas não poluem o documento. No final, o cliente visualiza o resumo financeiro com eventuais descontos, prazo de validade da proposta e espaço para assinatura.

---

## 📋 O que deve ser entregue?

- [ ] **Documento Comercial Padronizado (A4)**: Geração de documento em PDF com identidade visual da empresa (logotipo, CNPJ, dados de contato e código rastreável da proposta).
- [ ] **Tabelas Agrupadas por Categoria**: Organização inteligente dos itens em seções temáticas (Vidros, Alumínios, Ferragens e Películas), exibindo apenas as colunas relevantes para cada tipo de insumo e ocultando blocos vazios.
- [ ] **Botão de Download Imediato**: Botão na interface com indicador visual de carregamento que inicia o download do arquivo no navegador com apenas um clique.
- [ ] **Garantia de Desempenho e Qualidade**: Documento compilado de forma ultrarrápida (menos de 1,5 segundo), acompanhado de testes automatizados que validam a integridade do arquivo gerado.

---

## ✅ Critérios de Aceitação

1. O acionamento do botão "Exportar PDF" deve iniciar o download automático do documento no computador ou dispositivo do vendedor.
2. O documento deve apresentar cabeçalho corporativo completo, dados do cliente e numeração oficial da proposta.
3. Os itens da proposta devem ser agrupados nas respectivas categorias, omitindo seções que não possuem itens cadastrados.
4. Para itens de ferragens, a tabela não deve conter colunas de medidas em branco, apresentando apenas quantidades inteiras e valores.
5. O tempo total entre o clique do usuário e o início do download deve ser inferior a 1,5 segundo.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-46**: [../../spec.md](../../spec.md)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)
