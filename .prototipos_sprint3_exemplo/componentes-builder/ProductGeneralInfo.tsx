import { useState } from 'react';
import type { ProductCategory, DoorTemplateType, TemplateConfig } from '../../types';
import { TemplateSelector } from '../templates/TemplateSelector';

interface ProductGeneralInfoProps {
  name: string;
  setName: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  templateType: DoorTemplateType;
  setTemplateType: (val: DoorTemplateType) => void;
  templateConfig: TemplateConfig;
  setTemplateConfig: (val: TemplateConfig) => void;
  categories: ProductCategory[] | undefined;
  onCreateCategory: (name: string) => void;
}

export function ProductGeneralInfo({
  name,
  setName,
  categoryId,
  setCategoryId,
  templateType,
  setTemplateType,
  templateConfig,
  setTemplateConfig,
  categories,
  onCreateCategory,
}: ProductGeneralInfoProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md lg:p-lg shadow-sm">
      <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
        Informações do Template de Esquadria
      </h3>

      <div className="flex flex-col gap-lg">
        {/* Form Fields: Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {/* Name */}
          <div>
            <label className="font-label-bold text-label-bold text-on-surface text-xs">Nome da Esquadria *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Porta de Correr 2 Folhas Suprema"
              className="mt-xs w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            />
          </div>

          {/* Category + Create */}
          <div>
            <label className="font-label-bold text-label-bold text-on-surface text-xs">Categoria *</label>
            <div className="flex gap-xs mt-xs">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex-1 px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
              >
                <option value="">Selecione a categoria</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-sm py-xs border border-outline-variant bg-surface-container-low text-primary rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Nova Categoria"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* SVG Template Selector & Live Preview */}
        <div>
          <label className="font-label-bold text-label-bold text-on-surface text-xs block mb-xs">
            Modelo e Desenho Técnico da Esquadria (SVG)
          </label>
          <TemplateSelector
            selectedType={templateType}
            onSelectType={setTemplateType}
            config={templateConfig}
            onChangeConfig={setTemplateConfig}
            showCustomizer={true}
          />
        </div>
      </div>

      {/* Inline Category Creation Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-xs sm:p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-lg w-full max-w-sm flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-md border-b border-outline-variant">
              <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">Nova Categoria</h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-xs text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-md">
              <label className="font-label-bold text-label-bold text-on-surface text-xs">Nome da Categoria *</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Porta de Correr"
                className="mt-xs w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
            </div>
            <div className="flex justify-end gap-sm p-md border-t border-outline-variant">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-md py-xs border border-outline text-on-surface rounded-sm font-label-bold text-label-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="px-md py-xs bg-primary text-on-primary rounded-sm font-label-bold text-label-bold hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
