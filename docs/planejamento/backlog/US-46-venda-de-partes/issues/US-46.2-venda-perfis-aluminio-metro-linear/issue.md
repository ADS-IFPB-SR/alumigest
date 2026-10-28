# [US-46.2] Venda de Perfis de Alumínio em Metro Linear

## 🎯 O que esta tarefa faz?

Esta tarefa expande o módulo de venda de partes para permitir o orçamento e a venda direta de **perfis e barras de alumínio por metro linear ou peças cortadas** (por exemplo, perfis em U, tubos retangulares, cantoneiras ou perfis da Linha Suprema).

Na serralheria, o alumínio é comprado em barras industriais longas (geralmente de 6 metros), mas na venda direta aos clientes e profissionais parceiros, as pessoas costumam pedir pedaços cortados em tamanhos específicos para reformas ou fabricações próprias (ex.: 3 barras cortadas em 2,5 metros). Além disso, cada corte na serra gera pequenas sobras e desperdício de material que precisam ser precificados de forma justa.

Com esta funcionalidade, ao escolher um perfil de alumínio no formulário, a tela se adapta automaticamente: o campo de largura é ocultado e surge o campo de "Comprimento em milímetros", acompanhado de uma etiqueta visual indicando "Metro Linear (m)". O vendedor digita o comprimento desejado e a quantidade de peças, e o sistema faz a conversão matemática exata para metros, aplicando a margem de perda de corte e calculando o preço final em tempo real, sem que o vendedor precise fazer contas manuais na calculadora de bolso.

---

## 📋 O que deve ser entregue?

- [ ] **Mecanismo de Conversão e Perda de Alumínio**: Lógica no servidor que transforma o comprimento informado em milímetros para metros lineares faturáveis, aplicando a taxa de perda de corte configurada sobre o preço por metro.
- [ ] **Campos Específicos para Perfis de Alumínio**: Adaptação visual da tela para exibir apenas o campo de comprimento e a quantidade de barras/peças, com identificador visual em tom âmbar indicando a cobrança por metro.
- [ ] **Exibição Imediata da Metragem Faturada**: Apresentação clara para o vendedor da quantidade física de barras e da metragem total em metros que está sendo cobrada na proposta.
- [ ] **Validações e Testes Automatizados**: Proteção para impedir comprimentos zerados ou medidas que ultrapassem o tamanho padrão de uma barra inteira.

---

## ✅ Critérios de Aceitação

1. Ao selecionar um perfil de alumínio, a linha do item deve apresentar apenas o campo de comprimento (em milímetros) e quantidade de barras, desabilitando a largura.
2. A tela deve exibir a etiqueta visual indicativa de cobrança em metro linear.
3. O sistema deve converter automaticamente o comprimento informado para metros e adicionar a perda de corte cadastrada.
4. O valor total da cotação deve ser recalculado e atualizado na hora em que o comprimento ou a quantidade forem digitados.
5. Inserções de comprimentos inválidos ou fora dos padrões das barras industriais devem emitir alertas e impedir o avanço da venda.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-46**: [../../spec.md](../../spec.md)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)
