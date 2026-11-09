# [US-47.1] Hub 360° Base, KPIs e Gestão de Orçamentos

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.1`
- **Issue GitHub**: `#531`
- **US Pai**: `US-47: Central 360° do Cliente`
- **Release**: Sprint 08
- **Fase**: `Fundação Arquitetural e UX Core`
- **User Story**: Como operador comercial, desejo enxergar toda a vida comercial de um cliente em uma única tela contínua (mestre-detalhe), evitando pular entre múltiplos menus.
- **Sub-área**: `Frontend (React) & Backend (Projeções CQRS)`
- **Execução Paralela**: ❌ Não (Base Estrutural para as demais abas)
- **Arquivo / Alvo Principal**: Componentes Mestre-Detalhe, `ClientDashboardDto`, Layout Geral
- **Labels Sugeridas**: `feature`, `frontend`, `backend`, `ux`, `dashboard`

---

## 🎯 Objetivo & Descrição

Esta tarefa entrega a base estrutural e comercial da Central 360° do Cliente. Cria o layout mestre-detalhe onde a esquerda mantém uma barra lateral de busca e a direita atua como área de trabalho (Hero Card e 3 KPIs principais).

### Contexto da Fase / Épico
Para evitar fragmentação no atendimento telefônico ou presencial, a tela mestre-detalhe reduz o número de cliques, consolidando a ficha técnica, contatos, botões de WhatsApp e a primeira aba essencial: A aba de Orçamentos Comerciais (Propostas).

---

## 🛠️ Checklist de Implementação

- [ ] **Visão Consolidada de Indicadores**: Implementar apuração no servidor dos números estratégicos do cliente (total faturado, qtd. ordens e orçamentos).
- [ ] **Layout Mestre-Detalhe**: Construir barra lateral de pesquisa rápida (nome, documento, telefone) interagindo reativamente com a área de trabalho.
- [ ] **Hero Card**: Implementar bloco superior com dados cadastrais e botão de WhatsApp.
- [ ] **Aba de Propostas Comerciais**: Criar tabela limpa listando as cotações do cliente, com botões para PDF e compartilhamento.
- [ ] **Novo Orçamento com State-Lock**: Configurar o redirecionamento do botão "➕ Novo Orçamento" travando o UUID do cliente no formulário.
- [ ] **Testes Automatizados**: Validar a busca lateral, os cálculos de KPIs e a manipulação dos orçamentos no Front/Back.

---

## ✅ Critérios de Aceitação

1. Ao selecionar um cliente na lista lateral, o painel de trabalho deve carregar instantaneamente seus dados cadastrais, indicadores de faturamento e sua lista de orçamentos.
2. A barra lateral deve permitir filtrar clientes por nome, CPF/CNPJ ou telefone, destacando visualmente o cliente ativo.
3. A aba "Orçamentos" deve exibir a listagem completa de propostas com valores formatados e botões funcionais para download de PDF e WhatsApp.
4. O botão "➕ Novo Orçamento" deve direcionar o vendedor para o formulário de orçamentos com o cliente pré-preenchido e bloqueado.
5. Selecionar um identificador de cliente inexistente deve apresentar mensagem informativa sem quebrar a tela.

---

## 🔗 Referências & Documentos Relacionados

- 🖥️ **Protótipo Interativo**: `docs/planejamento/prototipos/painel-clientes-360.html`
- 📑 **Especificação Técnica**: `technical-spec.md` (Mesmo diretório)
- 📑 **Especificação Pai**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)