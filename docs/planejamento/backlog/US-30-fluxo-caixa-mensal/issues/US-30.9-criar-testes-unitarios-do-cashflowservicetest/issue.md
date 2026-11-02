# [US-30.9] Implementar Página `CashFlowPage` e Rota `/financeiro/fluxo-de-caixa`

## 📋 Metadados da Issue
- **ID da Tarefa**: `US-30.9`
- **US Pai**: `US-30: Fluxo de Caixa Mensal & Gestão de Despesas (Substituto do Excel)`
- **Sprint**: Sprint 09 (Fechamento Funcional)
- **Camada**: Frontend / Página & Roteamento
- **Alvo Principal**: `frontend/src/pages/CashFlowPage.tsx` e `frontend/src/routes/`
- **Labels**: `frontend`, `pages`, `tanstack-query`, `router`, `sprint-09`

---

## 🎯 Objetivo & Descrição
Construir a página orquestradora `CashFlowPage.tsx` que atua como o substituto oficial da planilha do Excel:
1. Hero de cabeçalho com título *"Fluxo de Caixa & Despesas"*, seletor de mês e ano (`MonthYearPicker`) e botão de ação primária `+ Nova Despesa`.
2. Integração com TanStack Query via hook customizado `useCashFlow(year, month)` para refetch instantâneo ao alterar período ou adicionar despesa.
3. Tratamento de estados de carregamento (Skeletons) e erro de conexão.
4. Registro da rota `/financeiro/fluxo-de-caixa` no roteamento central e link com ícone monetário no menu lateral (Sidebar).

---

## 📐 Estrutura da Página

```tsx
export const CashFlowPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const { summary, movements, isLoading, isError, addExpense, deleteExpense } = 
    useCashFlow(year, month);

  return (
    <div className="space-y-6 p-6">
      <CashFlowHeader 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenExpenseModal={() => setModalOpen(true)}
      />
      
      <CashFlowSummaryCards summary={summary} isLoading={isLoading} />
      
      <CashFlowTable 
        movements={movements} 
        isLoading={isLoading} 
        onDeleteExpense={deleteExpense} 
      />

      <ExpenseModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={addExpense} 
      />
    </div>
  );
};
```

---

## 🚦 Critérios de Aceitação
1. Alterar o mês/ano no cabeçalho recarrega os dados imediatamente sem *full page reload*.
2. Ao registrar uma despesa com sucesso, o cache do TanStack Query é invalidado automaticamente, atualizando o total de despesas e o saldo em tela.
3. Rota integrada à barra lateral sem duplicidade de links.
