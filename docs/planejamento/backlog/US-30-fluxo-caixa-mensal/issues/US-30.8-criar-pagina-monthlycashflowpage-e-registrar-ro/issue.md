# [US-30.8] Criar Componentes Frontend: `CashFlowSummaryCards`, `ExpenseModal` e `CashFlowTable`

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.8`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Frontend / Componentes React 19 + Tailwind
- **Alvo Principal**: `frontend/src/features/finance/components/`
- **Labels**: `frontend`, `react`, `tailwind`, `components`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Construir os blocos visuais especializados do painel financeiro:
1. **`CashFlowSummaryCards.tsx`**: 3 cartões responsivos no topo exibindo:
   - 🟢 **Total de Entradas:** com ícone de seta subindo, cor verde esmeralda e valor formatado em BRL (`Intl.NumberFormat`).
   - 🔴 **Total de Despesas:** com ícone de seta descendo, cor vermelha e valor em BRL.
   - 🔵 **Saldo Líquido:** com badge indicativo de superávit (verde/azul) ou déficit (vermelho) baseado no valor entregue pelo backend.
2. **`ExpenseModal.tsx`**: Modal limpo com formulário (descrição, categoria, valor, data e método de pagamento), validação visual Zod/React Hook Form e feedback de carregamento.
3. **`CashFlowTable.tsx`**: Tabela com ordenação cronológica decrescente, badges de categoria, formatação de moeda, indicador de O.S. (com link navegável para `/pedidos/{orderId}`) e botão de exclusão de despesa.

---

## 📐 Diretrizes Arquiteturais (SOLID & Clean Code)
- **Zero Lógica de Negócio na UI:** Os componentes recebem os dados agregados via props; não realizam cálculos matemáticos de somatório ou saldo.
- **Acessibilidade e Feedback:** Modal fecha ao pressionar `Escape` ou clicar no backdrop (exceto durante requisição ativa).

---

## 🚦 Critérios de Aceitação
1. A tabela renderiza perfeitamente tanto linhas de `Entrada` quanto de `Despesa` com diferenciação visual nítida.
2. O modal de nova despesa valida campos obrigatórios e reseta o formulário após gravação com sucesso.
3. Testes unitários no Vitest cobrem a renderização dos cartões e submissão do modal.
