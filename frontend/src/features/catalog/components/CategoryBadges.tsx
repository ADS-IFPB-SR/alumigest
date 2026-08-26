import type { MaterialCategoryType } from '../types/templates';
import { MATERIAL_CATEGORY_LABELS, MATERIAL_CATEGORY_ICONS } from '../types/templates';

interface CategoryBadgesProps {
  categories?: MaterialCategoryType[];
}

const BADGE_COLORS: Record<MaterialCategoryType, string> = {
  GLASS: 'bg-blue-100 text-blue-700',
  PROFILE: 'bg-amber-100 text-amber-700',
  HARDWARE: 'bg-slate-100 text-slate-700',
  ROLLERS: 'bg-emerald-100 text-emerald-700',
  FILM: 'bg-purple-100 text-purple-700',
};

/**
 * Badges coloridos para exibir categorias de insumos requeridas em listagens.
 */
export function CategoryBadges({ categories }: CategoryBadgesProps) {
  if (!categories || categories.length === 0) {
    return (
      <span className="font-body-sm text-body-sm text-on-surface-variant italic">—</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-[4px]">
      {categories.map((cat) => (
        <span
          key={cat}
          className={`inline-flex items-center gap-[2px] px-sm py-[2px] rounded-full font-label text-[11px] font-medium ${BADGE_COLORS[cat]}`}
        >
          <span className="material-symbols-outlined text-[12px]">
            {MATERIAL_CATEGORY_ICONS[cat]}
          </span>
          {MATERIAL_CATEGORY_LABELS[cat]}
        </span>
      ))}
    </div>
  );
}
