import { Table } from '../../../components/ui/Table';
import { useGlasses } from '../hooks/useCatalog';
import type { GlassDTO } from '../types';
import { filterByStatus } from '../utils/filters';

const columns = [
  {
    header: 'Referência',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-reference"
        className="font-data-mono text-data-mono text-on-surface-variant"
      >
        {row.commercialReference || row.skuCode}
      </span>
    ),
    exportValue: (row: GlassDTO) =>
      row.commercialReference || row.skuCode,
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
      <span
        data-cy="glass-color-finish"
        className="text-secondary"
      >
        {row.colorFinish}
      </span>
    ),
    exportValue: (row: GlassDTO) => row.colorFinish,
  },

  {
    header: 'Espessura',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-thickness"
        className="font-data-mono text-data-mono text-secondary"
      >
        {row.thicknessMm} mm
      </span>
    ),
    exportValue: (row: GlassDTO) => `${row.thicknessMm} mm`,
  },

  {
    header: 'Preço Venda',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-sale-price"
        className="font-data-mono text-data-mono text-on-surface"
      >
        R${' '}
        {(row.salePrice || 0)
          .toFixed(2)
          .replace('.', ',')}
      </span>
    ),
    exportValue: (row: GlassDTO) =>
      `R$ ${(row.salePrice || 0)
        .toFixed(2)
        .replace('.', ',')}`,
    align: 'right' as const,
  },

  {
    header: 'Status',
    accessor: (row: GlassDTO) => (
      <span
        data-cy="glass-status"
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
          row.active
            ? 'border border-success/30 bg-success/10 text-success'
            : 'border border-error/30 bg-error/10 text-error'
        }`}
      >
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: GlassDTO) =>
      row.active ? 'Ativo' : 'Inativo',
    align: 'center' as const,
  },
];

interface Props {
  searchQuery: string;
  filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onEdit: (item: GlassDTO) => void;
  onViewDetails: (item: GlassDTO) => void;
}

export function GlassTab({
  searchQuery,
  filterStatus,
  onEdit,
  onViewDetails,
}: Props) {
  const { data, isLoading } = useGlasses();

  const glasses = data?.content || [];

  const filteredGlasses = glasses.filter((g) => {
    if (!filterByStatus(g, filterStatus)) {
      return false;
    }

    const term = searchQuery.toLowerCase();

    return (
      g.name.toLowerCase().includes(term) ||
      (g.commercialReference &&
        g.commercialReference
          .toLowerCase()
          .includes(term)) ||
      (g.skuCode &&
        g.skuCode.toLowerCase().includes(term))
    );
  });

  if (isLoading) {
    return (
      <div
        data-cy="glass-loading"
        className="p-md text-secondary"
      >
        Carregando vidros...
      </div>
    );
  }

  return (
    <div
      data-cy="glass-table"
      className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md"
    >
      <Table
        columns={columns}
        data={filteredGlasses}
        onEdit={(row) => onEdit(row)}
        onViewDetails={(row) => onViewDetails(row)}
        rowTestId={() => 'glass-row'}
        rowTestAttributes={(row) => ({
          'data-glass-name': row.name,
        })}
      />
    </div>
  );
}