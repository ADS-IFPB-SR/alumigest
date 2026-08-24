import { Table } from '../../../components/ui/Table';
import { useHardwares } from '../hooks/useCatalog';
import type { HardwareDTO } from '../types';

const columns = [
 { 
 header: 'Código', 
 accessor: (row: HardwareDTO) => <span className="font-data-mono text-data-mono text-on-surface-variant">{row.skuCode}</span>,
 exportValue: (row: HardwareDTO) => row.skuCode || ''
 },
 { 
 header: 'Descrição', 
 accessor: (row: HardwareDTO) => <span className="font-title-sm text-title-sm text-on-surface font-semibold">{row.name}</span>,
 exportValue: (row: HardwareDTO) => row.name
 },
 { 
  header: 'Unidade', 
  accessor: (row: HardwareDTO) => {
    const map: Record<string, string> = { 'UN': 'Unidade', 'PAR': 'Par', 'METRO': 'Metro Linear' };
    return <span className="text-secondary">{map[row.unitMeasure] || row.unitMeasure}</span>;
  },
  exportValue: (row: HardwareDTO) => {
    const map: Record<string, string> = { 'UN': 'Unidade', 'PAR': 'Par', 'METRO': 'Metro Linear' };
    return map[row.unitMeasure] || row.unitMeasure;
  }
  },
 { 
 header: 'Preço Venda', 
 accessor: (row: HardwareDTO) => <span className="font-data-mono text-data-mono text-on-surface">R$ {row.salePrice.toFixed(2).replace('.', ',')}</span>,
 exportValue: (row: HardwareDTO) => `R$ ${row.salePrice.toFixed(2).replace('.', ',')}`,
 align: 'right' as const
 },
 {
 header: 'Status',
 accessor: (row: HardwareDTO) => (
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
 row.active 
 ? 'border border-success/30 bg-success/10 text-success' 
 : 'border border-error/30 bg-error/10 text-error'
 }`}>
 {row.active ? 'Ativo' : 'Inativo'}
 </span>
 ),
 exportValue: (row: HardwareDTO) => row.active ? 'Ativo' : 'Inativo',
 align: 'center' as const
 }
];

import { filterByStatus } from '../utils/filters';

interface Props {
 searchQuery: string;
 filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
 onEdit: (item: HardwareDTO) => void;
 onViewDetails: (item: HardwareDTO) => void;
}

export function HardwareTab({ searchQuery, filterStatus, onEdit, onViewDetails }: Props) {
 const { data, isLoading } = useHardwares();
 const hardwares = data?.content || [];

 const filteredHardwares = hardwares.filter(h => {
 if (!filterByStatus(h, filterStatus)) return false;

 const term = searchQuery.toLowerCase();
 return h.name.toLowerCase().includes(term) || 
 (h.commercialReference && h.commercialReference.toLowerCase().includes(term));
 });

 if (isLoading) {
 return <div className="p-md text-secondary">Carregando ferragens...</div>;
 }

 return (
 <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
 <Table 
 columns={columns} 
 data={filteredHardwares} 
 onEdit={(row) => onEdit(row)} 
 onViewDetails={(row) => onViewDetails(row)} 
 />
 </div>
 );
}
