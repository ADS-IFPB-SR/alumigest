import { useMemo } from 'react';
import type { MaterialSummary } from '../../types';
import type { FormItem } from './ProductTechSheet';

interface ProductCostSummaryProps {
  items: FormItem[];
  materials: MaterialSummary[];
  onSave: () => void;
  isPending: boolean;
  isEditing: boolean;
}

export function ProductCostSummary({ 
  items, 
  materials, 
  onSave, 
  isPending, 
  isEditing 
}: ProductCostSummaryProps) {
  const materialsMap = useMemo(() => {
    const map = new Map<string, MaterialSummary>();
    materials.forEach(m => map.set(m.id, m));
    return map;
  }, [materials]);

  const materialsSubtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const material = materialsMap.get(item.materialId);
      const price = material ? (material.costPrice > 0 ? material.costPrice : material.salePrice) : 0;
      const qty = Number(item.quantity.replace(',', '.')) || 0;
      return acc + (price * qty);
    }, 0);
  }, [items, materialsMap]);

  // Tax and Margin calculation for display purposes
  const taxRate = 0.10; // 10%
  const marginRate = 0.35; // 35%
  
  const taxCost = materialsSubtotal * taxRate;
  const totalCost = materialsSubtotal + taxCost;
  const salePrice = totalCost * (1 + marginRate);

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm h-fit sticky top-0">
      <div className="p-md border-b border-outline-variant bg-primary text-on-primary rounded-t-lg">
        <h3 className="font-title-sm text-title-sm">Resumo de Custos</h3>
      </div>
      
      <div className="p-md flex flex-col gap-sm">
        <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Materiais (Subtotal)</span>
          <span className="font-data-mono text-data-mono text-on-surface">
            {formatCurrency(materialsSubtotal)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Taxas / Impostos (10%)</span>
          <span className="font-data-mono text-data-mono text-on-surface">
            {formatCurrency(taxCost)}
          </span>
        </div>
        
        <div className="mt-sm pt-sm border-t-2 border-outline flex justify-between items-center">
          <span className="font-title-sm text-title-sm text-on-surface font-bold">Custo Total Base</span>
          <span className="font-data-mono text-[16px] font-bold text-on-surface">
            {formatCurrency(totalCost)}
          </span>
        </div>
        
        <div className="mt-lg bg-surface-container p-sm rounded-lg border border-outline-variant">
          <div className="flex justify-between items-center mb-xs">
            <span className="font-label-bold text-label-bold text-on-surface">Margem Sugerida</span>
            <span className="font-data-mono text-data-mono text-primary font-bold">35%</span>
          </div>
          <div className="flex justify-between items-center gap-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Preço de Venda Sugerido</span>
            <span className="font-data-mono text-data-mono text-on-surface font-bold whitespace-nowrap text-right">
              {formatCurrency(salePrice)}
            </span>
          </div>
        </div>

        <button 
          className="mt-md w-full py-sm bg-primary text-on-primary rounded-sm font-label-bold text-label-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-xs disabled:opacity-50"
          onClick={onSave}
          disabled={isPending || items.length === 0}
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {isPending ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Salvar Produto')}
        </button>
      </div>
    </aside>
  );
}
