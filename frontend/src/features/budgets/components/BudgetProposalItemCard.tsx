import type { BudgetDetail, DoorTemplateType } from '../types';
import { TEMPLATE_TYPE_INFO } from '../types';
import { formatBRL } from '../utils/calculations';
import { WindowSvgPreview } from './builder/WindowSvgPreview';

export type BudgetProposalItem = BudgetDetail['items'][number];

interface BudgetProposalItemCardProps {
  readonly item: BudgetProposalItem;
  readonly isExpanded: boolean;
  readonly onToggleExpanded: () => void;
}

export function BudgetProposalItemCard({
  item,
  isExpanded,
  onToggleExpanded,
}: BudgetProposalItemCardProps) {
  const hasOptions = (item.options ?? []).length > 0;
  const templateLabel = item.templateType && TEMPLATE_TYPE_INFO[item.templateType as DoorTemplateType]?.label
    ? TEMPLATE_TYPE_INFO[item.templateType as DoorTemplateType].label
    : 'Esquadria sob medida';

  return (
    <div className="p-md hover:bg-surface-container-lowest/50 transition-colors flex flex-col gap-sm break-inside-avoid">
      <div className="flex flex-col sm:flex-row gap-md items-start">
        {item.templateType ? (
          <div className="shrink-0 bg-surface-container-low rounded-lg p-2 border border-outline-variant self-center sm:self-start w-[140px] flex items-center justify-center">
            <WindowSvgPreview
              templateType={item.templateType}
              widthMm={item.width ?? 2000}
              heightMm={item.height ?? 2100}
              openingDirection={item.templateConfig?.openingDirection ?? 'LEFT_TO_RIGHT'}
              handleConfig={item.handleConfig ?? { handleType: 'NONE' }}
              drillingConfig={item.drillingConfig ?? { holeCount: 0, divisionType: 'EQUAL' }}
              templateName={item.productName}
              aluminumColor={item.templateConfig?.aluminumColor}
              glassFinish={item.templateConfig?.glassFinish}
              maxHeight={110}
            />
          </div>
        ) : (
          <div className="shrink-0 bg-surface-container-low rounded-lg p-4 border border-outline-variant text-on-surface-variant flex flex-col items-center justify-center w-[120px] h-[90px]">
            <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
            <span className="text-[10px] font-label mt-1">Item Padrão</span>
          </div>
        )}

        <div className="flex-1 min-w-0 w-full flex flex-col gap-xs">
          <div className="flex items-start justify-between gap-sm">
            <div>
              <h3 className="font-label font-bold text-on-surface text-base">
                {item.productName}
              </h3>
              <p className="text-xs text-on-surface-variant font-body">
                {templateLabel}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-data-mono font-extrabold text-primary text-lg">
                {formatBRL(item.subtotal)}
              </span>
              <p className="text-xs font-label text-on-surface-variant">
                {item.quantity} {item.quantity > 1 ? 'unidades' : 'unidade'}
                {item.quantity > 1 && (
                  <span className="text-[10px] text-on-surface-variant block font-data-mono">
                    ({formatBRL(item.subtotal / item.quantity)} / un)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-xs text-xs font-data-mono text-on-surface-variant mt-1">
            <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary">square_foot</span>
              <span>{item.width} × {item.height} mm</span>
            </span>
            {item.templateConfig?.aluminumColor && (
              <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                {item.templateConfig.aluminumColor}
              </span>
            )}
            {item.templateConfig?.glassFinish && (
              <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                {item.templateConfig.glassFinish}
              </span>
            )}
            {item.laborCost > 0 && (
              <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                MO: {formatBRL(item.laborCost * item.quantity)}
              </span>
            )}
            {item.handleConfig?.handleType && item.handleConfig.handleType !== 'NONE' && (
              <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                Puxador: {item.handleConfig.handleType}
              </span>
            )}
          </div>

          {item.notes && (
            <p className="text-xs text-on-surface-variant/90 italic font-body bg-surface-container-low/60 px-2 py-1 rounded border border-outline-variant/40 mt-1">
              Obs: {item.notes}
            </p>
          )}

          {hasOptions && (
            <div className="mt-2 pt-1 border-t border-outline-variant/30 flex justify-between items-center no-print">
              <button
                type="button"
                onClick={onToggleExpanded}
                className="flex items-center gap-1 text-xs font-label font-semibold text-primary hover:text-primary/80 transition-colors focus:outline-none cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-[16px] transition-transform duration-200"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
                <span>
                  {isExpanded ? 'Ocultar Insumos' : `Ver Insumos da Esquadria (${item.options.length})`}
                </span>
              </button>
              <span className="text-[11px] font-data-mono text-on-surface-variant">
                {item.options.length} materiais calculados
              </span>
            </div>
          )}
        </div>
      </div>

      {hasOptions && isExpanded && (
        <div className="bg-surface-container-low rounded-lg p-sm border border-outline-variant/60 flex flex-col gap-1 mt-1 animate-fadeIn">
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider pb-1 border-b border-outline-variant/40">
            Insumos & Componentes Utilizados:
          </p>
          <div className="divide-y divide-outline-variant/30">
            {item.options.map((opt, oIdx) => (
              <div
                key={opt.id ?? `${opt.materialId}-${oIdx}`}
                className="flex justify-between items-center text-xs py-1 gap-2"
              >
                <span className="font-body text-on-surface truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  {opt.materialName}
                </span>
                <span className="font-data-mono text-on-surface-variant shrink-0">
                  {opt.quantity !== undefined ? (
                    <>
                      {opt.quantity} {opt.unitMeasure} × {formatBRL(opt.unitPrice)}
                      {opt.totalPrice !== undefined && (
                        <span className="font-bold text-on-surface ml-1">
                          = {formatBRL(opt.totalPrice)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>{formatBRL(opt.unitPrice)} / {opt.unitMeasure}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
