# [US-46.1] Venda Avulsa de Ferragens por Unidade

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.1`
- **Issue GitHub**: `#527`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes`
- **Release**: Sprint 08
- **Fase**: `Desenvolvimento Comercial / Core`
- **User Story**: Como vendedor, desejo orçar e vender ferragens avulsas por unidade inteira para reposição rápida, sem necessidade de medidas complexas.
- **Sub-área**: `Backend & Frontend`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `HardwarePartCalculator.java`, `HardwareItemFields.tsx`
- **Labels Sugeridas**: `feature`, `backend`, `frontend`, `venda-avulsa`

---

## 🎯 Objetivo & Descrição

Implementar o módulo de orçamento e venda direta de ferragens avulsas por unidade inteira (roldanas, fechaduras, puxadores, braços de articulação e kits de fixação). A entrega foca na estratégia de precificação por peça e no fluxo de persistência/aprovação da venda de partes avulsas utilizando a infraestrutura da US-46.

### Contexto da Fase / Épico
Na rotina da oficina Alumiportas, serralheiros parceiros e clientes finais frequentemente solicitam a compra de ferragens rápidas, sem encomendar uma janela completa. O sistema deve calcular matematicamente o preço desconsiderando fatores de perda de corte ($L \times A$).

---

## 🛠️ Checklist de Implementação

- [ ] **Especialista no Backend (`HardwarePartCalculator`)**: Implementar a interface `PartItemCalculator` para `MaterialCategoryType.HARDWARE`.
- [ ] Aplicar arredondamento monetário bancário (`RoundingMode.HALF_EVEN`).
- [ ] **Persistência Comercial**: Salvar a proposta e seus itens nas tabelas `tb_part_sales` e `tb_part_sale_items`.
- [ ] Garantir o congelamento dos valores (imutabilidade de tabela pós-aprovação - RN-03).
- [ ] **Componente Frontend (`HardwareItemFields.tsx`)**: Criar componente com campo de quantidade inteira, preço unitário, e ocultar inputs de largura e altura.
- [ ] Renderizar Badge visual indicando Unidade (un) em tom roxo.
- [ ] **Testes Automatizados**: Criar testes unitários para a classe especialista, integração para persistência e validação visual de frontend.

---

## ✅ Critérios de Aceitação

1. Ao selecionar a categoria "Ferragem (Unidade)", a interface deve exibir apenas o campo de quantidade de peças e preço, desabilitando/ocultando dimensões de largura e altura.
2. A interface deve exibir a etiqueta indicativa de cobrança por unidade `Unidade (un)`.
3. O valor total do item deve ser calculado instantaneamente ao alterar a quantidade ou preço unitário.
4. O sistema deve permitir salvar a proposta avulsa no banco de dados vinculada ao cliente, congelando os preços unitários no momento do salvamento.
5. Tentativas de submissão com quantidade igual ou inferior a zero devem exibir alerta visual imediato e bloquear a inserção.

---

## 🔗 Referências & Documentos Relacionados

- 🎨 **Protótipo Canônico**: `.prototipos/telas/prot_tipo_vendas_vidra_aria.html`
- 📑 **Especificação Pai**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)