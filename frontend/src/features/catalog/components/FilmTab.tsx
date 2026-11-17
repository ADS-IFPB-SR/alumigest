import type { StockItem } from '@/features/stock';
import { useFilms } from '../hooks/useCatalog';
import type { FilmDTO } from '../types';
import { filterByStatus } from '../utils/filters';
import type { CatalogTableColumn } from '../utils/stockColumns';
import { CatalogMaterialSection } from './CatalogMaterialSection';
import type { MobileCardMetadata } from './CatalogMobileMaterialCard';

const formatFilmPrice = (row: FilmDTO) =>
  `R$ ${(row.salePrice ?? 0).toFixed(2).replace('.', ',')}`;

const specColumns: readonly CatalogTableColumn<FilmDTO>[] = [
  {
    header: 'Referência',
    className: 'whitespace-nowrap',
    accessor: (row: FilmDTO) => (
      <span
        data-cy="film-reference"
        className="font-data-mono text-data-mono text-on-surface-variant whitespace-nowrap"
      >
        {row.commercialReference || row.skuCode || '—'}
      </span>
    ),
    exportValue: (row: FilmDTO) => row.commercialReference || row.skuCode,
  },
  {
    header: 'Descrição',
    className: 'min-w-[180px]',
    accessor: (row: FilmDTO) => (
      <span
        data-cy="film-name"
        className="font-title-sm text-title-sm text-on-surface font-semibold"
      >
        {row.name}
      </span>
    ),
    exportValue: (row: FilmDTO) => row.name,
  },
  {
    header: 'Preço Venda (m²)',
    className: 'whitespace-nowrap',
    accessor: (row: FilmDTO) => (
      <span
        data-cy="film-sale-price"
        className="font-data-mono text-data-mono text-on-surface whitespace-nowrap"
      >
        {formatFilmPrice(row)}
      </span>
    ),
    exportValue: formatFilmPrice,
    align: 'right',
  },
];

const mobileMeta: MobileCardMetadata<FilmDTO> = {
  reference: (row) => row.commercialReference || row.skuCode || '-',
  name: (row) => row.name,
  specSummary: (row) => row.colorFinish || '',
  priceLabel: (row) => `${formatFilmPrice(row)} / m²`,
};

interface Props {
  readonly searchQuery: string;
  readonly filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  readonly stockByMaterialId?: ReadonlyMap<string, StockItem>;
  readonly onlyNeedsPurchase?: boolean;
  readonly hideStockAlert?: boolean;
  readonly onEdit: (item: FilmDTO) => void;
  readonly onViewDetails: (item: FilmDTO) => void;
}

export function FilmTab({
  searchQuery,
  filterStatus,
  stockByMaterialId,
  onlyNeedsPurchase,
  hideStockAlert,
  onEdit,
  onViewDetails,
}: Props) {
  const { data, isLoading } = useFilms();

  const films = data?.content || [];

  const filteredFilms = films.filter((film) => {
    if (!filterByStatus(film, filterStatus)) {
      return false;
    }

    const term = searchQuery.trim().toLowerCase();

    return (
      film.name.toLowerCase().includes(term) ||
      Boolean(film.commercialReference?.toLowerCase().includes(term)) ||
      Boolean(film.skuCode?.toLowerCase().includes(term))
    );
  });

  return (
    <CatalogMaterialSection
      dataCyContainer="film-table"
      dataCyLoading="film-loading"
      loadingMessage="Carregando películas..."
      isLoading={isLoading}
      rows={filteredFilms}
      specColumns={specColumns}
      statusDataCy="film-status"
      defaultUnitMeasure="M2"
      stockByMaterialId={stockByMaterialId}
      onlyNeedsPurchase={onlyNeedsPurchase}
      hideStockAlert={hideStockAlert}
      mobileMeta={mobileMeta}
      rowTestId="film-row"
      rowTestAttributes={(row) => ({ 'data-film-name': row.name })}
      onEdit={onEdit}
      onViewDetails={onViewDetails}
    />
  );
}
