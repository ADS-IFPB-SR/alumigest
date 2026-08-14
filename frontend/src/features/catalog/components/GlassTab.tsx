import { Table } from '../../../components/ui/Table';
import { useGlasses } from '../hooks/useCatalog';
import type { GlassDTO } from '../types';

const columns = [
  { 
    header: 'Referência', 
    accessor: (row: GlassDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant dark:text-outline-variant">{row.commercialReference || row.skuCode}</span>,
    exportValue: (row: GlassDTO) => row.commercialReference || row.skuCode
  },
  { 
    header: 'Descrição', 
    accessor: (row: GlassDTO) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span>,
    exportValue: (row: GlassDTO) => row.name
  },
  { 
    header: 'Cor', 
    accessor: (row: GlassDTO) => <span className="text-secondary dark:text-outline-variant">{row.colorFinish}</span>,
    exportValue: (row: GlassDTO) => row.colorFinish
  },
  { 
    header: 'Espessura', 
    accessor: (row: GlassDTO) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">{row.thicknessMm} mm</span>,
    exportValue: (row: GlassDTO) => `${row.thicknessMm} mm`
  },
  { 
    header: 'Preço Venda', 
    accessor: (row: GlassDTO) => <span className="font-data-mono text-data-mono text-on-surface dark:text-inverse-on-surface">R$ {(row.salePrice || 0).toFixed(2).replace('.', ',')}</span>,
    exportValue: (row: GlassDTO) => `R$ ${(row.salePrice || 0).toFixed(2).replace('.', ',')}`,
    align: 'right' as const
  },
  {
    header: 'Status',
    accessor: (row: GlassDTO) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
        row.active 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: GlassDTO) => row.active ? 'Ativo' : 'Inativo',
    align: 'center' as const
  }
];

interface Props {
  searchQuery: string;
  onEdit: (item: GlassDTO) => void;
  onViewDetails: (item: GlassDTO) => void;
}

export function GlassTab({ searchQuery, onEdit, onViewDetails }: Props) {
  const { data, isLoading } = useGlasses();
  const glasses = data?.content || [];

  const filteredGlasses = glasses.filter(g => {
    const term = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(term) || 
           (g.commercialReference && g.commercialReference.toLowerCase().includes(term)) ||
           (g.skuCode && g.skuCode.toLowerCase().includes(term));
  });

  if (isLoading) {
    return <div className="p-md text-secondary">Carregando vidros...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={filteredGlasses} 
        onEdit={(row) => onEdit(row)} 
        onViewDetails={(row) => onViewDetails(row)} 
      />
    </div>
  );
}
