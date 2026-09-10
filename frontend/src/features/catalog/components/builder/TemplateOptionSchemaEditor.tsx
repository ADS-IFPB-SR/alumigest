import { useState, useEffect } from 'react';
import type {
  DoorTemplateType,
  TemplateOptionSchema,
  TemplateConfig,
  HandleType,
  HandlePosition,
  OpeningDirection,
  SlidingMode,
  HoleDrillingMode,
} from '../../types/templates';
import {
  TEMPLATE_APPLICABLE_OPTIONS,
  HANDLE_TYPE_LABELS,
  HANDLE_POSITION_LABELS,
  OPENING_DIRECTION_LABELS,
  SLIDING_MODE_LABELS,
  DRILLING_MODE_LABELS,
  ALUMINUM_COLORS,
  GLASS_COLORS,
} from '../../types/templates';

interface TemplateOptionSchemaEditorProps {
  templateType: DoorTemplateType | null;
  optionSchema: Partial<TemplateOptionSchema>;
  setOptionSchema: (val: Partial<TemplateOptionSchema>) => void;
  templateConfig?: Partial<TemplateConfig>;
  setTemplateConfig?: React.Dispatch<React.SetStateAction<Partial<TemplateConfig>>>;
}

export function TemplateOptionSchemaEditor({
  templateType,
  optionSchema,
  setOptionSchema,
  templateConfig,
  setTemplateConfig,
}: TemplateOptionSchemaEditorProps) {
  const applicable = templateType ? TEMPLATE_APPLICABLE_OPTIONS[templateType as DoorTemplateType] : null;

  // Track expanded accordion sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    opening: false,
    sliding: false,
    handle: false,
    drilling: false,
    aluminum: false,
    glass: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset schema quando troca o template
  useEffect(() => {
    if (!templateType) return;
    const app = TEMPLATE_APPLICABLE_OPTIONS[templateType as DoorTemplateType];
    if (!app) return;

    setOptionSchema({
      allowOpeningDirection: app.openingDirection,
      allowedOpeningDirections: app.openingDirection ? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] : [],
      allowSlidingMode: app.slidingMode,
      allowedSlidingModes: app.slidingMode ? ['BOTH_SLIDING', 'LEFT_FIXED_RIGHT_SLIDING', 'RIGHT_FIXED_LEFT_SLIDING'] : [],
      allowHandle: app.handle,
      allowedHandleTypes: app.handle ? ['BAR_TUBULAR', 'SHELL_LOCK', 'LEVER_HANDLE'] : [],
      allowedHandlePositions: app.handle ? ['RIGHT', 'LEFT', 'CENTER'] : [],
      allowDrilling: app.drilling,
      allowedDrillingModes: app.drilling ? ['EQUAL', 'CUSTOM'] : [],
      allowAluminumColors: ALUMINUM_COLORS.map(c => c.hex),
      allowGlassColors: GLASS_COLORS.map(c => c.hex),
    });

    if (setTemplateConfig) {
      setTemplateConfig((prev) => ({
        ...prev,
        openingDirection: app.openingDirection ? (prev.openingDirection || 'LEFT_TO_RIGHT') : undefined,
        slidingMode: app.slidingMode ? (prev.slidingMode || 'BOTH_SLIDING') : undefined,
        handleConfig: app.handle ? {
          handleType: prev.handleConfig?.handleType || 'BAR_TUBULAR',
          handlePosition: prev.handleConfig?.handlePosition || 'RIGHT',
          position: prev.handleConfig?.position || 'RIGHT',
          handleLengthMm: prev.handleConfig?.handleLengthMm || 600,
          side: prev.handleConfig?.side || 'ONE_SIDE',
          coverage: prev.handleConfig?.coverage || 'PIECE',
          pieceLengthCm: prev.handleConfig?.pieceLengthCm || 60,
        } : { handleType: 'NONE' },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType]);

  if (!templateType || !applicable) return null;

  const update = (field: keyof TemplateOptionSchema, value: unknown) => {
    setOptionSchema({ ...optionSchema, [field]: value });
  };

  const toggleInArray = <T extends string>(arr: T[] | undefined, item: T): T[] => {
    const current = arr || [];
    return current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];
  };

  // --- Handlers de Sincronização em Tempo Real com o templateConfig (SVG Studio) ---

  const handleToggleOpeningDirection = (val: OpeningDirection) => {
    const current = optionSchema.allowedOpeningDirections || [];
    const isAdding = !current.includes(val);
    const next = isAdding ? [...current, val] : current.filter((x) => x !== val);
    update('allowedOpeningDirections', next);

    if (setTemplateConfig) {
      // Se clicou no item, ele se torna a prévia ativa. Se removeu, assume o próximo disponível
      const nextActive = isAdding ? val : (next[0] || 'LEFT_TO_RIGHT');
      setTemplateConfig((prev) => ({ ...prev, openingDirection: nextActive }));
    }
  };

  const handleToggleSlidingMode = (val: SlidingMode) => {
    const current = optionSchema.allowedSlidingModes || [];
    const isAdding = !current.includes(val);
    const next = isAdding ? [...current, val] : current.filter((x) => x !== val);
    update('allowedSlidingModes', next);

    if (setTemplateConfig) {
      const nextActive = isAdding ? val : (next[0] || 'BOTH_SLIDING');
      setTemplateConfig((prev) => ({ ...prev, slidingMode: nextActive }));
    }
  };

  const handleToggleHandleType = (val: HandleType) => {
    const current = optionSchema.allowedHandleTypes || [];
    const isAdding = !current.includes(val);
    const next = isAdding ? [...current, val] : current.filter((x) => x !== val);
    update('allowedHandleTypes', next);

    if (setTemplateConfig) {
      const nextActive = isAdding ? val : (next[0] || 'NONE');
      setTemplateConfig((prev) => ({
        ...prev,
        handleConfig: {
          ...(prev.handleConfig || { handleLengthMm: 600 }),
          handleType: nextActive,
        },
      }));
    }
  };

  const handleToggleHandlePosition = (val: HandlePosition) => {
    const current = optionSchema.allowedHandlePositions || [];
    const isAdding = !current.includes(val);
    const next = isAdding ? [...current, val] : current.filter((x) => x !== val);
    update('allowedHandlePositions', next);

    if (setTemplateConfig) {
      const nextActive = isAdding ? val : (next[0] || 'RIGHT');
      setTemplateConfig((prev) => ({
        ...prev,
        handleConfig: {
          ...(prev.handleConfig || { handleType: 'BAR_TUBULAR', handleLengthMm: 600 }),
          handlePosition: nextActive,
          position: nextActive,
        },
      }));
    }
  };

  const handleToggleDrillingMode = (val: HoleDrillingMode) => {
    const current = optionSchema.allowedDrillingModes || [];
    const isAdding = !current.includes(val);
    const next = isAdding ? [...current, val] : current.filter((x) => x !== val);
    update('allowedDrillingModes', next);

    if (setTemplateConfig) {
      const nextActive = isAdding ? val : (next[0] || 'EQUAL');
      setTemplateConfig((prev) => ({
        ...prev,
        drillingConfig: {
          holeCount: prev.drillingConfig?.holeCount ?? 2,
          drillingMode: nextActive,
          customPositionsMm: prev.drillingConfig?.customPositionsMm,
        },
      }));
    }
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-outline-variant/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-title-sm text-base font-semibold text-on-surface flex items-center gap-2">
              Opções Permitidas no Orçamento
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 pl-8">
            Defina o que o orçamentista poderá customizar e alterar para esta esquadria. As seleções atualizam a maquete Studio em tempo real.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* --- 1. Sentido de Abertura --- */}
        {applicable.openingDirection && (
          <ModernAccordion
            icon="swipe"
            title="Sentido de Abertura"
            enabled={!!optionSchema.allowOpeningDirection}
            onToggle={(v) => {
              update('allowOpeningDirection', v);
              if (v) {
                setExpandedSections((prev) => ({ ...prev, opening: true }));
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({ ...prev, openingDirection: prev.openingDirection || 'LEFT_TO_RIGHT' }));
                }
              }
            }}
            summary={
              optionSchema.allowOpeningDirection
                ? `${optionSchema.allowedOpeningDirections?.length || 0} sentidos permitidos`
                : 'Fixo pelo padrão'
            }
            isOpen={!!expandedSections.opening && !!optionSchema.allowOpeningDirection}
            onToggleOpen={() => toggleSection('opening')}
          >
            <ChipGroup<OpeningDirection>
              items={['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'OUTSIDE', 'INSIDE', 'CENTER_TO_SIDES']}
              labels={OPENING_DIRECTION_LABELS}
              selected={optionSchema.allowedOpeningDirections || []}
              activeItem={templateConfig?.openingDirection}
              onToggleItem={handleToggleOpeningDirection}
            />
          </ModernAccordion>
        )}

        {/* --- 2. Modo de Correr --- */}
        {applicable.slidingMode && (
          <ModernAccordion
            icon="view_column"
            title="Modo de Folhas Deslizantes"
            enabled={!!optionSchema.allowSlidingMode}
            onToggle={(v) => {
              update('allowSlidingMode', v);
              if (v) {
                setExpandedSections((prev) => ({ ...prev, sliding: true }));
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({ ...prev, slidingMode: prev.slidingMode || 'BOTH_SLIDING' }));
                }
              }
            }}
            summary={
              optionSchema.allowSlidingMode
                ? `${optionSchema.allowedSlidingModes?.length || 0} modos permitidos`
                : 'Fixo pelo padrão'
            }
            isOpen={!!expandedSections.sliding && !!optionSchema.allowSlidingMode}
            onToggleOpen={() => toggleSection('sliding')}
          >
            <ChipGroup<SlidingMode>
              items={['BOTH_SLIDING', 'LEFT_FIXED_RIGHT_SLIDING', 'RIGHT_FIXED_LEFT_SLIDING']}
              labels={SLIDING_MODE_LABELS}
              selected={optionSchema.allowedSlidingModes || []}
              activeItem={templateConfig?.slidingMode}
              onToggleItem={handleToggleSlidingMode}
            />
          </ModernAccordion>
        )}

        {/* --- 3. Puxador --- */}
        {applicable.handle && (
          <ModernAccordion
            icon="door_sensor"
            title="Puxadores e Fechaduras"
            enabled={!!optionSchema.allowHandle}
            onToggle={(v) => {
              update('allowHandle', v);
              if (v) {
                setExpandedSections((prev) => ({ ...prev, handle: true }));
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({
                    ...prev,
                    handleConfig: {
                      handleType: 'BAR_TUBULAR',
                      handlePosition: 'RIGHT',
                      position: 'RIGHT',
                      handleLengthMm: 600,
                      side: 'ONE_SIDE',
                      coverage: 'PIECE',
                      pieceLengthCm: 60,
                    },
                  }));
                }
              } else if (setTemplateConfig) {
                setTemplateConfig((prev) => ({
                  ...prev,
                  handleConfig: { handleType: 'NONE' },
                }));
              }
            }}
            summary={
              optionSchema.allowHandle
                ? `${optionSchema.allowedHandleTypes?.length || 0} tipos / ${optionSchema.allowedHandlePositions?.length || 0} posições`
                : 'Sem escolha de puxador'
            }
            isOpen={!!expandedSections.handle && !!optionSchema.allowHandle}
            onToggleOpen={() => toggleSection('handle')}
          >
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">Modelos de Puxador:</span>
                <ChipGroup<HandleType>
                  items={['BAR_TUBULAR', 'SHELL_LOCK', 'LEVER_HANDLE', 'NONE']}
                  labels={HANDLE_TYPE_LABELS}
                  selected={optionSchema.allowedHandleTypes || []}
                  activeItem={templateConfig?.handleConfig?.handleType}
                  onToggleItem={handleToggleHandleType}
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">Posições Permitidas:</span>
                <ChipGroup<HandlePosition>
                  items={['LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER']}
                  labels={HANDLE_POSITION_LABELS}
                  selected={optionSchema.allowedHandlePositions || []}
                  activeItem={templateConfig?.handleConfig?.handlePosition || templateConfig?.handleConfig?.position}
                  onToggleItem={handleToggleHandlePosition}
                />
              </div>
            </div>
          </ModernAccordion>
        )}

        {/* --- 4. Furações --- */}
        {applicable.drilling && (
          <ModernAccordion
            icon="circle"
            title="Furações e Divisões Paramétricas"
            enabled={!!optionSchema.allowDrilling}
            onToggle={(v) => {
              update('allowDrilling', v);
              if (v) {
                setExpandedSections((prev) => ({ ...prev, drilling: true }));
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({
                    ...prev,
                    drillingConfig: { holeCount: 2, drillingMode: 'EQUAL' },
                  }));
                }
              } else if (setTemplateConfig) {
                setTemplateConfig((prev) => ({
                  ...prev,
                  drillingConfig: { holeCount: 0, drillingMode: 'EQUAL' },
                }));
              }
            }}
            summary={
              optionSchema.allowDrilling
                ? `${optionSchema.allowedDrillingModes?.length || 0} divisões permitidas`
                : 'Fixo pelo padrão'
            }
            isOpen={!!expandedSections.drilling && !!optionSchema.allowDrilling}
            onToggleOpen={() => toggleSection('drilling')}
          >
            <ChipGroup<HoleDrillingMode>
              items={['EQUAL', 'CUSTOM']}
              labels={DRILLING_MODE_LABELS}
              selected={optionSchema.allowedDrillingModes || []}
              activeItem={templateConfig?.drillingConfig?.drillingMode}
              onToggleItem={handleToggleDrillingMode}
            />
          </ModernAccordion>
        )}

        {/* --- 5. Cores do Alumínio --- */}
        <ModernAccordion
          icon="palette"
          title="Cores de Alumínio Permitidas"
          enabled={(optionSchema.allowAluminumColors?.length ?? 0) > 0}
          onToggle={(v) => {
            update('allowAluminumColors', v ? ALUMINUM_COLORS.map(c => c.hex) : []);
            if (v) setExpandedSections(prev => ({ ...prev, aluminum: true }));
          }}
          summary={
            (optionSchema.allowAluminumColors?.length ?? 0) > 0
              ? `${optionSchema.allowAluminumColors?.length} cores ativas`
              : 'Nenhuma cor disponível'
          }
          isOpen={!!expandedSections.aluminum && (optionSchema.allowAluminumColors?.length ?? 0) > 0}
          onToggleOpen={() => toggleSection('aluminum')}
        >
          <div className="flex flex-wrap gap-2">
            {ALUMINUM_COLORS.map((c) => {
              const selected = optionSchema.allowAluminumColors?.includes(c.hex);
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => update('allowAluminumColors', toggleInArray(optionSchema.allowAluminumColors, c.hex))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    selected
                      ? 'border-primary bg-primary/8 text-primary shadow-xs'
                      : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  {selected && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </ModernAccordion>

        {/* --- 6. Cores do Vidro --- */}
        <ModernAccordion
          icon="window"
          title="Acabamentos de Vidro Permitidos"
          enabled={(optionSchema.allowGlassColors?.length ?? 0) > 0}
          onToggle={(v) => {
            update('allowGlassColors', v ? GLASS_COLORS.map(c => c.hex) : []);
            if (v) setExpandedSections(prev => ({ ...prev, glass: true }));
          }}
          summary={
            (optionSchema.allowGlassColors?.length ?? 0) > 0
              ? `${optionSchema.allowGlassColors?.length} acabamentos ativos`
              : 'Nenhum vidro disponível'
          }
          isOpen={!!expandedSections.glass && (optionSchema.allowGlassColors?.length ?? 0) > 0}
          onToggleOpen={() => toggleSection('glass')}
        >
          <div className="flex flex-wrap gap-2">
            {GLASS_COLORS.map((c) => {
              const selected = optionSchema.allowGlassColors?.includes(c.hex);
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => update('allowGlassColors', toggleInArray(optionSchema.allowGlassColors, c.hex))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    selected
                      ? 'border-primary bg-primary/8 text-primary shadow-xs'
                      : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  {selected && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </ModernAccordion>
      </div>
    </section>
  );
}

// --- Componente de Acordeão com Switch integrado ---
interface ModernAccordionProps {
  icon: string;
  title: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  summary: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  children: React.ReactNode;
}

function ModernAccordion({
  icon,
  title,
  enabled,
  onToggle,
  summary,
  isOpen,
  onToggleOpen,
  children,
}: ModernAccordionProps) {
  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden ${
        enabled
          ? 'border-outline-variant/80 bg-surface-container-lowest'
          : 'border-outline-variant/40 bg-surface-container-low/20 opacity-75'
      }`}
    >
      <div className="flex items-center justify-between p-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Switch Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggle(!enabled)}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              enabled ? 'bg-primary' : 'bg-outline-variant/80'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">{icon}</span>
            <span className="text-xs font-semibold text-on-surface truncate">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              enabled
                ? 'bg-primary/8 text-primary'
                : 'bg-surface-container-high text-on-surface-variant/60'
            }`}
          >
            {summary}
          </span>

          {enabled && (
            <button
              type="button"
              onClick={onToggleOpen}
              className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              title={isOpen ? 'Recolher detalhes' : 'Expandir opções'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Expansível */}
      {enabled && isOpen && (
        <div className="p-3.5 pt-1 border-t border-outline-variant/40 bg-surface-container-low/30">
          {children}
        </div>
      )}
    </div>
  );
}

// --- Grupo de Chips Selecionáveis ---
interface ChipGroupProps<T extends string> {
  items: T[];
  labels: Record<T, string>;
  selected: T[];
  activeItem?: T;
  onToggleItem: (item: T) => void;
}

function ChipGroup<T extends string>({ items, labels, selected, activeItem, onToggleItem }: ChipGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const isChecked = selected.includes(item);
        const isActive = isChecked && activeItem === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggleItem(item)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'border-primary bg-primary/15 text-primary font-bold shadow-xs ring-1 ring-primary/40'
                : isChecked
                ? 'border-primary/50 bg-primary/8 text-primary font-semibold shadow-xs'
                : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border transition-colors ${
                isChecked
                  ? 'bg-primary border-primary text-on-primary'
                  : 'border-outline-variant/80 bg-surface-container-lowest'
              }`}
            >
              {isChecked && <span className="material-symbols-outlined text-[12px]">check</span>}
            </span>
            <span>{labels[item] || item}</span>
            {isActive && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-primary text-on-primary leading-none">
                Prévia
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
