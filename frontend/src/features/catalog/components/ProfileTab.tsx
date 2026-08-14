import { Table } from '../../../components/ui/Table';
import { useProfiles } from '../hooks/useCatalog';
import type { ProfileDTO } from '../types';

const columns = [
  { 
    header: 'Código', 
    accessor: (row: ProfileDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.commercialReference}</span>,
    exportValue: (row: ProfileDTO) => row.commercialReference
  },
  { 
    header: 'Descrição', 
    accessor: (row: ProfileDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span>,
    exportValue: (row: ProfileDTO) => row.name
  },
  { 
    header: 'Tam. Barra (m)', 
    accessor: (row: ProfileDTO) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.standardLengthM.toFixed(1).replace('.', ',')}</span>,
    exportValue: (row: ProfileDTO) => row.standardLengthM.toFixed(1).replace('.', ',')
  },
  { 
    header: 'Preço Venda', 
    accessor: (row: ProfileDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.salePrice.toFixed(2).replace('.', ',')}</span>,
    exportValue: (row: ProfileDTO) => `R$ ${row.salePrice.toFixed(2).replace('.', ',')}`,
    align: 'right' as const
  },
  {
    header: 'Status',
    accessor: (row: ProfileDTO) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
        row.active 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: ProfileDTO) => row.active ? 'Ativo' : 'Inativo',
    align: 'center' as const
  }
];

interface Props {
  searchQuery: string;
  onEdit: (item: ProfileDTO) => void;
  onViewDetails: (item: ProfileDTO) => void;
}

export function ProfileTab({ searchQuery, onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useProfiles();
  const profiles = data?.content || [];

  const filteredProfiles = profiles.filter(p => {
    const term = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(term) || 
           p.commercialReference.toLowerCase().includes(term);
  });

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando perfis...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={filteredProfiles} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
