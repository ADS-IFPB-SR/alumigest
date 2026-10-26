# 📑 Especificação Funcional Integrada — Sprint 08

**Histórias de Usuário Contempladas**:
- **US-46**: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas) — Issue [#171](https://github.com/ADS-IFPB-SR/alumigest/issues/171)
- **US-47**: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas — Issue [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)

---

## 1. 🎯 Objetivos de Negócio

### 1.1 US-46: Venda Avulsa de Partes e Insumos
Permitir que a Alumiportas realize orçamentos e vendas diretas de insumos e partes individualizadas — chapas e peças de vidro sob medida por m², perfis de alumínio por metro linear ou barra cortada, ferragens avulsas por unidade (roldanas, puxadores, fechaduras, braços de articulação) e películas de controle solar/segurança sob medida por m² —, especificando acabamento, medidas dimensionais nominais (L x A mm) e quantidade, com cálculo automático de preços e faturamento, sem a obrigatoriedade de compor uma esquadria completa.

### 1.2 US-47: Central 360° do Cliente
Prover uma interface integrada "Central 360° do Cliente" em layout mestre-detalhe limpo e sem cortes visuais, onde ao selecionar um cliente o operador visualize instantaneamente todos os seus orçamentos vinculados, todas as suas Ordens de Serviço (O.S.) e os itens físicos/esquadrias da O.S. ativa com suas medidas nominais em milímetros ($L \times A$ mm), podendo acionar diretamente dali a impressão de etiquetas térmicas (100x60mm Elgin L42), a emissão da Ficha Técnica de Produção (A4), o download de comprovantes PDF e a abertura do fluxo de produção no Kanban.

---

## 2. 🧪 Critérios de Aceitação Principais

### US-46 — Venda de Partes
- [ ] Cálculo automático de área faturável em m² para vidros e películas com aplicação de arredondamento comercial (mínimo de 0,25 m² ou regra de faturamento da oficina).
- [ ] Cálculo linear de perfis em metros ou peças cortadas com opção de considerar perdas de corte.
- [ ] Totalização em tempo real de itens de ferragens por unidade inteira.
- [ ] Exportação do pedido/orçamento de venda avulsa em PDF A4 com resumo discriminado por categoria.

### US-47 — Central 360°
- [ ] Painel mestre-detalhe com pesquisa rápida de clientes por nome, documento ou telefone.
- [ ] Abas dedicadas e responsivas sem cortes de layout: "Ordens de Serviço (O.S.)" e "Orçamentos".
- [ ] Ações rápidas contextuais: acionamento do `ThermalLabelModal` com repasse direto do pedido e atalhos para WhatsApp e download de PDF.

---

## 3. 📐 Decisões e Padrões Arquiteturais

1. **SOLID & Desacoplamento:** O frontend consome exclusivamente as rotas REST do backend (`/api/v1/part-sales`, `/api/v1/customers/{id}/overview`), mantendo regras de precificação e validação de estoque 100% no servidor.
2. **Qualidade & DoD:** Cobertura de testes unitários $\ge 80\%$, testes E2E Cypress cobrindo jornadas críticas e Quality Gate verde no SonarQube.
