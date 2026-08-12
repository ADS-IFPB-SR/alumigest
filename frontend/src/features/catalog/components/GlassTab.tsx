import { Table } from '../../../components/ui/Table';
import { useGlasses } from '../hooks/useCatalog';
import type { GlassDTO } from '../types';

const columns = [
  { 
    header: 'ID', 
    accessor: (row: GlassDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.id}</span> 
  },
  { 
    header: 'Nome', 
    accessor: (row: GlassDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span> 
  },
  { 
    header: 'Especificações', 
    accessor: (row: GlassDTO) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.thicknessMm}mm | {row.colorFinish}</span> 
  },
  { 
    header: 'Preço Unitário (m²)', 
    accessor: (row: GlassDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.pricePerSqm.toFixed(2).replace('.', ',')}</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: GlassDTO) => void;
  onViewDetails: (item: GlassDTO) => void;
}

export function GlassTab({ onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useGlasses();
  const glasses = data?.content || [];

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando vidros...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={glasses} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
