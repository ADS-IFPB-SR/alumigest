import { Table } from '../../../components/ui/Table';
import { useProfiles } from '../hooks/useCatalog';
import type { ProfileDTO } from '../types';
import { filterByStatus } from '../utils/filters';

const columns = [
  {
    header: 'Código',
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-reference"
        className="font-data-mono text-data-mono text-on-surface-variant"
      >
        {row.commercialReference}
      </span>
    ),
    exportValue: (row: ProfileDTO) =>
      row.commercialReference,
  },

  {
    header: 'Descrição',
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
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-length"
        className="font-data-mono text-data-mono text-secondary"
      >
        {row.standardLengthM
          .toFixed(1)
          .replace('.', ',')}
      </span>
    ),
    exportValue: (row: ProfileDTO) =>
      row.standardLengthM.toFixed(1).replace('.', ','),
  },

  {
    header: 'Preço Venda',
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-sale-price"
        className="font-data-mono text-data-mono text-on-surface"
      >
        R${' '}
        {row.salePrice
          .toFixed(2)
          .replace('.', ',')}
      </span>
    ),
    exportValue: (row: ProfileDTO) =>
      `R$ ${row.salePrice
        .toFixed(2)
        .replace('.', ',')}`,
    align: 'right' as const,
  },

  {
    header: 'Status',
    accessor: (row: ProfileDTO) => (
      <span
        data-cy="profile-status"
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
          row.active
            ? 'border border-success/30 bg-success/10 text-success'
            : 'border border-error/30 bg-error/10 text-error'
        }`}
      >
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: ProfileDTO) =>
      row.active ? 'Ativo' : 'Inativo',
    align: 'center' as const,
  },
];

interface Props {
  searchQuery: string;
  filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onEdit: (item: ProfileDTO) => void;
  onViewDetails: (item: ProfileDTO) => void;
}

export function ProfileTab({
  searchQuery,
  filterStatus,
  onEdit,
  onViewDetails,
}: Props) {
  const { data, isLoading } = useProfiles();

  const profiles = data?.content || [];

  const filteredProfiles = profiles.filter((profile) => {
    if (!filterByStatus(profile, filterStatus)) {
      return false;
    }

    const term = searchQuery.toLowerCase();

    return (
      profile.name.toLowerCase().includes(term) ||
      (
        profile.commercialReference &&
        profile.commercialReference
          .toLowerCase()
          .includes(term)
      )
    );
  });

  if (isLoading) {
    return (
      <div
        data-cy="profile-loading"
        className="p-md text-secondary"
      >
        Carregando perfis...
      </div>
    );
  }

  return (
    <div
      data-cy="profile-table"
      className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md"
    >
      <Table
        columns={columns}
        data={filteredProfiles}
        onEdit={(row) => onEdit(row)}
        onViewDetails={(row) => onViewDetails(row)}
        rowTestId={() => 'profile-row'}
        rowTestAttributes={(row) => ({
          'data-profile-name': row.name,
        })}
      />
    </div>
  );
}