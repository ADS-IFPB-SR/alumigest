import { useState } from 'react';
import type { ProductCategoryRequirement, MaterialCategoryType } from '../../types';
import { Button } from '../../components/ui/Button';
import { ProductCategoryPickerModal } from './ProductCategoryPickerModal';
import toast from 'react-hot-toast';

interface ProductTechSheetProps {
  categoryRequirements: ProductCategoryRequirement[];
  setCategoryRequirements: React.Dispatch<React.SetStateAction<ProductCategoryRequirement[]>>;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'cat-req-' + Math.random().toString(36).substring(2, 11);
}

const CATEGORY_META: Record<MaterialCategoryType, { title: string; icon: string; badgeColor: string; defaultDescription: string }> = {
  GLASS: {
    title: 'Categoria Vidro',
    icon: 'window',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30',
    defaultDescription: 'Solicitará escolha do vidro (4mm, 6mm, 8mm, 10mm, Incolor, Fumê, etc.) no orçamento.',
  },
  PROFILE: {
    title: 'Categoria Perfil de Alumínio',
    icon: 'view_kanban',
    badgeColor: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    defaultDescription: 'Solicitará escolha dos perfis de alumínio (Linha Suprema, 25, Gold, Ripado, etc.) no orçamento.',
  },
  HARDWARE: {
    title: 'Categoria Ferragem / Acessório',
    icon: 'hardware',
    badgeColor: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    defaultDescription: 'Solicitará escolha de ferragens (Kits de Box, Roldanas, Fechaduras, Puxadores, etc.) no orçamento.',
  },
  FILM: {
    title: 'Categoria Película / Vedação',
    icon: 'layers',
    badgeColor: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    defaultDescription: 'Solicitará escolha da película (Fumê, Jateada, Blackout, etc.) ou opção sem película no orçamento.',
  },
};

export function ProductTechSheet({ categoryRequirements, setCategoryRequirements }: ProductTechSheetProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleAddCategory = (categoryType: MaterialCategoryType, customLabel?: string) => {
    const meta = CATEGORY_META[categoryType];
    const newReq: ProductCategoryRequirement = {
      id: generateId(),
      categoryType,
      label: customLabel || meta.title,
      isOptional: categoryType === 'FILM',
    };

    setCategoryRequirements((prev) => [...prev, newReq]);
    toast.success(`"${meta.title}" adicionada ao template!`);
  };

  const handleRemoveCategory = (id: string) => {
    setCategoryRequirements((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeLabel = (id: string, newLabel: string) => {
    setCategoryRequirements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md lg:p-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-md pb-xs border-b border-outline-variant">
        <div>
          <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">category</span>
            Categorias de Insumos da Esquadria
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Defina apenas as categorias necessárias (ex: Vidro, Perfil, Ferragem, Película). As opções reais serão selecionadas no orçamento.
          </p>
        </div>
        <Button variant="primary" icon="add" onClick={() => setIsPickerOpen(true)}>
          Adicionar Categoria
        </Button>
      </div>

      {categoryRequirements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-xl text-center border-2 border-dashed border-outline-variant/60 rounded-md bg-surface-container-low/30">
          <span className="material-symbols-outlined text-[48px] text-outline mb-sm">layers</span>
          <p className="font-body text-body-sm text-on-surface font-medium mb-xs">
            Nenhuma categoria de insumo adicionada.
          </p>
          <p className="font-body-sm text-xs text-outline mb-md max-w-sm">
            Para compor o template da esquadria, selecione as categorias que fazem parte da montagem (ex: Vidro, Perfil, Ferragem, Película).
          </p>
          <Button variant="outline" icon="add" onClick={() => setIsPickerOpen(true)}>
            Selecionar Categorias
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {categoryRequirements.map((req, idx) => {
            const meta = CATEGORY_META[req.categoryType] || CATEGORY_META.GLASS;
            return (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm p-sm border border-outline-variant/60 rounded-md bg-surface hover:bg-surface-container-low transition-colors shadow-xs"
              >
                {/* Category Badge & Label */}
                <div className="flex items-center gap-sm flex-1 min-w-0">
                  <div className={`p-2 rounded-md border ${meta.badgeColor} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[22px]">{meta.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
                        #{idx + 1} {meta.title}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={req.label}
                      onChange={(e) => handleChangeLabel(req.id, e.target.value)}
                      placeholder="Rótulo do insumo (ex: Vidro das Folhas)"
                      className="mt-0.5 w-full bg-transparent border-b border-dashed border-outline-variant hover:border-primary focus:border-primary focus:border-solid focus:outline-none font-body-sm text-sm font-semibold text-on-surface transition-colors"
                    />
                    <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                      {meta.defaultDescription}
                    </p>
                  </div>
                </div>

                {/* Remove Action */}
                <div className="flex items-center gap-xs self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(req.id)}
                    className="p-xs text-error hover:bg-error-container rounded-md transition-colors cursor-pointer"
                    title="Remover categoria deste template"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Helper Chips */}
      <div className="mt-md pt-sm border-t border-outline-variant/60 flex flex-wrap items-center gap-xs">
        <span className="text-[11px] text-on-surface-variant font-medium">Adicionar rapidamente:</span>
        {(['GLASS', 'PROFILE', 'HARDWARE', 'FILM'] as MaterialCategoryType[]).map((catType) => {
          const alreadyAdded = categoryRequirements.some(r => r.categoryType === catType);
          const meta = CATEGORY_META[catType];
          return (
            <button
              key={catType}
              type="button"
              onClick={() => handleAddCategory(catType)}
              className={`px-sm py-1 rounded-full text-xs font-medium border flex items-center gap-xs transition-all cursor-pointer ${
                alreadyAdded
                  ? 'bg-surface-container-high text-on-surface-variant border-outline-variant opacity-70 hover:opacity-100'
                  : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
              <span>+ {meta.title}</span>
            </button>
          );
        })}
      </div>

      <ProductCategoryPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectCategory={handleAddCategory}
      />
    </section>
  );
}

