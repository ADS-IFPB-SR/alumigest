import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useBudgets } from '../servicos-e-mocks/useBudgets';
import type { Budget, BudgetStatus } from '../tipos';

const statusLabels: Record<BudgetStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-surface-container-high text-on-surface-variant' },
  SENT: { label: 'Enviado', color: 'bg-secondary-container text-on-secondary-container' },
  APPROVED: { label: 'Aprovado', color: 'bg-tertiary-container text-on-tertiary-container' },
  REJECTED: { label: 'Rejeitado', color: 'bg-error-container text-on-error-container' },
  CANCELLED: { label: 'Cancelado', color: 'bg-surface-container-high text-outline' },
};

export function BudgetsPage() {
  const navigate = useNavigate();
  const { budgets } = useBudgets();

  const columns = useMemo(() => [
    {
      header: 'Código',
      accessor: (row: Budget) => (
        <span className="font-data-mono text-data-mono text-primary font-bold">{row.code}</span>
      ),
    },
    {
      header: 'Cliente',
      accessor: (row: Budget) => (
        <div className="flex flex-col">
          <span className="font-title-sm text-title-sm text-on-surface font-semibold">{row.customer.name}</span>
          {row.customer.phone && (
            <span className="font-body-sm text-xs text-on-surface-variant">{row.customer.phone}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Itens',
      accessor: (row: Budget) => (
        <span className="font-data-mono text-data-mono text-secondary">{row.items.length}</span>
      ),
      align: 'center' as const,
    },
    {
      header: 'Total',
      accessor: (row: Budget) => (
        <span className="font-data-mono text-data-mono text-primary font-bold">
          R$ {row.total.toFixed(2).replace('.', ',')}
        </span>
      ),
      align: 'right' as const,
    },
    {
      header: 'Status',
      accessor: (row: Budget) => {
        const s = statusLabels[row.status];
        return (
          <span className={`inline-flex items-center px-sm py-xs rounded-full text-xs font-semibold ${s.color}`}>
            {s.label}
          </span>
        );
      },
      align: 'center' as const,
    },
    {
      header: 'Data',
      accessor: (row: Budget) => (
        <span className="font-data-mono text-data-mono text-secondary text-xs">
          {new Date(row.createdAt).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ], []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
        <div>
          <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary leading-tight">
            Orçamentos
          </h2>
          <p className="font-body text-sm text-secondary mt-xs">
            Gerencie propostas comerciais para seus clientes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
          <Button variant="primary" icon="add" onClick={() => navigate('/orcamentos/novo')}>
            Novo Orçamento
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-white border border-outline-variant/60 rounded-lg shadow-sm">
        {budgets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-xl">
            <span className="material-symbols-outlined text-[64px] text-outline mb-md">description</span>
            <h3 className="font-title-sm text-title-sm text-on-surface mb-xs">Nenhum orçamento cadastrado</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md max-w-md">
              Crie seu primeiro orçamento selecionando um cliente e adicionando os produtos que deseja orçar.
            </p>
            <Button variant="primary" icon="add" onClick={() => navigate('/orcamentos/novo')}>
              Criar Primeiro Orçamento
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={budgets}
            onViewDetails={(row) => navigate(`/orcamentos/${row.id}`)}
            onEdit={(row) => navigate(`/orcamentos/${row.id}/editar`)}
          />
        )}
      </div>
    </div>
  );
}
