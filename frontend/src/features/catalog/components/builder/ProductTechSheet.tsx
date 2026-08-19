import React, { useState } from 'react';
import type { MaterialSummary } from '../../types';
import { Button } from '../../../../components/ui/Button';
import { MaterialPickerModal } from './MaterialPickerModal';
import toast from 'react-hot-toast';

export interface FormItem {
  tempId: string;
  materialId: string;
  quantity: string;
}

interface ProductTechSheetProps {
  items: FormItem[];
  setItems: React.Dispatch<React.SetStateAction<FormItem[]>>;
  materials: MaterialSummary[];
}

export function ProductTechSheet({ items, setItems, materials }: ProductTechSheetProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const materialsMap = React.useMemo(() => {
    const map = new Map<string, MaterialSummary>();
    materials.forEach(m => map.set(m.id, m));
    return map;
  }, [materials]);

  const handleAddPickedMaterial = (material: MaterialSummary) => {
    if (items.some(item => item.materialId === material.id)) {
      toast.error('Este insumo já está na ficha técnica.');
      return;
    }
    setItems([...items, { tempId: crypto.randomUUID(), materialId: material.id, quantity: '' }]);
    setIsPickerOpen(false);
  };

  const handleRemoveItem = (tempId: string) => {
    setItems(items.filter(item => item.tempId !== tempId));
  };

  const handleChangeItem = (tempId: string, field: keyof FormItem, value: string) => {
    if (field === 'quantity') {
      let sanitized = value.replace(/[^0-9.,]/g, '');
      
      // Permitir apenas uma vírgula ou ponto
      const parts = sanitized.replace(',', '.').split('.');
      if (parts.length > 2) {
        return; // ignora se tentar botar mais de uma vírgula
      }

      const numValue = Number(sanitized.replace(',', '.'));
      if (sanitized !== '' && (isNaN(numValue) || numValue < 0 || numValue > 99999)) {
        return;
      }
      if (sanitized.length > 8) return;
      
      setItems(items.map(item => item.tempId === tempId ? { ...item, [field]: sanitized } : item));
      return;
    }
    setItems(items.map(item => item.tempId === tempId ? { ...item, [field]: value } : item));
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col flex-none shadow-sm mb-lg">
      <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center rounded-t-lg">
        <h3 className="font-title-sm text-title-sm text-on-surface">Ficha Técnica Dinâmica</h3>
        <Button 
          variant="primary" 
          icon="add" 
          onClick={() => setIsPickerOpen(true)}
        >
          Adicionar Insumo
        </Button>
      </div>

      {/* List Header */}
      <div className="grid grid-cols-12 gap-sm px-md py-sm bg-surface-container-high border-b border-outline-variant font-label-bold text-label-bold text-on-surface">
        <div className="col-span-5 md:col-span-6">Material / Componente</div>
        <div className="col-span-2 hidden md:block text-center">Unid.</div>
        <div className="col-span-3 md:col-span-2 text-right">Qtd.</div>
        <div className="col-span-2 hidden md:block text-right">Custo Ref.</div>
        <div className="col-span-4 md:col-span-1 text-center"></div>
      </div>

      {/* List Items */}
      <div className="flex flex-col gap-0 max-h-[400px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-xl text-center font-body-sm text-secondary italic">
            Nenhum material adicionado. Clique em "Adicionar Insumo" para começar.
          </div>
        ) : (
          items.map((item, index) => {
            const materialInfo = item.materialId ? materialsMap.get(item.materialId) : null;
            const refCost = materialInfo ? (materialInfo.costPrice > 0 ? materialInfo.costPrice : materialInfo.salePrice) : 0;
            const unit = materialInfo ? materialInfo.unitMeasure : '-';

            return (
              <div key={item.tempId} className="grid grid-cols-12 gap-sm px-md py-xs border-b border-outline-variant items-center hover:bg-surface-container-highest transition-colors group focus-within:bg-surface-container-highest">
                <div className="col-span-5 md:col-span-6 flex flex-col justify-center">
                  <div className="font-title-sm text-body-sm font-semibold text-on-surface truncate">
                    {materialInfo ? materialInfo.name : 'Material não encontrado'}
                  </div>
                  {materialInfo && (materialInfo.skuCode || materialInfo.commercialReference) && (
                    <div className="font-data-mono text-[11px] text-on-surface-variant truncate">
                      {materialInfo.skuCode} {materialInfo.commercialReference ? `| ${materialInfo.commercialReference}` : ''}
                    </div>
                  )}
                </div>
                
                <div className="col-span-2 hidden md:block text-center text-on-surface-variant font-body-sm text-body-sm">
                  {unit}
                </div>
                
                <div className="col-span-3 md:col-span-2">
                  <input 
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-transparent border border-transparent p-xs font-data-mono text-data-mono text-right focus:border-primary focus:bg-surface-container-lowest focus:ring-0 rounded-sm transition-all h-8 hover:border-outline-variant text-on-surface focus:outline-none"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) => handleChangeItem(item.tempId, 'quantity', e.target.value)}
                    tabIndex={index + 1}
                  />
                </div>
                
                <div className="col-span-2 hidden md:block text-right">
                  <div className="w-full bg-transparent p-xs font-data-mono text-data-mono text-right text-on-surface-variant h-8 flex items-center justify-end">
                    R$ {refCost.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                
                <div className="col-span-4 md:col-span-1 flex justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleRemoveItem(item.tempId)}
                    className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors flex items-center justify-center"
                    title="Remover Item"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-sm bg-surface-container-low border-t border-outline-variant text-right rounded-b-lg">
        <span className="font-body-sm text-body-sm text-on-surface-variant italic">
          Use TAB no campo de quantidade para navegar rapidamente.
        </span>
      </div>

      <MaterialPickerModal 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAddPickedMaterial}
        materials={materials}
        addedMaterialIds={items.map(i => i.materialId)}
      />
    </section>
  );
}
