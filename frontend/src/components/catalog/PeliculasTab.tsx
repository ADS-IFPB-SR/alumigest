import { Table } from '../ui/Table';

const mockData = [
  { id: 1, nome: "Película Jateada", tipo: "JATEADO", preco: 35.00 },
  { id: 2, nome: "Película G5", tipo: "FUME", preco: 25.00 },
];

const columns = [
  { 
    header: 'Nome', 
    accessor: (row: any) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.nome}</span> 
  },
  { 
    header: 'Tipo', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.tipo}</span> 
  },
  { 
    header: 'Preço/m²', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.preco.toFixed(2).replace('.', ',')}</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: any) => void;
  onViewDetails: (item: any) => void;
}

export function PeliculasTab({ onEdit, onViewDetails }: Props) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={mockData} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
