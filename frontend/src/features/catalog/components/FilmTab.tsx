import { Table } from '../../../components/ui/Table';
import { useFilms } from '../hooks/useCatalog';
import type { FilmDTO } from '../types';
import { filterByStatus } from '../utils/filters';

const columns = [
  {
    header: 'Referência',
    accessor: (row: FilmDTO) => (
      <span
        data-cy="film-reference"
        className="font-data-mono text-data-mono text-on-surface-variant"
      >
        {row.commercialReference || row.skuCode}
      </span>
    ),
    exportValue: (row: FilmDTO) =>
      row.commercialReference || row.skuCode,
  },

  {
    header: 'Descrição',
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
    accessor: (row: FilmDTO) => (
      <span
        data-cy="film-sale-price"
        className="font-data-mono text-data-mono text-on-surface"
      >
        R${' '}
        {row.salePrice
          .toFixed(2)
          .replace('.', ',')}
      </span>
    ),
    exportValue: (row: FilmDTO) =>
      `R$ ${row.salePrice
        .toFixed(2)
        .replace('.', ',')}`,
    align: 'right' as const,
  },

  {
    header: 'Status',
    accessor: (row: FilmDTO) => (
      <span
        data-cy="film-status"
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
          row.active
            ? 'border border-success/30 bg-success/10 text-success'
            : 'border border-error/30 bg-error/10 text-error'
        }`}
      >
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: FilmDTO) =>
      row.active ? 'Ativo' : 'Inativo',
    align: 'center' as const,
  },
];

interface Props {
  searchQuery: string;
  filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onEdit: (item: FilmDTO) => void;
  onViewDetails: (item: FilmDTO) => void;
}

export function FilmTab({
  searchQuery,
  filterStatus,
  onEdit,
  onViewDetails,
}: Props) {
  const {
    data,
    isLoading,
  } = useFilms();

  const films = data?.content || [];

  const filteredFilms = films.filter((film) => {
    if (!filterByStatus(film, filterStatus)) {
      return false;
    }

    const term = searchQuery.toLowerCase();

    return (
      film.name.toLowerCase().includes(term) ||
      (
        film.commercialReference &&
        film.commercialReference
          .toLowerCase()
          .includes(term)
      ) ||
      (
        film.skuCode &&
        film.skuCode
          .toLowerCase()
          .includes(term)
      )
    );
  });

  if (isLoading) {
    return (
      <div
        data-cy="film-loading"
        className="p-md text-secondary"
      >
        Carregando películas...
      </div>
    );
  }

  return (
    <div
      data-cy="film-table"
      className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md"
    >
      <Table
        columns={columns}
        data={filteredFilms}
        onEdit={(row) => onEdit(row)}
        onViewDetails={(row) => onViewDetails(row)}
        rowTestId={() => 'film-row'}
        rowTestAttributes={(row) => ({
          'data-film-name': row.name,
        })}
      />
    </div>
  );
}