import type { StockItem } from '@/features/stock';
import { useHardwares } from '../hooks/useCatalog';
import type { HardwareDTO } from '../types';
import { filterByStatus } from '../utils/filters';
import type { CatalogTableColumn } from '../utils/stockColumns';
import { CatalogMaterialSection } from './CatalogMaterialSection';
import type { MobileCardMetadata } from './CatalogMobileMaterialCard';

const UNIT_LABELS: Readonly<Record<string, string>> = {
  UN: 'Unidade',
  PAR: 'Par',
  METRO: 'Metro Linear',
};

const formatHardwareUnit = (row: HardwareDTO) =>
  UNIT_LABELS[row.unitMeasure] || row.unitMeasure;

const formatHardwarePrice = (row: HardwareDTO) =>
  `R$ ${(row.salePrice ?? 0).toFixed(2).replace('.', ',')}`;

const specColumns: readonly CatalogTableColumn<HardwareDTO>[] = [
  {
    header: 'Código',
    className: 'whitespace-nowrap',
    accessor: (row: HardwareDTO) => (
      <span
        data-cy="hardware-reference"
        className="font-data-mono text-data-mono text-on-surface-variant whitespace-nowrap"
      >
        {row.skuCode || '—'}
      </span>
    ),
    exportValue: (row: HardwareDTO) => row.skuCode || '',
  },
  {
    header: 'Descrição',
    className: 'min-w-[180px]',
    accessor: (row: HardwareDTO) => (
      <span
        data-cy="hardware-name"
        className="font-title-sm text-title-sm text-on-surface font-semibold"
      >
        {row.name}
      </span>
    ),
    exportValue: (row: HardwareDTO) => row.name,
  },
  {
    header: 'Unidade',
    className: 'whitespace-nowrap',
    accessor: (row: HardwareDTO) => (
      <span data-cy="hardware-unit" className="text-secondary whitespace-nowrap">
        {formatHardwareUnit(row)}
      </span>
    ),
    exportValue: formatHardwareUnit,
  },
  {
    header: 'Preço Venda',
    className: 'whitespace-nowrap',
    accessor: (row: HardwareDTO) => (
      <span
        data-cy="hardware-sale-price"
        className="font-data-mono text-data-mono text-on-surface whitespace-nowrap"
      >
        {formatHardwarePrice(row)}
      </span>
    ),
    exportValue: formatHardwarePrice,
    align: 'right',
  },
];

const mobileMeta: MobileCardMetadata<HardwareDTO> = {
  reference: (row) => row.skuCode || row.commercialReference || '-',
  name: (row) => row.name,
  specSummary: formatHardwareUnit,
  priceLabel: formatHardwarePrice,
};

interface Props {
  readonly searchQuery: string;
  readonly filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  readonly stockByMaterialId?: ReadonlyMap<string, StockItem>;
  readonly onlyNeedsPurchase?: boolean;
  readonly hideStockAlert?: boolean;
  readonly onEdit: (item: HardwareDTO) => void;
  readonly onViewDetails: (item: HardwareDTO) => void;
  readonly onOpenKardex?: (item: HardwareDTO) => void;
}

export function HardwareTab({
  searchQuery,
  filterStatus,
  stockByMaterialId,
  onlyNeedsPurchase,
  hideStockAlert,
  onEdit,
  onViewDetails,
  onOpenKardex,
}: Props) {
  const { data, isLoading } = useHardwares();

  const hardwares = data?.content || [];

  const filteredHardwares = hardwares.filter((hardware) => {
    if (!filterByStatus(hardware, filterStatus)) {
      return false;
    }

    const term = searchQuery.trim().toLowerCase();

    return (
      hardware.name.toLowerCase().includes(term) ||
      Boolean(hardware.commercialReference?.toLowerCase().includes(term)) ||
      Boolean(hardware.skuCode?.toLowerCase().includes(term))
    );
  });

  return (
    <CatalogMaterialSection
      dataCyContainer="hardware-table"
      dataCyLoading="hardware-loading"
      loadingMessage="Carregando ferragens..."
      isLoading={isLoading}
      rows={filteredHardwares}
      specColumns={specColumns}
      statusDataCy="hardware-status"
      defaultUnitMeasure="UN"
      stockByMaterialId={stockByMaterialId}
      onlyNeedsPurchase={onlyNeedsPurchase}
      hideStockAlert={hideStockAlert}
      mobileMeta={mobileMeta}
      rowTestId="hardware-row"
      rowTestAttributes={(row) => ({ 'data-hardware-name': row.name })}
      onEdit={onEdit}
      onViewDetails={onViewDetails}
      onOpenKardex={onOpenKardex}
    />
  );
}
