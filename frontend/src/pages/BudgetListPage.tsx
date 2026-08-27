import { Link } from 'react-router-dom';
import { useBudgets } from '../features/budgets/hooks/useBudgets';
import { Button } from '../components/ui/Button';
import { STATUS_LABELS, type BudgetStatus } from '../features/budgets/types';
import { formatBRL } from '../features/budgets/utils/calculations';

const STATUS_COLORS: Record<BudgetStatus, string> = {
  DRAFT: 'bg-surface-container text-on-surface-variant border-outline-variant',
  SENT: 'bg-secondary-container text-on-secondary-container border-secondary-container',
  APPROVED: 'bg-tertiary-container/40 text-on-tertiary-container border-tertiary-container/40',
  REJECTED: 'bg-error-container text-on-error-container border-error-container',
  CANCELLED: 'bg-surface-container-highest text-on-surface-variant border-outline-variant',
};

export function BudgetListPage() {
  const { data, isLoading, isError } = useBudgets();

  const budgets = data?.content ?? [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
        <div>
          <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary leading-tight">
            Orçamentos
          </h2>
          <p className="font-body text-sm text-secondary mt-xs">
            Gerencie propostas comerciais de esquadrias e portas.
          </p>
        </div>
        <Link to="/orcamentos/novo">
          <Button variant="primary" icon="add">
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-xl gap-sm text-secondary">
          <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
          <span className="font-body-sm">Carregando orçamentos...</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-error-container border border-error rounded-lg p-md text-on-error-container flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="font-body-sm">Erro ao carregar orçamentos. O backend pode não estar disponível.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && budgets.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-md text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[56px]">description</span>
          <div>
            <p className="font-headline text-headline-md font-bold text-on-surface">Nenhum orçamento criado</p>
            <p className="font-body text-sm text-on-surface-variant mt-xs">
              Crie seu primeiro orçamento clicando no botão abaixo.
            </p>
          </div>
          <Link to="/orcamentos/novo">
            <Button variant="primary" icon="add">
              Criar Primeiro Orçamento
            </Button>
          </Link>
        </div>
      )}

      {/* Budget cards */}
      {!isLoading && !isError && budgets.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-sm">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm hover:shadow-md transition-all hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-sm">
                  <div className="flex flex-col gap-xs min-w-0">
                    <div className="flex items-center gap-sm flex-wrap">
                      <span className="font-label font-bold text-on-surface text-sm">
                        {budget.code}
                      </span>
                      <span className={`text-xs px-xs py-[2px] rounded-full border font-label ${STATUS_COLORS[budget.status]}`}>
                        {STATUS_LABELS[budget.status]}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface truncate">{budget.customer.name}</p>
                    {budget.customer.phone && (
                      <p className="text-xs font-data-mono text-on-surface-variant">{budget.customer.phone}</p>
                    )}
                    <p className="text-xs text-on-surface-variant font-body">
                      {budget.itemCount} item{budget.itemCount !== 1 ? 's' : ''} · Criado em{' '}
                      {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-sm shrink-0">
                    <span className="font-data-mono font-bold text-primary text-lg">
                      {formatBRL(budget.total)}
                    </span>
                    {budget.discountPercent > 0 && (
                      <span className="text-xs text-error font-data-mono">
                        −{budget.discountPercent}% desc.
                      </span>
                    )}
                    <Link
                      to={`/orcamentos/${budget.id}`}
                      className="flex items-center gap-xs text-xs text-primary hover:underline font-label"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      Ver detalhe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
