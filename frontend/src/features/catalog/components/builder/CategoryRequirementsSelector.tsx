import { useEffect, useRef } from 'react';
import type { DoorTemplateType, MaterialCategoryType } from '../../types/templates';
import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORY_ICONS,
  TEMPLATE_DEFAULT_CATEGORIES,
} from '../../types/templates';

interface CategoryRequirementsSelectorProps {
  templateType: DoorTemplateType | null;
  selectedCategories: MaterialCategoryType[];
  setSelectedCategories: (val: MaterialCategoryType[]) => void;
}

const ALL_CATEGORIES: MaterialCategoryType[] = ['GLASS', 'PROFILE', 'HARDWARE', 'ROLLERS', 'FILM'];

/**
 * Seletor de categorias de insumos requeridas para fabricação.
 * Cards clicáveis com auto-sugestão baseada no template selecionado.
 */
export function CategoryRequirementsSelector({
  templateType,
  selectedCategories,
  setSelectedCategories,
}: CategoryRequirementsSelectorProps) {

  const prevTemplateRef = useRef(templateType);

  // Auto-selecionar categorias sugeridas ao trocar o template
  useEffect(() => {
    if (templateType && templateType !== prevTemplateRef.current) {
      setSelectedCategories(TEMPLATE_DEFAULT_CATEGORIES[templateType]);
    }
    prevTemplateRef.current = templateType;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType]);

  const toggleCategory = (cat: MaterialCategoryType) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const suggestedCategories = templateType ? TEMPLATE_DEFAULT_CATEGORIES[templateType] : [];

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
      <div className="p-md border-b border-outline-variant">
        <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px] text-primary">inventory_2</span>
          Categorias de Insumos Requeridas
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
          Marque as categorias de materiais necessárias para fabricação deste produto.
        </p>
      </div>

      <div className="p-lg">
        <div className="flex flex-wrap gap-sm">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`
                  flex flex-col items-center justify-center gap-xs
                  px-lg py-md rounded-lg border-2 transition-all duration-150
                  min-w-[100px] cursor-pointer
                  ${isSelected
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant/60 text-on-surface-variant hover:border-outline hover:bg-surface-container'
                  }
                `}
                aria-pressed={isSelected}
                aria-label={`Categoria: ${MATERIAL_CATEGORY_LABELS[cat]}`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {MATERIAL_CATEGORY_ICONS[cat]}
                </span>
                <span className="font-label-md text-label-md font-medium">
                  {MATERIAL_CATEGORY_LABELS[cat]}
                </span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sugestão automática */}
        {templateType && suggestedCategories.length > 0 && (
          <div className="mt-md flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant italic">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Sugestão automática para {templateType}: {suggestedCategories.map(c => MATERIAL_CATEGORY_LABELS[c]).join(' + ')}
          </div>
        )}
      </div>
    </section>
  );
}
