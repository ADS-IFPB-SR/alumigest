import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBudgets, useDeleteBudget } from '../features/budgets/hooks/useBudgets';
import { Button } from '../components/ui/Button';
import { STATUS_LABELS, type BudgetStatus, type BudgetSummary } from '../features/budgets/types';
import { formatBRL } from '../features/budgets/utils/calculations';

const STATUS_COLORS: Record<BudgetStatus, string> = {
  DRAFT: 'bg-surface-container text-on-surface-variant border-outline-variant',
  SENT: 'bg-secondary-container text-on-secondary-container border-secondary-container',
  APPROVED: 'bg-tertiary-container/40 text-on-tertiary-container border-tertiary-container/40 font-bold',
  REJECTED: 'bg-error-container text-on-error-container border-error-container',
  CANCELLED: 'bg-surface-container-highest text-on-surface-variant border-outline-variant',
};

const ALL_STATUSES: { value: BudgetStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos os Status' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SENT', label: 'Enviado' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'REJECTED', label: 'Rejeitado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export function BudgetListPage() {
  const { data, isLoading, isError } = useBudgets();
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BudgetStatus | 'ALL'>('ALL');
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetSummary | null>(null);

  const rawBudgets = useMemo(() => data?.content ?? [], [data?.content]);

  const filteredBudgets = useMemo(() => {
    return rawBudgets.filter((b) => {
      const matchesSearch =
        !searchTerm.trim() ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.customer.phone && b.customer.phone.includes(searchTerm));

      const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [rawBudgets, searchTerm, selectedStatus]);

  const handleDeleteConfirm = () => {
    if (!budgetToDelete) return;
    deleteBudget(budgetToDelete.id, {
      onSuccess: () => {
        setBudgetToDelete(null);
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
        <div>
          <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary leading-tight">
            Orçamentos
          </h2>
          <p className="font-body text-sm text-secondary mt-xs">
            Gerencie propostas comerciais de esquadrias, janelas e portas.
          </p>
        </div>
        <Link to="/orcamentos/novo">
          <Button variant="primary" icon="add">
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm mb-md flex-none">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por código (ORC-...), cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-xl pr-sm py-xs sm:py-sm bg-surface-container-lowest border border-outline-variant rounded-md font-body text-sm text-on-surface focus:border-primary focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
              title="Limpar busca"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-xs shrink-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as BudgetStatus | 'ALL')}
            aria-label="Filtrar por status"
            className="px-sm py-xs sm:py-sm bg-surface-container-lowest border border-outline-variant rounded-md font-body text-sm text-on-surface focus:border-primary focus:outline-none cursor-pointer"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
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
          <p className="font-body-sm">Erro ao carregar orçamentos. O repositório pode ter encontrado um problema.</p>
        </div>
      )}

      {/* Empty state (base vazia) */}
      {!isLoading && !isError && rawBudgets.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-md text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[56px]">description</span>
          <div>
            <p className="font-headline text-headline-md font-bold text-on-surface">Nenhum orçamento cadastrado</p>
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

      {/* Nenhum resultado na busca filtrada */}
      {!isLoading && !isError && rawBudgets.length > 0 && filteredBudgets.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-sm text-center py-xl">
          <span className="material-symbols-outlined text-on-surface-variant text-[40px]">filter_alt_off</span>
          <p className="font-headline font-semibold text-on-surface text-base">Nenhum orçamento encontrado</p>
          <p className="font-body text-xs text-on-surface-variant max-w-sm">
            Nenhum orçamento corresponde aos filtros selecionados. Tente ajustar o termo de busca ou o status.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('ALL');
            }}
            className="text-primary text-xs hover:underline font-label mt-xs"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Budget list cards */}
      {!isLoading && !isError && filteredBudgets.length > 0 && (
        <div className="flex-1 overflow-y-auto pr-xs">
          <div className="flex flex-col gap-sm pb-xl">
            {filteredBudgets.map((budget) => (
              <div
                key={budget.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm hover:shadow-md transition-all hover:border-primary/40 group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm">
                  {/* Left Info */}
                  <div className="flex flex-col gap-xs min-w-0 flex-1">
                    <div className="flex items-center gap-sm flex-wrap">
                      <Link
                        to={`/orcamentos/${budget.id}`}
                        className="font-label font-bold text-on-surface hover:text-primary transition-colors text-sm"
                      >
                        {budget.code}
                      </Link>
                      <span className={`text-xs px-xs py-[2px] rounded-full border font-label ${STATUS_COLORS[budget.status]}`}>
                        {STATUS_LABELS[budget.status]}
                      </span>
                    </div>

                    <p className="font-body-sm text-on-surface font-semibold truncate">{budget.customer.name}</p>

                    <div className="flex items-center gap-md flex-wrap text-xs text-on-surface-variant font-body">
                      {budget.customer.phone && (
                        <span className="font-data-mono flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">phone</span>
                          {budget.customer.phone}
                        </span>
                      )}
                      <span>
                        {budget.itemCount} esquadria{budget.itemCount !== 1 ? 's' : ''}
                      </span>
                      <span>
                        Criado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Right Values + Actions */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-sm shrink-0 w-full sm:w-auto pt-xs sm:pt-0 border-t sm:border-t-0 border-outline-variant/40">
                    <div className="text-left sm:text-right">
                      <span className="font-data-mono font-bold text-primary text-lg">
                        {formatBRL(budget.total)}
                      </span>
                      {budget.discountPercent > 0 && (
                        <p className="text-[11px] text-error font-data-mono">
                          −{budget.discountPercent}% ({formatBRL(budget.discountValue)}) desc.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-xs">
                      <Link
                        to={`/orcamentos/${budget.id}`}
                        className="flex items-center gap-xs px-sm py-[4px] rounded text-xs text-primary hover:bg-primary/10 transition-colors font-label font-medium"
                        title="Ver detalhes"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span className="hidden sm:inline">Ver</span>
                      </Link>
                      <Link
                        to={`/orcamentos/${budget.id}/editar`}
                        className="flex items-center gap-xs px-sm py-[4px] rounded text-xs text-secondary hover:text-primary hover:bg-surface-container transition-colors font-label font-medium"
                        title="Editar orçamento"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span className="hidden sm:inline">Editar</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setBudgetToDelete(budget)}
                        className="p-[4px] rounded text-secondary hover:text-error hover:bg-error/10 transition-colors"
                        title="Excluir orçamento"
                        aria-label={`Excluir orçamento ${budget.code}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {budgetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-xl p-lg max-w-sm w-full shadow-2xl flex flex-col gap-md">
            <div className="flex items-center gap-sm text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h4 className="font-headline font-bold text-on-surface text-base">Excluir Orçamento?</h4>
            </div>
            <p className="text-sm text-on-surface-variant font-body">
              Tem certeza que deseja remover o orçamento <strong>{budgetToDelete.code}</strong> ({budgetToDelete.customer.name}) de <strong>{formatBRL(budgetToDelete.total)}</strong>?
            </p>
            <div className="flex justify-end gap-sm mt-xs">
              <button
                type="button"
                onClick={() => setBudgetToDelete(null)}
                disabled={isDeleting}
                className="px-md py-xs rounded-md border border-outline-variant text-sm font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-md py-xs rounded-md bg-error text-on-error text-sm font-label font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
