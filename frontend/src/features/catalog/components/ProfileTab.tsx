import type { StockItem } from '@/features/stock';
import { useProfiles } from '../hooks/useCatalog';
import type { ProfileDTO } from '../types';
import { filterByStatus } from '../utils/filters';
import type { CatalogTableColumn } from '../utils/stockColumns';
import { CatalogMaterialSection } from './CatalogMaterialSection';
import type { MobileCardMetadata } from './CatalogMobileMaterialCard';

const formatProfileLength = (row: ProfileDTO) =>
  (row.standardLengthM ?? 0).toFixed(1).replace('.', ',');

const formatProfilePrice = (row: ProfileDTO) =>
  `R$ ${(row.salePrice ?? 0).toFixed(2).replace('.', ',')}`;

const specColumns: readonly CatalogTableColumn<ProfileDTO>[] = [
  {
    header: 'Código',
    className: 'whitespace-nowrap',
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-reference"
        className="font-data-mono text-data-mono text-on-surface-variant whitespace-nowrap"
      >
        {row.commercialReference || '—'}
      </span>
    ),
    exportValue: (row: ProfileDTO) => row.commercialReference,
  },
  {
    header: 'Descrição',
    className: 'min-w-[180px]',
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-name"
        className="font-title-sm text-title-sm text-on-surface font-semibold"
      >
        {row.name}
      </span>
    ),
    exportValue: (row: ProfileDTO) => row.name,
  },
  {
    header: 'Tam. Barra (m)',
    className: 'whitespace-nowrap',
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-length"
        className="font-data-mono text-data-mono text-secondary whitespace-nowrap"
      >
        {formatProfileLength(row)}
      </span>
    ),
    exportValue: formatProfileLength,
  },
  {
    header: 'Preço Venda',
    className: 'whitespace-nowrap',
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-sale-price"
        className="font-data-mono text-data-mono text-on-surface whitespace-nowrap"
      >
        {formatProfilePrice(row)}
      </span>
    ),
    exportValue: formatProfilePrice,
    align: 'right',
  },
];

const mobileMeta: MobileCardMetadata<ProfileDTO> = {
  reference: (row) => row.commercialReference || '-',
  name: (row) => row.name,
  specSummary: (row) => `Barra ${formatProfileLength(row)} m`,
  priceLabel: formatProfilePrice,
};

interface Props {
  readonly searchQuery: string;
  readonly filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  readonly stockByMaterialId?: ReadonlyMap<string, StockItem>;
  readonly onlyNeedsPurchase?: boolean;
  readonly hideStockAlert?: boolean;
  readonly onEdit: (item: ProfileDTO) => void;
  readonly onViewDetails: (item: ProfileDTO) => void;
}

export function ProfileTab({
  searchQuery,
  filterStatus,
  stockByMaterialId,
  onlyNeedsPurchase,
  hideStockAlert,
  onEdit,
  onViewDetails,
}: Props) {
  const { data, isLoading } = useProfiles();

  const profiles = data?.content || [];

  const filteredProfiles = profiles.filter((profile) => {
    if (!filterByStatus(profile, filterStatus)) {
      return false;
    }

    const term = searchQuery.trim().toLowerCase();

    return (
      profile.name.toLowerCase().includes(term) ||
      Boolean(profile.commercialReference?.toLowerCase().includes(term))
    );
  });

  return (
    <CatalogMaterialSection
      dataCyContainer="profile-table"
      dataCyLoading="profile-loading"
      loadingMessage="Carregando perfis..."
      isLoading={isLoading}
      rows={filteredProfiles}
      specColumns={specColumns}
      statusDataCy="profile-status"
      defaultUnitMeasure="BARRA_6M"
      stockByMaterialId={stockByMaterialId}
      onlyNeedsPurchase={onlyNeedsPurchase}
      hideStockAlert={hideStockAlert}
      mobileMeta={mobileMeta}
      rowTestId="profile-row"
      rowTestAttributes={(row) => ({ 'data-profile-name': row.name })}
      onEdit={onEdit}
      onViewDetails={onViewDetails}
    />
  );
}
