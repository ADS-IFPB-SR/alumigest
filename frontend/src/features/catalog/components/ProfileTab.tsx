import { Table } from '../../../components/ui/Table';
import { useProfiles } from '../hooks/useCatalog';
import type { ProfileDTO } from '../types';

const columns = [
  { 
    header: 'Código', 
    accessor: (row: ProfileDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.skuCode}</span> 
  },
  { 
    header: 'Descrição', 
    accessor: (row: ProfileDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.description}</span> 
  },
  { 
    header: 'Peso (Kg/m)', 
    accessor: (row: ProfileDTO) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.weightPerMeterKg.toFixed(3).replace('.', ',')}</span>,
  },
  { 
    header: 'Preço/m linear', 
    accessor: (row: ProfileDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.pricePerMeter.toFixed(2).replace('.', ',')}</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: ProfileDTO) => void;
  onViewDetails: (item: ProfileDTO) => void;
}

export function ProfileTab({ onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useProfiles();
  const profiles = data?.content || [];

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando perfis...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={profiles} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
