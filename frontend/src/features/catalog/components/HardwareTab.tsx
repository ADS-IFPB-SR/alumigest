import { Table } from '../../../components/ui/Table';
import { useHardwares } from '../hooks/useCatalog';
import type { HardwareDTO } from '../types';
import { filterByStatus } from '../utils/filters';

const columns = [
  {
    header: 'Código',
    accessor: (row: HardwareDTO) => (
      <span
        data-cy="hardware-reference"
        className="font-data-mono text-data-mono text-on-surface-variant"
      >
        {row.skuCode}
      </span>
    ),
    exportValue: (row: HardwareDTO) =>
      row.skuCode || '',
  },

  {
    header: 'Descrição',
    accessor: (row: HardwareDTO) => (
      <span
        data-cy="hardware-name"
        className="font-title-sm text-title-sm text-on-surface font-semibold"
      >
        {row.name}
      </span>
    ),
    exportValue: (row: HardwareDTO) =>
      row.name,
  },

  {
    header: 'Unidade',
    accessor: (row: HardwareDTO) => {
      const unitMap: Record<
        string,
        string
      > = {
        UN: 'Unidade',
        PAR: 'Par',
        METRO: 'Metro Linear',
      };

      return (
        <span
          data-cy="hardware-unit"
          className="text-secondary"
        >
          {unitMap[row.unitMeasure] ||
            row.unitMeasure}
        </span>
      );
    },

    exportValue: (row: HardwareDTO) => {
      const unitMap: Record<
        string,
        string
      > = {
        UN: 'Unidade',
        PAR: 'Par',
        METRO: 'Metro Linear',
      };

      return (
        unitMap[row.unitMeasure] ||
        row.unitMeasure
      );
    },
  },

  {
    header: 'Preço Venda',
    accessor: (row: HardwareDTO) => (
      <span
        data-cy="hardware-sale-price"
        className="font-data-mono text-data-mono text-on-surface"
      >
        R${' '}
        {row.salePrice
          .toFixed(2)
          .replace('.', ',')}
      </span>
    ),

    exportValue: (row: HardwareDTO) =>
      `R$ ${row.salePrice
        .toFixed(2)
        .replace('.', ',')}`,

    align: 'right' as const,
  },

  {
    header: 'Status',

    accessor: (row: HardwareDTO) => (
      <span
        data-cy="hardware-status"
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
          row.active
            ? 'border border-success/30 bg-success/10 text-success'
            : 'border border-error/30 bg-error/10 text-error'
        }`}
      >
        {row.active
          ? 'Ativo'
          : 'Inativo'}
      </span>
    ),

    exportValue: (row: HardwareDTO) =>
      row.active
        ? 'Ativo'
        : 'Inativo',

    align: 'center' as const,
  },
];

interface Props {
  searchQuery: string;
  filterStatus:
    | 'ALL'
    | 'ACTIVE'
    | 'INACTIVE';
  onEdit: (
    item: HardwareDTO
  ) => void;
  onViewDetails: (
    item: HardwareDTO
  ) => void;
}

export function HardwareTab({
  searchQuery,
  filterStatus,
  onEdit,
  onViewDetails,
}: Props) {
  const {
    data,
    isLoading,
  } = useHardwares();

  const hardwares =
    data?.content || [];

  const filteredHardwares =
    hardwares.filter((hardware) => {
      if (
        !filterByStatus(
          hardware,
          filterStatus
        )
      ) {
        return false;
      }

      const term =
        searchQuery.toLowerCase();

      return (
        hardware.name
          .toLowerCase()
          .includes(term) ||
        (
          hardware.commercialReference &&
          hardware.commercialReference
            .toLowerCase()
            .includes(term)
        ) ||
        (
          hardware.skuCode &&
          hardware.skuCode
            .toLowerCase()
            .includes(term)
        )
      );
    });

  if (isLoading) {
    return (
      <div
        data-cy="hardware-loading"
        className="p-md text-secondary"
      >
        Carregando ferragens...
      </div>
    );
  }

  return (
    <div
      data-cy="hardware-table"
      className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md"
    >
      <Table
        columns={columns}
        data={filteredHardwares}
        onEdit={(row) =>
          onEdit(row)
        }
        onViewDetails={(row) =>
          onViewDetails(row)
        }
        rowTestId={() =>
          'hardware-row'
        }
        rowTestAttributes={(row) => ({
          'data-hardware-name':
            row.name,
        })}
      />
    </div>
  );
}