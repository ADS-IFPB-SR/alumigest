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

const ALL_CATEGORIES: MaterialCategoryType[] = ['GLASS', 'PROFILE', 'HARDWARE', 'FILM'];

export function CategoryRequirementsSelector({
  templateType,
  selectedCategories,
  setSelectedCategories,
}: CategoryRequirementsSelectorProps) {
  const toggleCategory = (cat: MaterialCategoryType) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const suggestedCategories = templateType ? (TEMPLATE_DEFAULT_CATEGORIES[templateType as DoorTemplateType] || []) : [];

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-outline-variant/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="font-title-sm text-base font-semibold text-on-surface flex items-center gap-2">
              Categorias de Insumos Requeridas <span className="text-error">*</span>
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 pl-8">
            Selecione quais grupos de materiais o orçamentista precisará especificar no cálculo desta esquadria.
          </p>
        </div>

        {selectedCategories.length > 0 && (
          <span className="text-xs text-primary font-semibold self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-primary/10">
            {selectedCategories.length} de {ALL_CATEGORIES.length} selecionadas
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            const isSuggested = suggestedCategories.includes(cat);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`relative flex flex-col items-center justify-center text-center p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer select-none group ${
                  isSelected
                    ? 'border-primary bg-primary/8 text-primary shadow-xs ring-2 ring-primary/20 scale-[1.01]'
                    : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:border-outline hover:bg-surface-container-low'
                }`}
                aria-pressed={isSelected}
                aria-label={`Categoria: ${MATERIAL_CATEGORY_LABELS[cat]}`}
              >
                {/* Checkbox badge superior */}
                <div
                  className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'border border-outline-variant/80'
                  }`}
                >
                  {isSelected && <span className="material-symbols-outlined text-[12px]">check</span>}
                </div>

                <span className="material-symbols-outlined text-[26px] mb-1.5 transition-transform group-hover:scale-110">
                  {MATERIAL_CATEGORY_ICONS[cat]}
                </span>
                <span className="text-xs font-semibold text-on-surface">
                  {MATERIAL_CATEGORY_LABELS[cat]}
                </span>

                {isSuggested && (
                  <span className="text-[10px] text-primary font-medium mt-1">
                    Sugerido
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sugestão automática informativa */}
        {templateType && (suggestedCategories || []).length > 0 && (
          <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/40 text-[11px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">tips_and_updates</span>
            <span>
              Configuração padrão sugerida para este modelo:{' '}
              <strong className="text-on-surface">
                {suggestedCategories.map(c => MATERIAL_CATEGORY_LABELS[c]).join(' + ')}
              </strong>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
