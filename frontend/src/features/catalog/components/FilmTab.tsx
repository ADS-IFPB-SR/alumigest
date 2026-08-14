import { Table } from '../../../components/ui/Table';
import { useFilms } from '../hooks/useCatalog';
import type { FilmDTO } from '../types';

const columns = [
  { 
    header: 'Referência', 
    accessor: (row: FilmDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.commercialReference || row.skuCode}</span>,
    exportValue: (row: FilmDTO) => row.commercialReference || row.skuCode
  },
  { 
    header: 'Descrição', 
    accessor: (row: FilmDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span>,
    exportValue: (row: FilmDTO) => row.name
  },
  { 
    header: 'Preço Venda (m²)', 
    accessor: (row: FilmDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.salePrice.toFixed(2).replace('.', ',')}</span>,
    exportValue: (row: FilmDTO) => `R$ ${row.salePrice.toFixed(2).replace('.', ',')}`,
    align: 'right' as const
  },
  {
    header: 'Status',
    accessor: (row: FilmDTO) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
        row.active 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: FilmDTO) => row.active ? 'Ativo' : 'Inativo',
    align: 'center' as const
  }
];

interface Props {
  searchQuery: string;
  onEdit: (item: FilmDTO) => void;
  onViewDetails: (item: FilmDTO) => void;
}

export function FilmTab({ searchQuery, onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useFilms();
  const films = data?.content || [];

  const filteredFilms = films.filter(f => {
    const term = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(term) || 
           (f.commercialReference && f.commercialReference.toLowerCase().includes(term)) ||
           (f.skuCode && f.skuCode.toLowerCase().includes(term));
  });

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando películas...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={filteredFilms} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
