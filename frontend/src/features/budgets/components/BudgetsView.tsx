import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { BudgetsFilters } from './BudgetsFilters';
import { BudgetsTable } from './BudgetsTable';
import { BudgetsPagination } from './BudgetsPagination';
import { BudgetsEmptyState, BudgetsLoadingSkeleton } from './BudgetsEmptyState';
import { useBudgets, useBudgetStatusCounts } from '../hooks/useBudgets';
import type { BudgetStatus } from '../types';

export function BudgetsView() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<BudgetStatus | ''>('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('dataCriacao');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filters = useMemo(
    () => ({
      page,
      size: pageSize,
      status,
      search,
      sort: `${sortField},${sortDirection}`,
    }),
    [page, pageSize, status, search, sortField, sortDirection],
  );

  const { data: budgetsData, isLoading, isError, refetch } = useBudgets(filters);
  const { data: statusCounts } = useBudgetStatusCounts();

  const handleStatusChange = (newStatus: BudgetStatus | '') => {
    setStatus(newStatus);
    setPage(0);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleCreate = () => {
    navigate('/orcamentos/novo');
  };

  const budgets = budgetsData?.content || [];
  const totalElements = budgetsData?.totalElements ?? budgetsData?.page?.totalElements ?? 0;
  const totalPages = budgetsData?.totalPages ?? budgetsData?.page?.totalPages ?? 1;

  const isFiltering = Boolean(status || search);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-xs mb-md flex-none">
        <nav className="flex items-center gap-xs text-xs font-body text-secondary" aria-label="Breadcrumb">
          <span>Início</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Orçamentos</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
          <div>
            <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary leading-tight">
              Orçamentos
            </h2>
            <p className="font-body text-sm text-secondary mt-xs">
              Gerencie e acompanhe o status de todas as propostas comerciais.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
            <Button
              variant="primary"
              icon="add"
              onClick={handleCreate}
            >
              Novo Orçamento
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-md flex-none">
        <BudgetsFilters
          activeStatus={status}
          searchTerm={search}
          statusCounts={statusCounts}
          onStatusChange={handleStatusChange}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xs">
        {isLoading ? (
          <BudgetsLoadingSkeleton />
        ) : isError ? (
          <BudgetsEmptyState type="error" onRetry={() => refetch()} />
        ) : budgets.length === 0 ? (
          <BudgetsEmptyState type={isFiltering ? 'no-results' : 'no-data'} />
        ) : (
          <>
            <BudgetsTable
              data={budgets}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <BudgetsPagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
