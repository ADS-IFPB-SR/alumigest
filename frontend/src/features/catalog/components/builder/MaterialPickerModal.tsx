import { useState, useMemo } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import type { MaterialSummary } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (material: MaterialSummary) => void;
  materials: MaterialSummary[];
  addedMaterialIds?: string[];
}

export function MaterialPickerModal({ isOpen, onClose, onSelect, materials, addedMaterialIds = [] }: Props) {
  const [search, setSearch] = useState('');

  const filteredMaterials = useMemo(() => {
    if (!search) return materials;
    const term = search.toLowerCase();
    return materials.filter(m => 
      m.name.toLowerCase().includes(term) ||
      (m.skuCode && m.skuCode.toLowerCase().includes(term)) ||
      (m.commercialReference && m.commercialReference.toLowerCase().includes(term))
    );
  }, [materials, search]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Insumo"
    >
      <div className="flex flex-col gap-md h-[60vh] max-h-[500px]">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
            search
          </span>
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-xl pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-md font-body text-sm text-on-surface focus:border-primary focus:outline-none transition-colors shadow-sm" 
            placeholder="Buscar por nome ou código..." 
            type="text" 
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-outline-variant rounded-md bg-surface-container-lowest">
          {filteredMaterials.length === 0 ? (
            <div className="p-md text-center text-secondary font-body-sm italic">
              Nenhum material encontrado.
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {filteredMaterials.map(material => {
                const isAdded = addedMaterialIds.includes(material.id);
                return (
                  <li key={material.id}>
                    <button
                      onClick={() => !isAdded && onSelect(material)}
                      disabled={isAdded}
                      className={`w-full text-left px-md py-sm focus:outline-none transition-colors ${
                        isAdded 
                          ? 'bg-surface-container-high opacity-50 cursor-not-allowed' 
                          : 'hover:bg-surface-container-high focus:bg-surface-container-highest'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-title-sm text-title-sm font-semibold text-on-surface">
                          {material.name}
                        </span>
                        <span className="font-data-mono text-data-mono text-on-surface-variant">
                          R$ {(material.costPrice > 0 ? material.costPrice : material.salePrice).toFixed(2).replace('.', ',')} / {material.unitMeasure || 'UN'}
                        </span>
                      </div>
                      {(material.skuCode || material.commercialReference) && (
                        <div className="font-data-mono text-xs text-on-surface-variant mt-0.5">
                          {material.skuCode} {material.commercialReference ? `| ${material.commercialReference}` : ''}
                        </div>
                      )}
                      {isAdded && (
                        <div className="text-xs font-label-sm text-primary mt-xs font-medium">
                          Item já adicionado na ficha
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
