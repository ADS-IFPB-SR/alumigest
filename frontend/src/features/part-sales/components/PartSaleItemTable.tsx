import { Trash2 } from 'lucide-react';
import type { PartSaleItemDraft, MaterialCategoryType } from '../types';

interface PartSaleItemTableProps {
  readonly items: PartSaleItemDraft[];
  readonly onRemoveItem: (tempId: string) => void;
}

export function PartSaleItemTable({ items, onRemoveItem }: PartSaleItemTableProps) {
  const getCategoryBadge = (type: MaterialCategoryType) => {
    switch (type) {
      case 'HARDWARE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Ferragem</span>;
      case 'GLASS':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">Vidro</span>;
      case 'PROFILE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">Alumínio</span>;
      case 'FILM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">Película</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  const formatDimensions = (item: PartSaleItemDraft) => {
    if (item.materialType === 'HARDWARE') {
      return '-';
    }
    if (item.widthMm && item.heightMm) {
      const areaText = item.calculatedAreaSqm ? ` (${item.calculatedAreaSqm.toFixed(2)} m²)` : '';
      return `${item.widthMm} × ${item.heightMm} mm${areaText}`;
    }
    if (item.linearMeters) {
      return `${item.linearMeters.toFixed(2)} m`;
    }
    return '-';
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
          Itens Adicionados à Venda
        </span>
        <span id="badgeTotalItems" className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Item / Descrição</th>
              <th className="py-2.5 px-3">Categoria</th>
              <th className="py-2.5 px-3">Dimensões</th>
              <th className="py-2.5 px-3 text-center">Qtd</th>
              <th className="py-2.5 px-3 text-right">Preço Venda</th>
              <th className="py-2.5 px-3 text-right">Subtotal</th>
              <th className="py-2.5 px-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody id="tableItemsBody" className="divide-y divide-slate-100 font-medium">
            {items.map((item) => (
              <tr key={item.tempId} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  {item.description}
                  {item.notes && <p className="text-[11px] text-slate-400 font-normal">{item.notes}</p>}
                </td>
                <td className="py-2.5 px-3">{getCategoryBadge(item.materialType)}</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">{formatDimensions(item)}</td>
                <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(item.totalPrice)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.tempId)}
                    title="Excluir item"
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div id="emptyTableAlert" className="p-6 text-center text-slate-400 text-xs">
          NENHUM MATERIAL ADICIONADO AINDA. PREENCHA OS CAMPOS ACIMA.
        </div>
      )}
    </div>
  );
}

