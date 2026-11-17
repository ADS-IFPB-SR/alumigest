import {
  StockAlertBadge,
  formatStockQuantity,
  resolveCatalogStockSnapshot,
  type StockDisplayAlertStatus,
  type StockItem,
} from '@/features/stock';

export interface MobileCardMetadata<T> {
  readonly reference: (row: T) => string;
  readonly name: (row: T) => string;
  readonly specSummary: (row: T) => string;
  readonly priceLabel: (row: T) => string;
}

interface CatalogMobileMaterialCardProps<
  T extends { id: string; active?: boolean; unitMeasure?: string },
> {
  readonly row: T;
  readonly meta: MobileCardMetadata<T>;
  readonly stockItem?: StockItem;
  readonly defaultUnitMeasure?: string;
  readonly hideStockAlert: boolean;
  readonly rowTestId: string;
  readonly onEdit: (row: T) => void;
  readonly onViewDetails: (row: T) => void;
}

const AVAILABLE_CLASSES: Readonly<Record<StockDisplayAlertStatus, string>> = {
  NEED_PURCHASE: 'text-rose-700 dark:text-rose-300',
  ORDER_POINT: 'text-amber-800 dark:text-amber-300',
  IN_STOCK: 'text-emerald-700 dark:text-emerald-300',
  NO_BALANCE: 'text-on-surface-variant',
};

/**
 * Cartão responsivo compacto (< 640px) para visualização de especificações técnicas e saldos de estoque.
 */
export function CatalogMobileMaterialCard<
  T extends { id: string; active?: boolean; unitMeasure?: string },
>({
  row,
  meta,
  stockItem,
  defaultUnitMeasure,
  hideStockAlert,
  rowTestId,
  onEdit,
  onViewDetails,
}: CatalogMobileMaterialCardProps<T>) {
  const snapshot = resolveCatalogStockSnapshot(
    stockItem,
    row.unitMeasure || defaultUnitMeasure || 'UN'
  );
  const specText = meta.specSummary(row);

  return (
    <article
      data-testid={`mobile-${rowTestId}-${row.id}`}
      className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col gap-sm shadow-xs"
    >
      <div className="flex items-start justify-between gap-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-sm flex-wrap">
            <span className="font-data-mono text-xs text-on-surface-variant">
              {meta.reference(row)}
            </span>
            <span
              className={`inline-flex items-center px-2 py-px rounded-full text-[10px] font-medium ${
                row.active
                  ? 'border border-success/30 bg-success/10 text-success'
                  : 'border border-error/30 bg-error/10 text-error'
              }`}
            >
              {row.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <h3 className="font-semibold text-sm text-on-surface mt-xs leading-snug">
            {meta.name(row)}
          </h3>

          <p className="text-xs text-on-surface-variant mt-0.5">
            {specText ? `${specText} · ` : ''}
            <span className="font-data-mono tabular-nums font-medium text-on-surface">
              {meta.priceLabel(row)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-xs shrink-0">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="p-xs text-secondary hover:text-primary hover:bg-secondary-container/40 rounded-md transition-colors"
            title="Editar Cadastro"
            aria-label={`Editar ${meta.name(row)}`}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => onViewDetails(row)}
            className="p-xs text-secondary hover:text-primary hover:bg-secondary-container/40 rounded-md transition-colors"
            title="Visualizar Detalhes"
            aria-label={`Detalhes de ${meta.name(row)}`}
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-xs bg-surface-container-low border border-outline-variant/60 rounded-md p-sm">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant">
            Físico
          </span>
          <span className="font-data-mono tabular-nums text-xs font-semibold text-on-surface">
            {formatStockQuantity(snapshot.physicalQuantity, snapshot.unitMeasure)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant">
            Reservado
          </span>
          <span className="font-data-mono tabular-nums text-xs text-on-surface-variant">
            {formatStockQuantity(snapshot.reservedQuantity, snapshot.unitMeasure)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant">
            Disponível
          </span>
          <span
            className={`font-data-mono tabular-nums text-xs font-bold ${AVAILABLE_CLASSES[snapshot.displayStatus]}`}
          >
            {formatStockQuantity(snapshot.availableQuantity, snapshot.unitMeasure)}
          </span>
        </div>
      </div>

      {!hideStockAlert && (
        <div className="flex items-center justify-between pt-xs">
          <StockAlertBadge
            variant="catalog"
            status={snapshot.displayStatus}
            availableQuantity={snapshot.availableQuantity}
            unitMeasure={snapshot.unitMeasure}
          />
        </div>
      )}
    </article>
  );
}
