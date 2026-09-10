import { useState, useMemo } from 'react';
import { WindowSvgPreview } from '../../../budgets/components/builder/WindowSvgPreview';
import type { DoorTemplateType, TemplateConfig } from '../../types/templates';
import {
  DOOR_TEMPLATE_LABELS,
  DOOR_TEMPLATE_GROUPS,
} from '../../types/templates';

interface TemplateSelectorProps {
  templateType: DoorTemplateType | null;
  setTemplateType: (val: DoorTemplateType) => void;
  templateConfig?: Partial<TemplateConfig>;
  setTemplateConfig?: (val: Partial<TemplateConfig>) => void;
}

// Lista única ordenada dos 10 templates oficiais
const ALL_TEMPLATES: DoorTemplateType[] = [
  'SLIDING_DOOR_2F',
  'SLIDING_DOOR_4F',
  'SLIDING_DOOR_1F',
  'SLIDING_DOOR_3F',
  'SWING_DOOR_1F',
  'SWING_DOOR_2F',
  'AWNING_WINDOW_1F',
  'AWNING_WINDOW_1F_INV',
  'FRONT_DRAWER',
  'FIXED_PANEL',
];

// Badge descritivo de tipologia para cada template
const TEMPLATE_SUBTITLES: Record<DoorTemplateType, string> = {
  SLIDING_DOOR_1F: '1 Folha de Correr (Box / Painel)',
  SLIDING_DOOR_2F: '2 Folhas de Correr',
  SLIDING_DOOR_3F: '3 Folhas Deslizantes',
  SLIDING_DOOR_4F: '4 Folhas (2 Fixas + 2 Móveis)',
  SWING_DOOR_1F: '1 Folha com Dobradiça / Pivô',
  SWING_DOOR_2F: '2 Folhas de Abrir',
  AWNING_WINDOW_1F: 'Projeção para Fora',
  AWNING_WINDOW_1F_INV: 'Projeção para Dentro',
  FRONT_DRAWER: 'Perfil de Gaveta com Vidro',
  FIXED_PANEL: 'Vidro Fixo / Divisória',
};

export function TemplateSelector({
  templateType,
  setTemplateType,
  templateConfig,
}: TemplateSelectorProps) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // Filtra templates de acordo com a aba selecionada
  const displayedTemplates = useMemo(() => {
    if (selectedGroupFilter === 'all') return ALL_TEMPLATES;
    const group = DOOR_TEMPLATE_GROUPS.find((g) => g.id === selectedGroupFilter);
    return group ? group.types : ALL_TEMPLATES;
  }, [selectedGroupFilter]);

  const aluminumColor = templateConfig?.aluminumColor ?? '#212121';
  const glassColor = templateConfig?.glassColor ?? '#e3f2fd';

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Header com título e indicador de etapa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-outline-variant/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-title-sm text-base font-semibold text-on-surface flex items-center gap-2">
              Modelo de Esquadria <span className="text-error">*</span>
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 pl-8">
            Escolha o modelo paramétrico para geração dos cálculos de corte e visualização no Studio.
          </p>
        </div>

        {templateType && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold self-start sm:self-auto">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            {DOOR_TEMPLATE_LABELS[templateType]}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Abas de Categorias / Grupos (Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-outline-variant/40 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedGroupFilter('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedGroupFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs font-semibold'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">apps</span>
            Todos ({ALL_TEMPLATES.length})
          </button>

          {DOOR_TEMPLATE_GROUPS.map((group) => {
            const isSelected = selectedGroupFilter === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroupFilter(group.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{group.icon}</span>
                {group.label} ({group.types.length})
              </button>
            );
          })}
        </div>

        {/* Grade de Cards Visuais dos Modelos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayedTemplates.map((type) => {
            const isSelected = templateType === type;
            return (
              <div
                key={type}
                role="button"
                tabIndex={0}
                onClick={() => setTemplateType(type)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTemplateType(type);
                  }
                }}
                className={`relative flex flex-col text-left p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none group ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm scale-[1.01]'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low hover:shadow-xs'
                }`}
                aria-pressed={isSelected}
                aria-label={`Selecionar modelo ${DOOR_TEMPLATE_LABELS[type]}`}
              >
                {/* Badge de Selecionado */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-primary text-on-primary rounded-full shadow-xs flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                )}

                {/* Thumbnail SVG da Esquadria com fundo neutro limpo */}
                <div className="w-full h-24 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.03] p-1.5">
                  <WindowSvgPreview
                    templateType={type}
                    widthMm={1600}
                    heightMm={2000}
                    aluminumColor={isSelected ? aluminumColor : '#475569'}
                    glassFinish={isSelected ? glassColor : '#e2e8f0'}
                    handleConfig={{ handleType: 'NONE' }}
                    drillingConfig={{ holeCount: 0, divisionType: 'EQUAL' }}
                    baseWidth={120}
                    maxHeight={80}
                    minimal={true}
                  />
                </div>

                {/* Título e Subtítulo */}
                <div className="pt-2 px-1 flex flex-col">
                  <span
                    className={`text-xs font-semibold leading-tight line-clamp-2 ${
                      isSelected ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {DOOR_TEMPLATE_LABELS[type]}
                  </span>
                  <span className="text-[11px] text-on-surface-variant/70 mt-0.5 line-clamp-1">
                    {TEMPLATE_SUBTITLES[type]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
