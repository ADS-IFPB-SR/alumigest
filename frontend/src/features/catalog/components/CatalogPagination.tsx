import { getVisiblePages } from '../../../utils/pagination';

interface CatalogPaginationProps {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalElements: number;
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange: (size: number) => void;
  readonly pageSizeOptions?: readonly number[];
  readonly selectId?: string;
}

/**
 * Barra de paginação no padrão dos módulos de Ordens de Serviço e Venda Avulsa:
 * contagem de itens exibidos, seletor de tamanho (10/20/50) e janela deslizante.
 */
export function CatalogPagination({
  currentPage,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  selectId = 'catalog-page-size-select',
}: CatalogPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const startItem = totalElements === 0 ? 0 : safePage * pageSize + 1;
  const endItem = Math.min((safePage + 1) * pageSize, totalElements);

  return (
    <div
      data-testid="catalog-pagination"
      className="flex-none px-3 py-2 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-2"
    >
      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
        <span>
          {'Exibindo '}
          <strong className="font-data-mono text-on-surface">{startItem}</strong>
          {'–'}
          <strong className="font-data-mono text-on-surface">{endItem}</strong>
          {' de '}
          <strong className="font-data-mono text-on-surface">{totalElements}</strong>
          {' materiais'}
        </span>

        <div className="flex items-center gap-1.5 border-l border-outline-variant pl-3">
          <label htmlFor={selectId} className="text-xs text-on-surface-variant">
            Por página:
          </label>
          <select
            id={selectId}
            data-testid={selectId}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-0.5 bg-surface border border-outline-variant rounded text-xs text-on-surface cursor-pointer focus:outline-none focus:border-primary"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          disabled={safePage === 0}
          className="px-2 py-1 text-xs border border-outline-variant bg-surface rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium cursor-pointer"
          aria-label="Página anterior"
        >
          &larr; Anterior
        </button>

        {getVisiblePages(safePage, totalPages).map((pageItem) => {
          if (typeof pageItem === 'string') {
            return (
              <span
                key={pageItem}
                data-testid={`pagination-${pageItem}`}
                className="w-6 h-6 flex items-center justify-center text-xs text-on-surface-variant select-none"
                aria-hidden="true"
              >
                …
              </span>
            );
          }
          const isActive = pageItem === safePage;
          return (
            <button
              key={pageItem}
              type="button"
              onClick={() => onPageChange(pageItem)}
              className={`min-w-[26px] h-[26px] px-1 flex items-center justify-center text-xs font-data-mono rounded-md border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary border-primary font-bold'
                  : 'border-transparent text-on-surface hover:bg-surface-container'
              }`}
              aria-label={`Ir para página ${pageItem + 1}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageItem + 1}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
          disabled={safePage >= totalPages - 1}
          className="px-2 py-1 text-xs border border-outline-variant bg-surface rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium cursor-pointer"
          aria-label="Próxima página"
        >
          Próximo &rarr;
        </button>
      </div>
    </div>
  );
}
