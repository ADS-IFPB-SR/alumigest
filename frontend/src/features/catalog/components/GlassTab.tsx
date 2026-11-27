import type { StockItem } from '@/features/stock';
import { useGlasses } from '../hooks/useCatalog';
import type { GlassDTO } from '../types';
import { filterByStatus } from '../utils/filters';
import type { CatalogTableColumn } from '../utils/stockColumns';
import { CatalogMaterialSection } from './CatalogMaterialSection';
import type { MobileCardMetadata } from './CatalogMobileMaterialCard';

const formatGlassPrice = (row: GlassDTO) =>
  `R$ ${(row.salePrice || 0).toFixed(2).replace('.', ',')}`;

const specColumns: readonly CatalogTableColumn<GlassDTO>[] = [
  {
    header: 'Referência',
    className: 'whitespace-nowrap',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-reference"
        className="font-data-mono text-data-mono text-on-surface-variant"
      >
        {row.commercialReference || row.skuCode || '—'}
      </span>
    ),
    exportValue: (row: GlassDTO) => row.commercialReference || row.skuCode,
  },
  {
    header: 'Descrição',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-name"
        className="font-title-sm text-title-sm text-on-surface font-semibold"
      >
        {row.name}
      </span>
    ),
    exportValue: (row: GlassDTO) => row.name,
  },
  {
    header: 'Cor',
    accessor: (row: GlassDTO) => (
      <span data-cy="glass-color-finish" className="text-secondary">
        {row.colorFinish}
      </span>
    ),
    exportValue: (row: GlassDTO) => row.colorFinish,
  },
  {
    header: 'Espessura',
    className: 'whitespace-nowrap',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-thickness"
        className="font-data-mono text-data-mono text-secondary whitespace-nowrap"
      >
        {row.thicknessMm} mm
      </span>
    ),
    exportValue: (row: GlassDTO) => `${row.thicknessMm} mm`,
  },
  {
    header: 'Preço Venda',
    className: 'whitespace-nowrap',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-sale-price"
        className="font-data-mono text-data-mono text-on-surface whitespace-nowrap"
      >
        {formatGlassPrice(row)}
      </span>
    ),
    exportValue: formatGlassPrice,
    align: 'right',
  },
];

const mobileMeta: MobileCardMetadata<GlassDTO> = {
  reference: (row) => row.commercialReference || row.skuCode || '-',
  name: (row) => row.name,
  specSummary: (row) => `${row.colorFinish} · ${row.thicknessMm} mm`,
  priceLabel: formatGlassPrice,
};

interface Props {
  readonly searchQuery: string;
  readonly filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  readonly stockByMaterialId?: ReadonlyMap<string, StockItem>;
  readonly onlyNeedsPurchase?: boolean;
  readonly hideStockAlert?: boolean;
  readonly onEdit: (item: GlassDTO) => void;
  readonly onViewDetails: (item: GlassDTO) => void;
  readonly onOpenKardex?: (item: GlassDTO) => void;
}

export function GlassTab({
  searchQuery,
  filterStatus,
  stockByMaterialId,
  onlyNeedsPurchase,
  hideStockAlert,
  onEdit,
  onViewDetails,
  onOpenKardex,
}: Props) {
  const { data, isLoading } = useGlasses();

  const glasses = data?.content || [];

  const filteredGlasses = glasses.filter((g) => {
    if (!filterByStatus(g, filterStatus)) {
      return false;
    }

    const term = searchQuery.trim().toLowerCase();

    return (
      g.name.toLowerCase().includes(term) ||
      Boolean(g.commercialReference?.toLowerCase().includes(term)) ||
      Boolean(g.skuCode?.toLowerCase().includes(term))
    );
  });

  return (
    <CatalogMaterialSection
      dataCyContainer="glass-table"
      dataCyLoading="glass-loading"
      loadingMessage="Carregando vidros..."
      isLoading={isLoading}
      rows={filteredGlasses}
      specColumns={specColumns}
      statusDataCy="glass-status"
      defaultUnitMeasure="M2"
      stockByMaterialId={stockByMaterialId}
      onlyNeedsPurchase={onlyNeedsPurchase}
      hideStockAlert={hideStockAlert}
      mobileMeta={mobileMeta}
      rowTestId="glass-row"
      rowTestAttributes={(row) => ({ 'data-glass-name': row.name })}
      onEdit={onEdit}
      onViewDetails={onViewDetails}
      onOpenKardex={onOpenKardex}
    />
  );
}
