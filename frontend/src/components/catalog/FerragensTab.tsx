import { Table } from '../ui/Table';

const mockData = [
  { id: 1, codigo: "FER-ROL-SUP-01", nome: "Roldana Superior p/ Porta Correr", unidade: "UNIDADE", preco: 45.00 },
  { id: 2, codigo: "FER-FEC-BATE-01", nome: "Fechadura Bate-fecha", unidade: "UNIDADE", preco: 89.90 },
];

const columns = [
  { 
    header: 'Código', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.codigo}</span> 
  },
  { 
    header: 'Nome', 
    accessor: (row: any) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.nome}</span> 
  },
  { 
    header: 'Unidade', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.unidade}</span> 
  },
  { 
    header: 'Preço Unitário', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.preco.toFixed(2).replace('.', ',')}</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: any) => void;
  onViewDetails: (item: any) => void;
}

export function FerragensTab({ onEdit, onViewDetails }: Props) {
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
