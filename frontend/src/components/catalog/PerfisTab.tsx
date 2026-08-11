import { Table } from '../ui/Table';

const mockData = [
  { id: 1, codigo: "ALU-SUP-MON-01", descricao: "Montante Suprema 25x50", peso: 0.450, preco: 28.50 },
  { id: 2, codigo: "ALU-SUP-TRIL-02", descricao: "Trilho Superior Suprema", peso: 0.800, preco: 45.00 },
];

const columns = [
  { 
    header: 'Código', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.codigo}</span> 
  },
  { 
    header: 'Descrição', 
    accessor: (row: any) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.descricao}</span> 
  },
  { 
    header: 'Peso (Kg/m)', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.peso.toFixed(3).replace('.', ',')}</span>,
  },
  { 
    header: 'Preço/m linear', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.preco.toFixed(2).replace('.', ',')}</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: any) => void;
  onViewDetails: (item: any) => void;
}

export function PerfisTab({ onEdit, onViewDetails }: Props) {
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
