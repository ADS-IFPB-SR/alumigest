import React from 'react';
import type { WindowTemplate, DoorTemplateType } from '../../types';
import { TEMPLATE_TYPE_INFO } from '../../types';

interface TemplateSelectorProps {
  templates: WindowTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: WindowTemplate) => void;
  isLoading: boolean;
}

const CATEGORY_GROUPS: { label: string; types: DoorTemplateType[] }[] = [
  { label: 'Portas', types: ['SLIDING_DOOR_2F', 'SLIDING_DOOR_4F', 'PIVOTING_DOOR', 'SWING_DOOR_1F', 'SWING_DOOR_2F'] },
  { label: 'Janelas', types: ['SLIDING_WINDOW_2F', 'SLIDING_WINDOW_4F', 'MAXIM_AR_WINDOW'] },
  { label: 'Box de Banheiro', types: ['GLASS_BOX_FRONTAL', 'GLASS_BOX_CORNER'] },
  { label: 'Painéis', types: ['FIXED_GLASS_FACADE'] },
];

/** Mini SVG icon para cada tipo de esquadria */
const TemplateMiniSvg: React.FC<{ templateType: DoorTemplateType }> = ({ templateType }) => {
  const w = 48;
  const h = 56;
  const fw = 4;
  const FRAME = '#374765';
  const GLASS = '#c5dcf5';
  const FIXED = '#d8eaf8';

  const inner = { x: fw, y: fw, w: w - fw * 2, h: h - fw * 2 };

  const renderIcon = () => {
    switch (templateType) {
      case 'SLIDING_DOOR_2F':
      case 'GLASS_BOX_FRONTAL':
        return (
          <>
            <rect {...inner} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            <rect x={fw} y={fw} width={inner.w / 2} height={inner.h} fill={FIXED} stroke="#93b8e0" strokeWidth={0.5} />
            <rect x={fw + inner.w / 2 - 1} y={fw} width={2} height={inner.h} fill={FRAME} />
          </>
        );
      case 'SLIDING_DOOR_4F':
      case 'SLIDING_WINDOW_4F':
        return (
          <>
            <rect {...inner} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={fw + (inner.w / 4) * i} y={fw} width={inner.w / 4} height={inner.h} fill={i === 0 || i === 3 ? FIXED : GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            ))}
          </>
        );
      case 'SWING_DOOR_1F':
      case 'PIVOTING_DOOR':
        return (
          <>
            <rect {...inner} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            <path d={`M ${fw} ${h - fw} A ${inner.w} ${inner.w} 0 0 0 ${fw + inner.w} ${h - fw}`} fill="none" stroke="#0040a4" strokeWidth={1.5} strokeDasharray="3 1.5" />
          </>
        );
      case 'SWING_DOOR_2F':
        return (
          <>
            <rect {...inner} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            <rect x={fw + inner.w / 2 - 1} y={fw} width={2} height={inner.h} fill={FRAME} />
            <path d={`M ${fw} ${h - fw} A ${inner.w / 2} ${inner.w / 2} 0 0 0 ${fw + inner.w / 2} ${h - fw}`} fill="none" stroke="#0040a4" strokeWidth={1.5} strokeDasharray="3 1.5" />
            <path d={`M ${fw + inner.w} ${h - fw} A ${inner.w / 2} ${inner.w / 2} 0 0 1 ${fw + inner.w / 2} ${h - fw}`} fill="none" stroke="#0040a4" strokeWidth={1.5} strokeDasharray="3 1.5" />
          </>
        );
      case 'SLIDING_WINDOW_2F':
        return (
          <>
            <rect {...inner} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            <rect x={fw} y={fw} width={inner.w} height={4} fill={FRAME} opacity={0.6} />
            <rect x={fw} y={h - fw - 4} width={inner.w} height={4} fill={FRAME} opacity={0.6} />
            <rect x={fw} y={fw} width={inner.w / 2} height={inner.h} fill={FIXED} stroke="#93b8e0" strokeWidth={0.5} />
          </>
        );
      case 'MAXIM_AR_WINDOW':
        return (
          <>
            <rect {...inner} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            <rect x={fw} y={fw} width={inner.w} height={inner.h * 0.35} fill="#b8d9f5" stroke="#93b8e0" strokeWidth={0.5} />
            <text x={w / 2} y={fw + inner.h * 0.2} textAnchor="middle" fontSize={7} fill="#0040a4">↑</text>
          </>
        );
      case 'GLASS_BOX_CORNER':
        return (
          <>
            <rect x={fw} y={fw} width={inner.w * 0.6} height={inner.h} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            <rect x={fw + inner.w * 0.6} y={fw} width={inner.w * 0.4} height={inner.h} fill={FIXED} stroke="#93b8e0" strokeWidth={0.5} />
            <rect x={fw + inner.w * 0.6 - 1} y={fw} width={2} height={inner.h} fill={FRAME} />
          </>
        );
      case 'FIXED_GLASS_FACADE':
        return (
          <>
            {[0, 1, 2].map((i) => (
              <rect key={i} x={fw + i * (inner.w / 3)} y={fw} width={inner.w / 3} height={inner.h} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />
            ))}
          </>
        );
      default:
        return <rect {...inner} fill={GLASS} stroke="#93b8e0" strokeWidth={0.5} />;
    }
  };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={0} y={0} width={w} height={h} rx={2} fill={FRAME} />
      {renderIcon()}
    </svg>
  );
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  isLoading,
}) => {
  // Agrupa templates da API por tipo de esquadria
  const templatesByType = React.useMemo(() => {
    const map = new Map<DoorTemplateType, WindowTemplate[]>();
    templates.forEach((t) => {
      if (t.templateType) {
        const existing = map.get(t.templateType) ?? [];
        map.set(t.templateType, [...existing, t]);
      }
    });
    return map;
  }, [templates]);

  // Se não há templates da API, usa os tipos estáticos como referência
  const hasApiTemplates = templates.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <span className="material-symbols-outlined animate-spin text-primary text-[28px]">progress_activity</span>
        <span className="ml-sm text-secondary font-body-sm">Carregando templates...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <p className="text-sm text-on-surface-variant font-body">
        Selecione o tipo de esquadria para configurar:
      </p>

      {!hasApiTemplates && (
        <div className="bg-surface-container border border-outline-variant rounded-md p-sm text-xs text-secondary font-body italic">
          Nenhum template cadastrado na API. Cadastre produtos com tipo de esquadria em Produtos Finais.
        </div>
      )}

      {CATEGORY_GROUPS.map((group) => {
        const groupTemplates = group.types.flatMap((type) => templatesByType.get(type) ?? []);
        if (!hasApiTemplates) return null;
        if (groupTemplates.length === 0) return null;

        return (
          <div key={group.label}>
            <h4 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
              {group.label}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
              {groupTemplates.map((template) => {
                const info = template.templateType ? TEMPLATE_TYPE_INFO[template.templateType] : null;
                const isSelected = selectedTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onSelect(template)}
                    className={`
                      relative flex flex-col items-center gap-xs p-sm rounded-lg border-2 transition-all text-left
                      hover:border-primary hover:bg-surface-container-low active:scale-98
                      ${isSelected
                        ? 'border-primary bg-secondary-container/30 shadow-sm'
                        : 'border-outline-variant bg-surface-container-lowest'
                      }
                    `}
                  >
                    {isSelected && (
                      <span className="absolute top-xs right-xs material-symbols-outlined text-primary text-[16px]">
                        check_circle
                      </span>
                    )}
                    <TemplateMiniSvg templateType={template.templateType!} />
                    <div className="w-full">
                      <p className="font-label font-semibold text-on-surface text-xs leading-tight line-clamp-2">
                        {template.name}
                      </p>
                      {info && (
                        <p className="text-[10px] text-on-surface-variant font-body mt-xs leading-tight">
                          {info.description}
                        </p>
                      )}
                      <p className="text-[10px] font-data-mono text-secondary mt-xs">
                        M.O.: R$ {template.laborCost.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Fallback: mostra todos os templates sem grouping se nenhum grupo matchou */}
      {hasApiTemplates && CATEGORY_GROUPS.every((g) => g.types.flatMap((t) => templatesByType.get(t) ?? []).length === 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
          {templates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                className={`
                  flex flex-col items-center gap-xs p-sm rounded-lg border-2 transition-all
                  hover:border-primary hover:bg-surface-container-low
                  ${isSelected ? 'border-primary bg-secondary-container/30' : 'border-outline-variant bg-surface-container-lowest'}
                `}
              >
                {template.templateType && <TemplateMiniSvg templateType={template.templateType} />}
                <p className="font-label font-semibold text-on-surface text-xs text-center">{template.name}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
