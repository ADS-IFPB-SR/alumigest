import { useState } from 'react';
import type { MaterialCategoryType } from '../../types';

interface ProductCategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryType: MaterialCategoryType, customLabel?: string) => void;
}

interface CategoryOption {
  type: MaterialCategoryType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  defaultLabel: string;
  examples: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    type: 'GLASS',
    title: 'Categoria Vidro',
    subtitle: 'Vidros temperados, laminados e especiais',
    icon: 'window',
    color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
    defaultLabel: 'Vidro das Folhas / Painéis',
    examples: 'Ex: 4mm, 6mm, 8mm, 10mm (Incolor, Fumê, Verde, Bronze)',
  },
  {
    type: 'PROFILE',
    title: 'Categoria Perfil de Alumínio',
    subtitle: 'Trilhos, montantes, travessas e ripados',
    icon: 'view_kanban',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    defaultLabel: 'Perfis de Alumínio e Trilhos',
    examples: 'Ex: Linha Suprema, Linha 25, Linha Gold, Ripado 3D',
  },
  {
    type: 'HARDWARE',
    title: 'Categoria Ferragem / Acessório',
    subtitle: 'Kits de instalação, fechaduras, roldanas e puxadores',
    icon: 'hardware',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    defaultLabel: 'Kit de Ferragens e Acessórios',
    examples: 'Ex: Kit Box F1, Roldanas 1125, Fechadura Bico Papagaio, Pivôs',
  },
  {
    type: 'FILM',
    title: 'Categoria Película / Vedação',
    subtitle: 'Películas de proteção, solar e decorativas',
    icon: 'layers',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    defaultLabel: 'Película de Proteção / Acabamento',
    examples: 'Ex: Película Solar Fumê G20, Jateada, Blackout',
  },
];

export function ProductCategoryPickerModal({ isOpen, onClose, onSelectCategory }: ProductCategoryPickerModalProps) {
  const [selectedType, setSelectedType] = useState<MaterialCategoryType>('GLASS');
  const [customLabel, setCustomLabel] = useState('');

  if (!isOpen) return null;

  const currentOpt = CATEGORY_OPTIONS.find(o => o.type === selectedType) || CATEGORY_OPTIONS[0];

  const handleConfirm = () => {
    onSelectCategory(selectedType, customLabel.trim() || currentOpt.defaultLabel);
    setCustomLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-xs">
      <div className="bg-surface border border-outline-variant rounded-lg max-w-lg w-full shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div>
            <h3 className="font-title-sm text-title-sm text-on-surface font-semibold flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">category</span>
              Adicionar Categoria de Insumo
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Escolha a categoria necessária. No orçamento, as opções reais serão selecionadas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-lg flex flex-col gap-md">
          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedType === cat.type;
              return (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(cat.type);
                    setCustomLabel(cat.defaultLabel);
                  }}
                  className={`p-md rounded-lg border text-left flex flex-col gap-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
                      : 'border-outline-variant bg-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-xs">
                    <span className={`p-1.5 rounded-md border ${cat.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    </span>
                    <span className="font-title-sm text-xs font-bold text-on-surface">{cat.title}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{cat.subtitle}</p>
                  <span className="text-[10px] text-primary/80 font-mono mt-1">{cat.examples}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Label Input */}
          <div>
            <label className="font-label-bold text-xs text-on-surface block mb-1">
              Rótulo Descritivo do Insumo no Template (Opcional)
            </label>
            <input
              type="text"
              value={customLabel || currentOpt.defaultLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Ex: Vidro Fixo e de Correr, Trilhos Suprema, etc."
              className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded text-xs text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-lg py-md border-t border-outline-variant bg-surface-container-low flex justify-end gap-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-md py-xs border border-outline text-on-surface rounded font-label-bold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-md py-xs bg-primary text-on-primary rounded font-label-bold text-xs hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
          >
            Adicionar Categoria
          </button>
        </div>
      </div>
    </div>
  );
}
