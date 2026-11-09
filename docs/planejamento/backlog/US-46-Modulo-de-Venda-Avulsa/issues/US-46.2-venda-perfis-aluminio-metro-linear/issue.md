# [US-46.2] Venda de Perfis de Alumínio em Metro Linear

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.2`
- **Issue GitHub**: `#528`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes`
- **Release**: Sprint 08
- **Fase**: `Fundação Arquitetural e Desenvolvimento Comercial`
- **User Story**: Como vendedor, desejo vender peças de alumínio cortadas contabilizando o metro linear correto e os fatores de perda, para que as sobras sejam precificadas.
- **Sub-área**: `Arquitetura, Backend & Frontend`
- **Execução Paralela**: ❌ Não (Base Estrutural para as demais)
- **Arquivo / Alvo Principal**: `V23__create_part_sales_schema.sql`, `PartCalculatorFactory.java`, `PartSaleForm.tsx`
- **Labels Sugeridas**: `feature`, `architecture`, `backend`, `frontend`, `database`

---

## 🎯 Objetivo & Descrição

Esta tarefa expande o módulo de venda de partes para permitir o orçamento e a venda direta de perfis e barras de alumínio por metro linear ou peças cortadas. Devido à sua prioridade, esta task **estabelece toda a fundação arquitetural fullstack** do módulo, implementando a migração Flyway, o Padrão Strategy e os layouts principais.

### Contexto da Fase / Épico
Na serralheria, o alumínio é adquirido em barras industriais (ex: 6 metros). Cortes geram sobras e perdas operacionais que precisam ser precificadas com exatidão na venda final.

---

## 🛠️ Checklist de Implementação

- [ ] **Fundação de Dados**: Criar migração Flyway (V23) para as tabelas `tb_part_sales` e `tb_part_sale_items`.
- [ ] **Strategy Pattern Base**: Construir a interface `PartItemCalculator` e a fábrica `PartCalculatorFactory` suportando as categorias (`PROFILE`, `GLASS`, `HARDWARE`, `FILM`).
- [ ] **API REST Unificada**: Desenvolver endpoint `POST /api/v1/part-sales/calculate-item` com validações.
- [ ] **Especialista de Alumínio (`AluminumProfilePartCalculator`)**: Implementar conversão de $mm$ para $m$ linear e aplicar a taxa de perda de corte homologada (+5%).
- [ ] **Componente Frontend Base (`PartSaleForm.tsx`)**: Implementar layout em 2 colunas integrado ao `DashboardLayout` e suporte a Dark Mode.
- [ ] **Componente Especialista (`AluminumItemFields.tsx`)**: Renderizar badge âmbar "Metro Linear (m)", painel de metragem ao vivo e desabilitar largura.
- [ ] Escrever cobertura completa de testes unitários para a classe do alumínio (backend/frontend).

---

## ✅ Critérios de Aceitação

1. Ao selecionar um perfil de alumínio, a interface exibe apenas o comprimento em milímetros e quantidade de barras, com a largura desabilitada/oculta.
2. A tela exibe a etiqueta visual indicativa de cobrança em metro linear em tom âmbar.
3. O sistema converte automaticamente o comprimento em milímetros para metros e aplica a taxa de perda de corte homologada (+5%).
4. O subtotal e a metragem faturável são calculados e exibidos em tempo real ao alterar medidas ou quantidade.
5. Medidas fora do limite padrão das barras industriais (>6000 mm) ou zeradas disparam alertas visuais e bloqueiam a inserção.
6. A tela possui suporte nativo ao Dark Mode e ocupa 100% da área útil do painel.

---

## 🔗 Referências & Documentos Relacionados

- 🎨 **Protótipo Canônico**: `.prototipos/telas/prot_tipo_vendas_vidra_aria.html`
- 📑 **Especificação Pai**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)