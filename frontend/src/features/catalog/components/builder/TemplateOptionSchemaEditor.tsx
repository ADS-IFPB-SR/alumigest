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
  DrillingPosition,
} from '../../types/templates';
import {
  TEMPLATE_APPLICABLE_OPTIONS,
  TEMPLATE_DEFAULT_DRILLING_POSITION,
  HANDLE_TYPE_LABELS,
  HANDLE_POSITION_LABELS,
  OPENING_DIRECTION_LABELS,
  SLIDING_MODE_LABELS,
  DRILLING_MODE_LABELS,
  DRILLING_POSITION_LABELS,
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

function getDefaultOptionSchema(app: (typeof TEMPLATE_APPLICABLE_OPTIONS)[DoorTemplateType], defaultDrillPos: DrillingPosition): Partial<TemplateOptionSchema> {
  return {
    allowOpeningDirection: app.openingDirection,
    allowedOpeningDirections: app.openingDirection ? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] : [],
    allowSlidingMode: app.slidingMode,
    allowedSlidingModes: app.slidingMode ? ['BOTH_SLIDING', 'LEFT_FIXED_RIGHT_SLIDING', 'RIGHT_FIXED_LEFT_SLIDING'] : [],
    allowHandle: app.handle,
    allowedHandleTypes: app.handle ? ['BAR_TUBULAR', 'SHELL_LOCK', 'LEVER_HANDLE'] : [],
    allowedHandlePositions: app.handle ? ['RIGHT', 'LEFT', 'CENTER'] : [],
    allowDrilling: app.drilling,
    allowedDrillingModes: app.drilling ? ['EQUAL', 'CUSTOM'] : [],
    allowedDrillingPositions: app.drilling ? [defaultDrillPos] : [],
    allowAluminumColors: ALUMINUM_COLORS.map(c => c.hex),
    allowGlassColors: GLASS_COLORS.map(c => c.hex),
  };
}

function getInitialTemplateConfig(
  app: (typeof TEMPLATE_APPLICABLE_OPTIONS)[DoorTemplateType],
  defaultDrillPos: DrillingPosition,
  prev: Partial<TemplateConfig>
): Partial<TemplateConfig> {
  return {
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
    drillingConfig: app.drilling ? {
      holeCount: prev.drillingConfig?.holeCount ?? 2,
      drillingMode: prev.drillingConfig?.drillingMode || 'EQUAL',
      drillingPosition: prev.drillingConfig?.drillingPosition || defaultDrillPos,
      customPositionsMm: prev.drillingConfig?.customPositionsMm,
    } : undefined,
  };
}

// --- Seção: Sentido de Abertura ---
interface OpeningDirectionSectionProps {
  optionSchema: Partial<TemplateOptionSchema>;
  templateConfig?: Partial<TemplateConfig>;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleItem: (val: OpeningDirection) => void;
}

