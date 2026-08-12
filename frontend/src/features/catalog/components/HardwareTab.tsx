import { Table } from '../../../components/ui/Table';
import { useHardwares } from '../hooks/useCatalog';
import type { HardwareDTO } from '../types';

const columns = [
  { 
    header: 'Código', 
    accessor: (row: HardwareDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.skuCode}</span> 
  },
  { 
    header: 'Nome', 
    accessor: (row: HardwareDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span> 
  },
  { 
    header: 'Unidade', 
    accessor: (row: HardwareDTO) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.unitMeasure}</span> 
  },
  { 
    header: 'Preço Unitário', 
    accessor: (row: HardwareDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.salePrice.toFixed(2).replace('.', ',')}</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: HardwareDTO) => void;
  onViewDetails: (item: HardwareDTO) => void;
}

export function HardwareTab({ onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useHardwares();
  const hardwares = data?.content || [];

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando ferragens...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={hardwares} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
