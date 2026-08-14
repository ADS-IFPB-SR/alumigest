import { Table } from '../../../components/ui/Table';
import { useHardwares } from '../hooks/useCatalog';
import type { HardwareDTO } from '../types';

const columns = [
  { 
    header: 'Código', 
    accessor: (row: HardwareDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.commercialReference}</span>,
    exportValue: (row: HardwareDTO) => row.commercialReference
  },
  { 
    header: 'Descrição', 
    accessor: (row: HardwareDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span>,
    exportValue: (row: HardwareDTO) => row.name
  },
  { 
    header: 'Unidade', 
    accessor: (row: HardwareDTO) => <span className="text-secondary dark:text-outline-variant">{row.unitMeasure === 'PAIR' ? 'Par' : 'Unidade'}</span>,
    exportValue: (row: HardwareDTO) => row.unitMeasure === 'PAIR' ? 'Par' : 'Unidade'
  },
  { 
    header: 'Preço Venda', 
    accessor: (row: HardwareDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.salePrice.toFixed(2).replace('.', ',')}</span>,
    exportValue: (row: HardwareDTO) => `R$ ${row.salePrice.toFixed(2).replace('.', ',')}`,
    align: 'right' as const
  },
  {
    header: 'Status',
    accessor: (row: HardwareDTO) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
        row.active 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: HardwareDTO) => row.active ? 'Ativo' : 'Inativo',
    align: 'center' as const
  }
];

interface Props {
  searchQuery: string;
  onEdit: (item: HardwareDTO) => void;
  onViewDetails: (item: HardwareDTO) => void;
}

export function HardwareTab({ searchQuery, onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useHardwares();
  const hardwares = data?.content || [];

  const filteredHardwares = hardwares.filter(h => {
    const term = searchQuery.toLowerCase();
    return h.name.toLowerCase().includes(term) || 
           (h.commercialReference && h.commercialReference.toLowerCase().includes(term));
  });

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando ferragens...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={filteredHardwares} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
