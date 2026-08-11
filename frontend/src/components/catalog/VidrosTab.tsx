import { Table } from '../ui/Table';

const mockData = [
  { id: 1, nome: "Vidro Temperado 8mm Incolor", codigo: "GL-TEMP-08-CL", especificacoes: "8mm | 2.5m x 1.8m", preco: 180.00 },
  { id: 2, nome: "Vidro Laminado Fumê", codigo: "GL-LAM-10-GR", especificacoes: "10mm (5+5) | PVB 0.38", preco: 210.00 },
  { id: 3, nome: "Vidro Comum Bronze", codigo: "GL-FLOAT-06-BR", especificacoes: "6mm | Float", preco: 85.00 },
];

const columns = [
  { 
    header: 'Código', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.codigo}</span> 
  },
  { 
    header: 'Nome/Referência', 
    accessor: (row: any) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.nome}</span> 
  },
  { 
    header: 'Especificações', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.especificacoes}</span> 
  },
  { 
    header: 'Preço Unitário', 
    accessor: (row: any) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {row.preco.toFixed(2).replace('.', ',')}/m²</span>,
    align: 'right' as const
  }
];

interface Props {
  onEdit: (item: any) => void;
  onViewDetails: (item: any) => void;
}

export function VidrosTab({ onEdit, onViewDetails }: Props) {
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