function OpeningDirectionSection({
  optionSchema,
  templateConfig,
  isOpen,
  onToggleOpen,
  onToggleEnabled,
  onToggleItem,
}: OpeningDirectionSectionProps) {
  const summary = optionSchema.allowOpeningDirection
    ? `${optionSchema.allowedOpeningDirections?.length || 0} sentidos permitidos`
    : 'Fixo pelo padrão';

  return (
    <ModernAccordion
      icon="swipe"
      title="Sentido de Abertura"
      enabled={!!optionSchema.allowOpeningDirection}
      onToggle={onToggleEnabled}
      summary={summary}
      isOpen={isOpen && !!optionSchema.allowOpeningDirection}
      onToggleOpen={onToggleOpen}
    >
      <ChipGroup<OpeningDirection>
        items={['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'OUTSIDE', 'INSIDE', 'CENTER_TO_SIDES']}
        labels={OPENING_DIRECTION_LABELS}
        selected={optionSchema.allowedOpeningDirections || []}
        activeItem={templateConfig?.openingDirection}
        onToggleItem={onToggleItem}
      />
    </ModernAccordion>
  );
}

// --- Seção: Modo de Correr ---
interface SlidingModeSectionProps {
  optionSchema: Partial<TemplateOptionSchema>;
  templateConfig?: Partial<TemplateConfig>;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleItem: (val: SlidingMode) => void;
}

function SlidingModeSection({
  optionSchema,
  templateConfig,
  isOpen,
  onToggleOpen,
  onToggleEnabled,
  onToggleItem,
}: SlidingModeSectionProps) {
  const summary = optionSchema.allowSlidingMode
    ? `${optionSchema.allowedSlidingModes?.length || 0} modos permitidos`
    : 'Fixo pelo padrão';

  return (
    <ModernAccordion
      icon="view_column"
      title="Modo de Folhas Deslizantes"
      enabled={!!optionSchema.allowSlidingMode}
      onToggle={onToggleEnabled}
      summary={summary}
      isOpen={isOpen && !!optionSchema.allowSlidingMode}
      onToggleOpen={onToggleOpen}
    >
      <ChipGroup<SlidingMode>
        items={['BOTH_SLIDING', 'LEFT_FIXED_RIGHT_SLIDING', 'RIGHT_FIXED_LEFT_SLIDING']}
        labels={SLIDING_MODE_LABELS}
        selected={optionSchema.allowedSlidingModes || []}
        activeItem={templateConfig?.slidingMode}
        onToggleItem={onToggleItem}
      />
    </ModernAccordion>
  );
}

// --- Seção: Puxador ---
interface HandleSectionProps {
  optionSchema: Partial<TemplateOptionSchema>;
  templateConfig?: Partial<TemplateConfig>;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleType: (val: HandleType) => void;
  onTogglePosition: (val: HandlePosition) => void;
}

function HandleSection({
  optionSchema,
  templateConfig,
  isOpen,
  onToggleOpen,
  onToggleEnabled,
  onToggleType,
  onTogglePosition,
}: HandleSectionProps) {
  const summary = optionSchema.allowHandle
    ? `${optionSchema.allowedHandleTypes?.length || 0} tipos / ${optionSchema.allowedHandlePositions?.length || 0} posições`
    : 'Sem escolha de puxador';

  return (
    <ModernAccordion
      icon="door_sensor"
      title="Puxadores e Fechaduras"
      enabled={!!optionSchema.allowHandle}
      onToggle={onToggleEnabled}
      summary={summary}
      isOpen={isOpen && !!optionSchema.allowHandle}
      onToggleOpen={onToggleOpen}
    >
      <div className="flex flex-col gap-3">
        <div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">Modelos de Puxador:</span>
          <ChipGroup<HandleType>
            items={['BAR_TUBULAR', 'SHELL_LOCK', 'LEVER_HANDLE', 'NONE']}
            labels={HANDLE_TYPE_LABELS}
            selected={optionSchema.allowedHandleTypes || []}
            activeItem={templateConfig?.handleConfig?.handleType}
            onToggleItem={onToggleType}
          />
        </div>
        <div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">Posições Permitidas:</span>
          <ChipGroup<HandlePosition>
            items={['LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER']}
            labels={HANDLE_POSITION_LABELS}
            selected={optionSchema.allowedHandlePositions || []}
            activeItem={templateConfig?.handleConfig?.handlePosition || templateConfig?.handleConfig?.position}
            onToggleItem={onTogglePosition}
          />
        </div>
      </div>
    </ModernAccordion>
  );
}

// --- Seção: Furações ---
interface DrillingSectionProps {
  templateType: DoorTemplateType;
  optionSchema: Partial<TemplateOptionSchema>;
  templateConfig?: Partial<TemplateConfig>;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onTogglePosition: (val: DrillingPosition) => void;
  onToggleMode: (val: HoleDrillingMode) => void;
  onSetHoleCount: (count: number) => void;
}

function DrillingSection({
  templateType,
  optionSchema,
  templateConfig,
  isOpen,
  onToggleOpen,
  onToggleEnabled,
  onTogglePosition,
  onToggleMode,
  onSetHoleCount,
}: DrillingSectionProps) {
  const defaultPos = TEMPLATE_DEFAULT_DRILLING_POSITION[templateType] || 'SUPERIOR';
  const currentPos = templateConfig?.drillingConfig?.drillingPosition || defaultPos;
  const posLabel = currentPos === 'SUPERIOR' ? 'Borda Superior' : currentPos === 'FRONTAL' ? 'Frontal' : 'Lateral';

  const summary = optionSchema.allowDrilling
    ? `${templateConfig?.drillingConfig?.holeCount ?? 2} furos · ${posLabel} · ${optionSchema.allowedDrillingPositions?.length || 0} posições`
    : 'Fixo pelo padrão';

  return (
    <ModernAccordion
      icon="circle"
      title="Furações e Divisões Paramétricas"
      enabled={!!optionSchema.allowDrilling}
      onToggle={onToggleEnabled}
      summary={summary}
      isOpen={isOpen && !!optionSchema.allowDrilling}
      onToggleOpen={onToggleOpen}
    >
      <div className="flex flex-col gap-3">
        {/* Quantidade de Furos Padrão */}
        <div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">
            Quantidade de Furos Padrão (Prévia Studio):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4].map((num) => {
              const isSelected = (templateConfig?.drillingConfig?.holeCount ?? 2) === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onSetHoleCount(num)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {num === 0 ? 'Sem furos' : `${num} Furo${num > 1 ? 's' : ''}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Posições de Furação Permitidas */}
        <div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">
            Posições de Furação Permitidas no Orçamento:
          </span>
          <ChipGroup<DrillingPosition>
            items={['SUPERIOR', 'LATERAL', 'FRONTAL']}
            labels={DRILLING_POSITION_LABELS}
            selected={optionSchema.allowedDrillingPositions || []}
            activeItem={currentPos}
            onToggleItem={onTogglePosition}
          />
        </div>

        {/* Modos de Cálculo de Espaçamento */}
        <div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">
            Modos de Espaçamento Permitidos:
          </span>
          <ChipGroup<HoleDrillingMode>
            items={['EQUAL', 'CUSTOM']}
            labels={DRILLING_MODE_LABELS}
            selected={optionSchema.allowedDrillingModes || []}
            activeItem={templateConfig?.drillingConfig?.drillingMode}
            onToggleItem={onToggleMode}
          />
        </div>
      </div>
    </ModernAccordion>
  );
}

// --- Seção: Cores e Acabamentos ---
interface ColorPaletteSectionProps {
  icon: string;
  title: string;
  colors: readonly { hex: string; name: string }[];
  selectedColors?: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleColor: (hex: string) => void;
}

function ColorPaletteSection({
  icon,
  title,
  colors,
  selectedColors = [],
  isOpen,
  onToggleOpen,
  onToggleEnabled,
  onToggleColor,
}: ColorPaletteSectionProps) {
  const isEnabled = selectedColors.length > 0;
  const summary = isEnabled ? `${selectedColors.length} opções ativas` : 'Nenhuma cor disponível';

  return (
    <ModernAccordion
      icon={icon}
      title={title}
      enabled={isEnabled}
      onToggle={onToggleEnabled}
      summary={summary}
      isOpen={isOpen && isEnabled}
      onToggleOpen={onToggleOpen}
    >
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => {
          const selected = selectedColors.includes(c.hex);
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => onToggleColor(c.hex)}
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
  );
}

export function TemplateOptionSchemaEditor({
  templateType,
  optionSchema,
  setOptionSchema,
  templateConfig,
  setTemplateConfig,
}: TemplateOptionSchemaEditorProps) {
  const applicable = templateType ? TEMPLATE_APPLICABLE_OPTIONS[templateType as DoorTemplateType] : null;

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

    const defaultDrillPos = TEMPLATE_DEFAULT_DRILLING_POSITION[templateType as DoorTemplateType] || 'SUPERIOR';

    setOptionSchema(getDefaultOptionSchema(app, defaultDrillPos));

    if (setTemplateConfig) {
      setTemplateConfig((prev) => getInitialTemplateConfig(app, defaultDrillPos, prev));
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

  // Handlers
  const handleToggleOpeningDirection = (val: OpeningDirection) => {
    const current = optionSchema.allowedOpeningDirections || [];
    const isAdding = !current.includes(val);
    const next = isAdding ? [...current, val] : current.filter((x) => x !== val);
    update('allowedOpeningDirections', next);

    if (setTemplateConfig) {
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
      const fallbackPos = TEMPLATE_DEFAULT_DRILLING_POSITION[templateType] || 'SUPERIOR';
      const nextActive = isAdding ? val : (next[0] || 'EQUAL');
      setTemplateConfig((prev) => ({
        ...prev,
        drillingConfig: {
          holeCount: prev.drillingConfig?.holeCount ?? 2,
          drillingMode: nextActive,
          drillingPosition: prev.drillingConfig?.drillingPosition || fallbackPos,
          customPositionsMm: prev.drillingConfig?.customPositionsMm,
        },
      }));
    }
  };

  const handleToggleDrillingPosition = (val: DrillingPosition) => {
    const current = optionSchema.allowedDrillingPositions || [];
    const isCurrentlySelected = current.includes(val);
    const isCurrentlyActive = templateConfig?.drillingConfig?.drillingPosition === val;

    if (isCurrentlySelected && !isCurrentlyActive) {
      if (setTemplateConfig) {
        setTemplateConfig((prev) => {
          const currentCount = prev.drillingConfig?.holeCount ?? 2;
          const adjustedCount = (val === 'FRONTAL' && currentCount < 4) ? 4 : (currentCount === 0 ? 2 : currentCount);
          return {
            ...prev,
            drillingConfig: {
              holeCount: adjustedCount,
              drillingMode: prev.drillingConfig?.drillingMode || 'EQUAL',
              drillingPosition: val,
              customPositionsMm: prev.drillingConfig?.customPositionsMm,
            },
          };
        });
      }
      return;
    }

    const next = !isCurrentlySelected ? [...current, val] : current.filter((x) => x !== val);
    update('allowedDrillingPositions', next);

    if (setTemplateConfig) {
      const fallbackPos = TEMPLATE_DEFAULT_DRILLING_POSITION[templateType] || 'SUPERIOR';
      const nextActive = !isCurrentlySelected ? val : (next[0] || fallbackPos);
      setTemplateConfig((prev) => {
        const currentCount = prev.drillingConfig?.holeCount ?? 2;
        const adjustedCount = (nextActive === 'FRONTAL' && currentCount < 4) ? 4 : (currentCount === 0 ? 2 : currentCount);
        return {
          ...prev,
          drillingConfig: {
            holeCount: adjustedCount,
            drillingMode: prev.drillingConfig?.drillingMode || 'EQUAL',
            drillingPosition: nextActive,
            customPositionsMm: prev.drillingConfig?.customPositionsMm,
          },
        };
      });
    }
  };

  const handleSetHoleCount = (count: number) => {
    if (setTemplateConfig) {
      const fallbackPos = TEMPLATE_DEFAULT_DRILLING_POSITION[templateType] || 'SUPERIOR';
      setTemplateConfig((prev) => ({
        ...prev,
        drillingConfig: {
          holeCount: count,
          drillingMode: prev.drillingConfig?.drillingMode || 'EQUAL',
          drillingPosition: prev.drillingConfig?.drillingPosition || fallbackPos,
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
        {applicable.openingDirection && (
          <OpeningDirectionSection
            optionSchema={optionSchema}
            templateConfig={templateConfig}
            isOpen={!!expandedSections.opening}
            onToggleOpen={() => toggleSection('opening')}
            onToggleEnabled={(v) => {
              update('allowOpeningDirection', v);
              if (v) {
                setExpandedSections((prev) => ({ ...prev, opening: true }));
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({ ...prev, openingDirection: prev.openingDirection || 'LEFT_TO_RIGHT' }));
                }
              }
            }}
            onToggleItem={handleToggleOpeningDirection}
          />
        )}

        {applicable.slidingMode && (
          <SlidingModeSection
            optionSchema={optionSchema}
            templateConfig={templateConfig}
            isOpen={!!expandedSections.sliding}
            onToggleOpen={() => toggleSection('sliding')}
            onToggleEnabled={(v) => {
              update('allowSlidingMode', v);
              if (v) {
                setExpandedSections((prev) => ({ ...prev, sliding: true }));
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({ ...prev, slidingMode: prev.slidingMode || 'BOTH_SLIDING' }));
                }
              }
            }}
            onToggleItem={handleToggleSlidingMode}
          />
        )}

        {applicable.handle && (
          <HandleSection
            optionSchema={optionSchema}
            templateConfig={templateConfig}
            isOpen={!!expandedSections.handle}
            onToggleOpen={() => toggleSection('handle')}
            onToggleEnabled={(v) => {
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
                setTemplateConfig((prev) => ({ ...prev, handleConfig: { handleType: 'NONE' } }));
              }
            }}
            onToggleType={handleToggleHandleType}
            onTogglePosition={handleToggleHandlePosition}
          />
        )}

        {applicable.drilling && (
          <DrillingSection
            templateType={templateType}
            optionSchema={optionSchema}
            templateConfig={templateConfig}
            isOpen={!!expandedSections.drilling}
            onToggleOpen={() => toggleSection('drilling')}
            onToggleEnabled={(v) => {
              update('allowDrilling', v);
              const defaultPos = TEMPLATE_DEFAULT_DRILLING_POSITION[templateType] || 'SUPERIOR';
              if (v) {
                setExpandedSections((prev) => ({ ...prev, drilling: true }));
                update('allowedDrillingPositions', [defaultPos]);
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({
                    ...prev,
                    drillingConfig: {
                      holeCount: prev.drillingConfig?.holeCount || 2,
                      drillingMode: prev.drillingConfig?.drillingMode || 'EQUAL',
                      drillingPosition: prev.drillingConfig?.drillingPosition || defaultPos,
                    },
                  }));
                }
              } else {
                update('allowedDrillingPositions', []);
                if (setTemplateConfig) {
                  setTemplateConfig((prev) => ({
                    ...prev,
                    drillingConfig: {
                      holeCount: 0,
                      drillingMode: 'EQUAL',
                      drillingPosition: defaultPos,
                    },
                  }));
                }
              }
            }}
            onTogglePosition={handleToggleDrillingPosition}
            onToggleMode={handleToggleDrillingMode}
            onSetHoleCount={handleSetHoleCount}
          />
        )}

        <ColorPaletteSection
          icon="palette"
          title="Cores de Alumínio Permitidas"
          colors={ALUMINUM_COLORS}
          selectedColors={optionSchema.allowAluminumColors}
          isOpen={!!expandedSections.aluminum}
          onToggleOpen={() => toggleSection('aluminum')}
          onToggleEnabled={(v) => {
            update('allowAluminumColors', v ? ALUMINUM_COLORS.map(c => c.hex) : []);
            if (v) setExpandedSections(prev => ({ ...prev, aluminum: true }));
          }}
          onToggleColor={(hex) => update('allowAluminumColors', toggleInArray(optionSchema.allowAluminumColors, hex))}
        />

        <ColorPaletteSection
          icon="window"
          title="Acabamentos de Vidro Permitidos"
          colors={GLASS_COLORS}
          selectedColors={optionSchema.allowGlassColors}
          isOpen={!!expandedSections.glass}
          onToggleOpen={() => toggleSection('glass')}
          onToggleEnabled={(v) => {
            update('allowGlassColors', v ? GLASS_COLORS.map(c => c.hex) : []);
            if (v) setExpandedSections(prev => ({ ...prev, glass: true }));
          }}
          onToggleColor={(hex) => update('allowGlassColors', toggleInArray(optionSchema.allowGlassColors, hex))}
        />
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
            aria-label={enabled ? `Desativar restrição de ${title}` : `Ativar restrição de ${title}`}
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
