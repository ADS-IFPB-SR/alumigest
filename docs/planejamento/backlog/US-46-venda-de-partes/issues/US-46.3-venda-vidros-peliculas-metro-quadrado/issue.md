# [US-46.3] Venda de Vidros e Películas em m² com Área Mínima

## 🎯 O que esta tarefa faz?

Esta tarefa implementa o módulo de cálculo dimensional e venda avulsa de **chapas de vidro sob medida** (temperado, laminado, comum ou impresso) e **películas de proteção solar/térmica** comercializadas por metro quadrado ($m^2$).

No comércio de vidros e películas, duas regras comerciais da indústria vidreira são fundamentais:
1. **Fração Mínima Faturável**: Mesmo que um cliente queira um vidro muito pequeno (por exemplo, um basculante de $30 \times 40\text{ cm}$, que mede apenas $0,12\text{ m}^2$), as têmperas e distribuidoras cobram uma área mínima de faturamento por peça (comumente $0,25\text{ m}^2$) para cobrir o custo de corte, lapidação de borda e forno de têmpera. Se a oficina vender abaixo desse mínimo, terá prejuízo.
2. **Perdas de Bobina em Películas**: Películas são desenroladas de bobinas com larguras padronizadas. Quando o cliente compra uma medida customizada, sobram tiras inutilizáveis que devem ter sua perda incorporada.

Com esta funcionalidade, o vendedor seleciona o vidro ou película, digita a largura e a altura em milímetros e a quantidade de peças. O sistema calcula automaticamente a área em metros quadrados. Se a peça for menor que o mínimo comercial, o sistema ajusta o faturamento automaticamente para a área mínima da oficina ($0,25\text{ m}^2$). Se o vendedor digitar uma medida que ultrapasse o tamanho de uma chapa ou bobina padrão, o campo ganha destaque em vermelho na hora, avisando o erro antes que a venda seja concluída.

---

## 📋 O que deve ser entregue?

- [ ] **Mecanismo de Cálculo de Área com Fração Mínima**: Regra de cálculo que converte milímetros em metros quadrados ($L \times A / 1.000.000$) e aplica a regra de proteção de margem com piso mínimo de $0,25\text{ m}^2$ por peça de vidro.
- [ ] **Cálculo de Películas com Perda de Bobina**: Apuração precisa da metragem quadrada de película com taxa de perda configurável.
- [ ] **Campos de Largura e Altura com Alerta Visual**: Entrada de dados dimensional responsiva que valida instantaneamente se os valores informados são válidos ao sair do campo, destacando erros em vermelho.
- [ ] **Travas de Segurança Operacional**: Bloqueio de medidas que excedam a capacidade física das chapas de vidro ou das bobinas cadastradas.

---

## ✅ Critérios de Aceitação

1. Ao selecionar vidro ou película, a interface deve exibir obrigatoriamente os campos de largura e altura em milímetros e as respectivas etiquetas visuais de identificação.
2. Para peças de vidro cuja área real calculada seja inferior a $0,25\text{ m}^2$, o sistema deve garantir que o faturamento respeite o piso mínimo de $0,25\text{ m}^2$.
3. Para peças maiores que o piso mínimo, o cálculo deve faturar a área real proporcional em metros quadrados multiplicada pela quantidade e pelo valor unitário.
4. Para películas, o sistema deve aplicar o fator de perda de corte sobre a metragem apurada.
5. Inserir dimensões zeradas ou que ultrapassem os limites físicos da matéria-prima deve exibir alertas visuais imediatos e bloquear a aprovação da venda.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-46**: [../../spec.md](../../spec.md)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)
