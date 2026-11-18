import { useEffect, useMemo, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import {
  compareCatalogStockCriticality,
  needsPurchaseOrReorder,
  resolveCatalogStockSnapshot,
  type StockItem,
} from '@/features/stock';
import {
  buildCatalogStockAndStatusColumns,
  type CatalogTableColumn,
} from '../utils/stockColumns';
import {
  CatalogMobileMaterialCard,
  type MobileCardMetadata,
} from './CatalogMobileMaterialCard';
import { CatalogPagination } from './CatalogPagination';
import { StockAlertLegend } from './StockAlertLegend';

const EMPTY_STOCK_MAP: ReadonlyMap<string, StockItem> = new Map();
const DEFAULT_PAGE_SIZE = 20;

interface CatalogMaterialSectionProps<
  T extends { id: string; active?: boolean; unitMeasure?: string },
> {
  readonly dataCyContainer: string;
  readonly dataCyLoading: string;
  readonly loadingMessage: string;
  readonly isLoading: boolean;
  readonly rows: readonly T[];
  readonly specColumns: readonly CatalogTableColumn<T>[];
  readonly statusDataCy: string;
  readonly defaultUnitMeasure?: string;
  readonly stockByMaterialId?: ReadonlyMap<string, StockItem>;
  readonly onlyNeedsPurchase?: boolean;
  readonly hideStockAlert?: boolean;
  readonly mobileMeta: MobileCardMetadata<T>;
  readonly rowTestId: string;
  readonly rowTestAttributes?: (row: T) => Record<string, string | undefined>;
  readonly onEdit: (row: T) => void;
  readonly onViewDetails: (row: T) => void;
}

/**
 * Seção compartilhada pelas 4 abas do Catálogo (Vidros, Perfis, Películas e Ferragens):
 * aplica filtro de necessidade de compra, ordenação por criticidade, paginação (10/20/50),
 * renderiza Tabela compacta (>= sm) ou Cards Mobile (< sm), estado vazio e legenda.
 */
export function CatalogMaterialSection<
  T extends { id: string; active?: boolean; unitMeasure?: string },
>({
  dataCyContainer,
  dataCyLoading,
  loadingMessage,
  isLoading,
  rows,
  specColumns,
  statusDataCy,
  defaultUnitMeasure,
  stockByMaterialId = EMPTY_STOCK_MAP,
  onlyNeedsPurchase = false,
  hideStockAlert = false,
  mobileMeta,
  rowTestId,
  rowTestAttributes,
  onEdit,
  onViewDetails,
}: CatalogMaterialSectionProps<T>) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const visibleRows = useMemo(() => {
    if (!onlyNeedsPurchase) {
      return [...rows];
    }

    return rows
      .map((row) => ({
        row,
        snapshot: resolveCatalogStockSnapshot(
          stockByMaterialId.get(row.id),
          row.unitMeasure || defaultUnitMeasure || 'UN'
        ),
      }))
      .filter(({ snapshot }) => needsPurchaseOrReorder(snapshot.displayStatus))
      .sort((a, b) => compareCatalogStockCriticality(a.snapshot, b.snapshot))
      .map(({ row }) => row);
  }, [rows, onlyNeedsPurchase, stockByMaterialId, defaultUnitMeasure]);

  const rowsSignature = useMemo(
    () => visibleRows.map((item) => item.id).join(','),
    [visibleRows]
  );

  useEffect(() => {
    setPage(0);
  }, [rowsSignature]);

  const totalElements = visibleRows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  const paginatedRows = useMemo(() => {
    const start = safePage * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }, [visibleRows, safePage, pageSize]);

  const columns = useMemo(
    () => [
      ...specColumns,
      ...buildCatalogStockAndStatusColumns<T>({
        stockByMaterialId,
        hideStockAlert,
        defaultUnitMeasure,
        statusDataCy,
      }),
    ],
    [specColumns, stockByMaterialId, hideStockAlert, defaultUnitMeasure, statusDataCy]
  );

  if (isLoading) {
    return (
      <div data-cy={dataCyLoading} className="p-md text-secondary">
        {loadingMessage}
      </div>
    );
  }

  const renderPaginationBar = (selectId: string) => (
    <CatalogPagination
      selectId={selectId}
      currentPage={safePage}
      pageSize={pageSize}
      totalElements={totalElements}
      onPageChange={setPage}
      onPageSizeChange={(newSize) => {
        setPageSize(newSize);
        setPage(0);
      }}
    />
  );

  return (
    <div
      data-cy={dataCyContainer}
      className="flex-1 min-h-0 overflow-hidden flex flex-col"
    >
      {onlyNeedsPurchase && visibleRows.length === 0 ? (
        <div
          data-testid="catalog-purchase-empty-state"
          className="bg-surface-container-lowest border border-outline-variant rounded-md p-xl text-center flex-1 flex flex-col items-center justify-center"
        >
          <span className="material-symbols-outlined text-[32px] text-success">
            inventory_2
          </span>
          <p className="font-semibold text-on-surface mt-sm text-sm">
            Nenhum material desta categoria precisa de compra agora.
          </p>
          <p className="text-xs text-on-surface-variant mt-xs">
            Desmarque o filtro para visualizar o catálogo completo.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden sm:flex flex-1 min-h-0 overflow-hidden flex-col">
            <Table
              compact={true}
              columns={columns}
              data={paginatedRows}
              exportData={visibleRows}
              totalCount={totalElements}
              footer={renderPaginationBar(`catalog-page-size-${dataCyContainer}-desktop`)}
              onEdit={onEdit}
              onViewDetails={onViewDetails}
              rowTestId={() => rowTestId}
              rowTestAttributes={rowTestAttributes}
            />
          </div>

          <div className="sm:hidden flex flex-col flex-1 min-h-0 overflow-hidden">
            <div
              data-testid={`mobile-cards-${dataCyContainer}`}
              className="flex flex-col gap-sm overflow-y-auto flex-1 pr-xs"
            >
              {paginatedRows.map((row) => (
                <CatalogMobileMaterialCard
                  key={row.id}
                  row={row}
                  meta={mobileMeta}
                  stockItem={stockByMaterialId.get(row.id)}
                  defaultUnitMeasure={defaultUnitMeasure}
                  hideStockAlert={hideStockAlert}
                  rowTestId={rowTestId}
                  onEdit={onEdit}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
            <div className="mt-sm border border-outline-variant rounded-md overflow-hidden">
              {renderPaginationBar(`catalog-page-size-${dataCyContainer}-mobile`)}
            </div>
          </div>
        </>
      )}

      {!hideStockAlert && <StockAlertLegend />}
    </div>
  );
}
