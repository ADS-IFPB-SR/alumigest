import { Table } from '../../../components/ui/Table';
import { useFilms } from '../hooks/useCatalog';
import type { FilmDTO } from '../types';

const columns = [
  { 
    header: 'Nome', 
    accessor: (row: FilmDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span> 
  },
  { 
    header: 'Cor/Acabamento', 
    accessor: (row: FilmDTO) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.colorFinish}</span> 
  },
  { 
    header: 'Preço/m²', 
    accessor: (row: FilmDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.salePrice.toFixed(2).replace('.', ',')}</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: FilmDTO) => void;
  onViewDetails: (item: FilmDTO) => void;
}

export function FilmTab({ onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useFilms();
  const films = data?.content || [];

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando películas...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={films} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
