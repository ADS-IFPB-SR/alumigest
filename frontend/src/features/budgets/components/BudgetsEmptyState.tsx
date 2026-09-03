import { useNavigate } from 'react-router-dom';

interface BudgetsEmptyStateProps {
  type: 'no-data' | 'no-results' | 'error';
  onRetry?: () => void;
}

export function BudgetsEmptyState({ type, onRetry }: BudgetsEmptyStateProps) {
  const navigate = useNavigate();

  if (type === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-xl px-md gap-md text-center">
        <div className="w-16 h-16 rounded-full bg-error-container/50 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-error">error</span>
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-xs">
            Erro ao carregar orçamentos
          </h3>
          <p className="font-body text-sm text-secondary max-w-md">
            Ocorreu um erro ao buscar os dados. Verifique sua conexão e tente novamente.
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-md font-label font-semibold text-sm shadow-sm hover:bg-primary-container transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-xl px-md gap-md text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-secondary">search_off</span>
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-xs">
            Nenhum orçamento encontrado
          </h3>
          <p className="font-body text-sm text-secondary max-w-md">
            Nenhum orçamento corresponde aos filtros ou termos de busca aplicados. Tente alterar os filtros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-xl px-md gap-md text-center">
      <div className="w-20 h-20 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-[40px] text-primary/40">receipt_long</span>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-xs">
          Nenhum orçamento cadastrado
        </h3>
        <p className="font-body text-sm text-secondary max-w-md">
          Comece criando seu primeiro orçamento para gerenciar propostas e acompanhar aprovações.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/orcamentos/novo')}
        className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-md font-label font-semibold text-sm shadow-sm hover:bg-primary-container transition-all active:scale-95 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Criar Primeiro Orçamento
      </button>
    </div>
  );
}

export function BudgetsLoadingSkeleton() {
  const rows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="overflow-hidden">
        <div className="flex gap-md p-sm bg-surface-container-low border-b border-outline-variant">
          {[120, 160, 100, 100, 80, 110, 100].map((w, i) => (
            <div
              key={i}
              className="h-4 bg-surface-container-high rounded animate-pulse"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {rows.map((i) => (
          <div
            key={i}
            className="flex gap-md p-sm border-b border-outline-variant/40"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="h-4 bg-surface-container-high/70 rounded animate-pulse" style={{ width: '120px' }} />
            <div className="h-4 bg-surface-container-high/70 rounded animate-pulse" style={{ width: '150px' }} />
            <div className="h-4 bg-surface-container-high/70 rounded animate-pulse" style={{ width: '90px' }} />
            <div className="h-4 bg-surface-container-high/70 rounded animate-pulse" style={{ width: '90px' }} />
            <div className="h-4 bg-surface-container-high/70 rounded animate-pulse" style={{ width: '50px' }} />
            <div className="h-4 bg-surface-container-high/70 rounded animate-pulse" style={{ width: '100px' }} />
            <div className="h-6 bg-surface-container-high/70 rounded-md animate-pulse" style={{ width: '80px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
