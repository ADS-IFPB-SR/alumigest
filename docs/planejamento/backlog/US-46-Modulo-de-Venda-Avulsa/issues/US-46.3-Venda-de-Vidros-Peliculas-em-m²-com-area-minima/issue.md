# [US-46.3] Venda de Vidros e Películas em m² com Área Mínima

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.3`
- **Issue GitHub**: `#529`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes`
- **Release**: Sprint 08
- **Fase**: `Desenvolvimento Comercial / Core`
- **User Story**: Como vendedor, desejo faturar vidros aplicando a tarifa mínima da indústria e vender películas contabilizando a quebra de bobina.
- **Sub-área**: `Backend & Frontend`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `GlassPartCalculator.java`, `FilmPartCalculator.java`, `GlassItemFields.tsx`
- **Labels Sugeridas**: `feature`, `backend`, `frontend`, `venda-avulsa`, `rn-02`

---

## 🎯 Objetivo & Descrição

Implementar o módulo de cálculo dimensional e precificação automática para a venda avulsa de chapas de vidro sob medida e películas de proteção solar por $m^2$. O foco principal é a proteção de margem com o estabelecimento matemático da regra do piso mínimo e perdas de bobina.

### Contexto da Fase / Épico
Duas regras são vitais para a saúde da oficina: (1) **Piso Mínimo (RN-02)**, onde peças de vidro com menos de $0,25\text{ m}^2$ cobram o equivalente a essa metragem para cobrir custos de forno e (2) **Fator de Bobina**, onde películas geram sobras laterais que precisam ser faturadas no orçamento.

---

## 🛠️ Checklist de Implementação

- [ ] **Especialista de Vidros (`GlassPartCalculator`)**: Implementar cálculo de área física ($L \times A$) e forçar `Área Faturável = max(Área Física, 0.25)`.
- [ ] **Especialista de Películas (`FilmPartCalculator`)**: Implementar percentual de perda (`lossFactor`) e validação de limite físico de largura máxima da bobina.
- [ ] **Componente Vidro (`GlassItemFields.tsx`)**: Implementar inputs de $mm$, badge ciano de m² e warning visual de atuação do piso mínimo de $0,25\text{ m}^2$.
- [ ] **Componente Película (`FilmItemFields.tsx`)**: Implementar inputs, badge esmeralda e mensagens de excesso de largura de rolo.
- [ ] Conectar os componentes no hook unificado de UI `PartSaleForm.tsx`.
- [ ] **Testes Unitários**: Validar as restrições matemáticas extremas (peças muito pequenas vs. peças enormes) no backend.

---

## ✅ Critérios de Aceitação

1. Ao selecionar a categoria Vidro, a interface exibe os campos de Largura e Altura em milímetros com badge ciano identificador.
2. Peças de vidro com área inferior a $0,25\text{ m}^2$ devem ser faturadas automaticamente pela fração mínima de $0,25\text{ m}^2$, exibindo etiqueta informativa de proteção de piso.
3. Peças de vidro com área igual ou superior a $0,25\text{ m}^2$ devem ser faturadas pela metragem real proporcional.
4. Para películas, o cálculo da metragem faturável deve aplicar o percentual de perda configurado sobre a área geométrica.
5. Inserir medidas zeradas ou que excedam as dimensões máximas físicas da matéria-prima deve emitir alerta visual imediato e bloquear a inserção no pedido.

---

## 🔗 Referências & Documentos Relacionados

- 🎨 **Protótipo Canônico**: `.prototipos/telas/prot_tipo_vendas_vidra_aria.html`
- 📑 **Especificação Pai**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)