interface BudgetsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function BudgetsPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: BudgetsPaginationProps) {
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const getVisiblePages = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | '...')[] = [];
    pages.push(0);

    if (currentPage > 2) {
      pages.push('...');
    }

    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push('...');
    }

    pages.push(totalPages - 1);

    return pages;
  };

  if (totalPages <= 1 && totalElements <= pageSize) {
    return (
      <div className="flex items-center justify-between py-sm px-md border-t border-outline-variant bg-surface-container-low/50">
        <span className="text-xs text-secondary font-body">
          Mostrando <span className="font-semibold font-data-mono">{totalElements}</span> {totalElements === 1 ? 'orçamento' : 'orçamentos'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-sm py-sm px-md border-t border-outline-variant bg-surface-container-low/50">
      <span className="text-xs text-secondary font-body order-2 sm:order-1">
        Mostrando <span className="font-semibold font-data-mono">{startItem}</span> – <span className="font-semibold font-data-mono">{endItem}</span> de <span className="font-semibold font-data-mono">{totalElements}</span>
      </span>

      <div className="flex items-center gap-xs order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center gap-xs px-sm py-xs rounded-md text-xs font-medium font-label text-secondary border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-xs">
          {getVisiblePages().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-xs text-secondary text-xs select-none">
                  …
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-[32px] flex items-center justify-center rounded-md text-xs font-data-mono font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-secondary hover:bg-surface-container-high border border-transparent hover:border-outline-variant'
                }`}
              >
                {page + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-xs px-sm py-xs rounded-md text-xs font-medium font-label text-secondary border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Próxima</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
