import React, { useMemo } from 'react';
import type { BudgetItemOption, CategoryType } from '../types';
import { formatBRL } from '../utils/calculations';

export interface MaterialConsumptionItem {
  key: string;
  materialId: string;
  materialName: string;
  categoryType: CategoryType | string;
  unitMeasure: string;
  totalQuantity: number;
  unitPrice: number;
  totalCost: number;
  occurrenceCount: number;
}

export interface BudgetMaterialsSummaryProps {
  items: Array<{
    quantity: number;
    options?: BudgetItemOption[];
  }>;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  GLASS: 'Vidros',
  PROFILE: 'Perfis de Alumínio',
  HARDWARE: 'Ferragens & Acessórios',
  ROLLERS: 'Roldanas',
  FILM: 'Películas',
};

const CATEGORY_ICONS: Record<string, string> = {
  GLASS: 'grid_view',
  PROFILE: 'view_stream',
  HARDWARE: 'hardware',
  ROLLERS: 'tune',
  FILM: 'layers',
};

/**
 * Mini componente elegante para consolidação do consumo total de materiais de um orçamento.
 * Agrupa por materialId/materialName calculando consumo físico total (multiplicado pela quantidade de esquadrias)
 * e o custo total estimado.
 */
export const BudgetMaterialsSummary: React.FC<BudgetMaterialsSummaryProps> = ({
  items,
  className = '',
}) => {
  const aggregatedMaterials = useMemo(() => {
    const map = new Map<string, MaterialConsumptionItem>();

    for (const item of items) {
      const itemMultiplier = item.quantity || 1;
      const opts = item.options || [];

      for (const opt of opts) {
        if (!opt.materialId && !opt.materialName) continue;
        const key = opt.materialId || opt.materialName;
        const optQty = opt.totalPrice !== undefined ? (opt.quantity ?? 1) : (opt.quantity ?? 1) * itemMultiplier;
        const optUnitPrice = opt.unitPrice ?? 0;
        const optTotalCost = opt.totalPrice !== undefined ? opt.totalPrice : optQty * optUnitPrice;

        const existing = map.get(key);
        if (existing) {
          existing.totalQuantity += optQty;
          existing.totalCost += optTotalCost;
          existing.occurrenceCount += 1;
        } else {
          map.set(key, {
            key,
            materialId: opt.materialId || key,
            materialName: opt.materialName || 'Insumo não identificado',
            categoryType: opt.categoryType || 'HARDWARE',
            unitMeasure: opt.unitMeasure || 'un',
            totalQuantity: optQty,
            unitPrice: optUnitPrice,
            totalCost: optTotalCost,
            occurrenceCount: 1,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.categoryType !== b.categoryType) {
        return a.categoryType.localeCompare(b.categoryType);
      }
      return b.totalCost - a.totalCost;
    });
  }, [items]);

  const categoriesGrouped = useMemo(() => {
    const groups: Record<string, MaterialConsumptionItem[]> = {};
    for (const item of aggregatedMaterials) {
      const cat = item.categoryType || 'OUTROS';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [aggregatedMaterials]);

  const grandTotalCost = useMemo(() => {
    return aggregatedMaterials.reduce((acc, cur) => acc + cur.totalCost, 0);
  }, [aggregatedMaterials]);

  if (aggregatedMaterials.length === 0) {
    return null;
  }

  return (
    <div className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md sm:p-lg shadow-xs flex flex-col gap-md ${className}`}>
      <div className="flex items-center justify-between pb-xs border-b border-outline-variant flex-wrap gap-xs">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-[20px] text-primary">inventory_2</span>
          <h3 className="font-label font-bold text-sm sm:text-base text-on-surface uppercase tracking-wider">
            Consumo Agregado de Materiais da Obra
          </h3>
        </div>
        <div className="flex items-center gap-sm text-xs font-data-mono text-on-surface-variant">
          <span className="bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded font-bold">
            {aggregatedMaterials.length} materiais distintos
          </span>
          <span className="font-bold text-on-surface">
            Total Insumos: {formatBRL(grandTotalCost)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md items-start">
        {Object.entries(categoriesGrouped).map(([categoryKey, catItems]) => {
          const categoryTitle = CATEGORY_LABELS[categoryKey] ?? categoryKey;
          const categoryIcon = CATEGORY_ICONS[categoryKey] ?? 'widgets';
          const subtotalCat = catItems.reduce((sum, ci) => sum + ci.totalCost, 0);

          return (
            <div
              key={categoryKey}
              className="bg-surface-container-low/60 rounded-lg p-sm border border-outline-variant/60 flex flex-col gap-xs"
            >
              <div className="flex items-center justify-between pb-1 border-b border-outline-variant/40">
                <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">{categoryIcon}</span>
                  {categoryTitle} ({catItems.length})
                </span>
                <span className="text-xs font-data-mono font-bold text-primary">
                  {formatBRL(subtotalCat)}
                </span>
              </div>

              <div className="divide-y divide-outline-variant/30 text-xs">
                {catItems.map((ci) => {
                  const formattedQty = ci.unitMeasure === 'un'
                    ? Math.round(ci.totalQuantity)
                    : Number(ci.totalQuantity.toFixed(2));

                  return (
                    <div key={ci.key} className="py-1.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-on-surface truncate font-medium">
                          {ci.materialName}
                        </p>
                        <p className="text-[11px] font-data-mono text-secondary">
                          {ci.unitPrice > 0 ? `${formatBRL(ci.unitPrice)} / ${ci.unitMeasure}` : 'Preço base'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-data-mono font-bold text-on-surface block">
                          {formattedQty} {ci.unitMeasure}
                        </span>
                        {ci.totalCost > 0 && (
                          <span className="text-[11px] font-data-mono text-primary font-semibold">
                            {formatBRL(ci.totalCost)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
