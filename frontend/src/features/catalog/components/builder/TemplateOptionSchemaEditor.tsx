import { useEffect } from 'react';
import type {
  DoorTemplateType,
  TemplateOptionSchema,
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
}

/**
 * Editor de opções permitidas no orçamento para cada template.
 * Usa progressive disclosure — sub-opções ficam ocultas até o toggle pai ser ativado.
 */
export function TemplateOptionSchemaEditor({
  templateType,
  optionSchema,
  setOptionSchema,
}: TemplateOptionSchemaEditorProps) {

  const applicable = templateType ? TEMPLATE_APPLICABLE_OPTIONS[templateType] : null;

  // Reset schema quando troca o template
  useEffect(() => {
    if (!templateType) return;
    const app = TEMPLATE_APPLICABLE_OPTIONS[templateType];

    setOptionSchema({
      allowOpeningDirection: app.openingDirection,
      allowedOpeningDirections: app.openingDirection ? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] : [],
      allowSlidingMode: app.slidingMode,
      allowedSlidingModes: app.slidingMode ? ['BOTH_SLIDING', 'LEFT_FIXED_RIGHT_SLIDING', 'RIGHT_FIXED_LEFT_SLIDING'] : [],
      allowHandle: app.handle,
      allowedHandleTypes: app.handle ? ['BAR_TUBULAR', 'SHELL_LOCK', 'LEVER_HANDLE'] : [],
      allowedHandlePositions: app.handle ? ['LEFT', 'RIGHT'] : [],
      allowDrilling: app.drilling,
      allowedDrillingModes: app.drilling ? ['EQUAL', 'CUSTOM'] : [],
      allowAluminumColors: ALUMINUM_COLORS.map(c => c.hex),
      allowGlassColors: GLASS_COLORS.map(c => c.hex),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType]);

  if (!templateType || !applicable) return null;

  const update = (field: keyof TemplateOptionSchema, value: unknown) => {
    setOptionSchema({ ...optionSchema, [field]: value });
  };

  const toggleInArray = <T extends string>(arr: T[] | undefined, item: T): T[] => {
    const current = arr || [];
    return current.includes(item)
      ? current.filter(x => x !== item)
      : [...current, item];
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
      <div className="p-md border-b border-outline-variant">
        <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
          Opções Permitidas no Orçamento
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
          Configure quais campos o vendedor poderá personalizar ao usar este template.
        </p>
      </div>

      <div className="p-lg flex flex-col gap-md">

        {/* --- Sentido de Abertura --- */}
        <OptionGroup
          label="Permitir alterar sentido de abertura"
          enabled={!!optionSchema.allowOpeningDirection}
          onToggle={(v) => update('allowOpeningDirection', v)}
          disabled={!applicable.openingDirection}
          disabledReason="Não aplicável para este modelo"
        >
          <CheckboxList<OpeningDirection>
            items={['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'OUTSIDE', 'INSIDE', 'CENTER_TO_SIDES']}
            labels={OPENING_DIRECTION_LABELS}
            selected={optionSchema.allowedOpeningDirections || []}
            onChange={(v) => update('allowedOpeningDirections', v)}
          />
        </OptionGroup>

        {/* --- Modo de Correr --- */}
        <OptionGroup
          label="Permitir alterar modo de correr"
          enabled={!!optionSchema.allowSlidingMode}
          onToggle={(v) => update('allowSlidingMode', v)}
          disabled={!applicable.slidingMode}
          disabledReason="Disponível apenas para Correr"
        >
          <CheckboxList<SlidingMode>
            items={['BOTH_SLIDING', 'LEFT_FIXED_RIGHT_SLIDING', 'RIGHT_FIXED_LEFT_SLIDING']}
            labels={SLIDING_MODE_LABELS}
            selected={optionSchema.allowedSlidingModes || []}
            onChange={(v) => update('allowedSlidingModes', v)}
          />
        </OptionGroup>

        {/* --- Puxador --- */}
        <OptionGroup
          label="Permitir configurar puxador"
          enabled={!!optionSchema.allowHandle}
          onToggle={(v) => update('allowHandle', v)}
          disabled={!applicable.handle}
          disabledReason="Não aplicável para este modelo"
        >
          <div className="flex flex-col gap-sm">
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant mb-xs block">Tipos permitidos:</span>
              <CheckboxList<HandleType>
                items={['BAR_TUBULAR', 'SHELL_LOCK', 'LEVER_HANDLE', 'NONE']}
                labels={HANDLE_TYPE_LABELS}
                selected={optionSchema.allowedHandleTypes || []}
                onChange={(v) => update('allowedHandleTypes', v)}
              />
            </div>
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant mb-xs block">Posições permitidas:</span>
              <CheckboxList<HandlePosition>
                items={['LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER']}
                labels={HANDLE_POSITION_LABELS}
                selected={optionSchema.allowedHandlePositions || []}
                onChange={(v) => update('allowedHandlePositions', v)}
              />
            </div>
          </div>
        </OptionGroup>

        {/* --- Furações --- */}
        <OptionGroup
          label="Permitir configurar furações"
          enabled={!!optionSchema.allowDrilling}
          onToggle={(v) => update('allowDrilling', v)}
          disabled={!applicable.drilling}
          disabledReason="Não aplicável para este modelo"
        >
          <CheckboxList<HoleDrillingMode>
            items={['EQUAL', 'CUSTOM']}
            labels={DRILLING_MODE_LABELS}
            selected={optionSchema.allowedDrillingModes || []}
            onChange={(v) => update('allowedDrillingModes', v)}
          />
        </OptionGroup>

        {/* --- Cores de Alumínio --- */}
        <OptionGroup
          label="Permitir alterar cor do alumínio"
          enabled={(optionSchema.allowAluminumColors?.length ?? 0) > 0}
          onToggle={(v) => update('allowAluminumColors', v ? ALUMINUM_COLORS.map(c => c.hex) : [])}
        >
          <div className="flex flex-wrap gap-sm">
            {ALUMINUM_COLORS.map((c) => {
              const selected = optionSchema.allowAluminumColors?.includes(c.hex);
              return (
                <label key={c.hex} className="flex items-center gap-xs cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary w-4 h-4"
                    checked={!!selected}
                    onChange={() => update('allowAluminumColors', toggleInArray(optionSchema.allowAluminumColors, c.hex))}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-outline-variant/60 inline-block"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-body-sm text-body-sm text-on-surface">{c.name}</span>
                </label>
              );
            })}
          </div>
        </OptionGroup>

        {/* --- Cores de Vidro --- */}
        <OptionGroup
          label="Permitir alterar tipo de vidro"
          enabled={(optionSchema.allowGlassColors?.length ?? 0) > 0}
          onToggle={(v) => update('allowGlassColors', v ? GLASS_COLORS.map(c => c.hex) : [])}
        >
          <div className="flex flex-wrap gap-sm">
            {GLASS_COLORS.map((c) => {
              const selected = optionSchema.allowGlassColors?.includes(c.hex);
              return (
                <label key={c.hex} className="flex items-center gap-xs cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary w-4 h-4"
                    checked={!!selected}
                    onChange={() => update('allowGlassColors', toggleInArray(optionSchema.allowGlassColors, c.hex))}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-outline-variant/60 inline-block"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-body-sm text-body-sm text-on-surface">{c.name}</span>
                </label>
              );
            })}
          </div>
        </OptionGroup>
      </div>
    </section>
  );
}

// --- Sub-componentes internos ---

interface OptionGroupProps {
  label: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  children: React.ReactNode;
}

function OptionGroup({ label, enabled, onToggle, disabled, disabledReason, children }: OptionGroupProps) {
  const isDisabled = disabled === true;

  return (
    <div className={`rounded-md border border-outline-variant/40 ${isDisabled ? 'opacity-50' : ''}`}>
      <label
        className={`flex items-center gap-sm p-sm cursor-pointer ${isDisabled ? 'cursor-not-allowed' : 'hover:bg-surface-container-low'} transition-colors rounded-t-md`}
        title={isDisabled ? disabledReason : undefined}
      >
        <input
          type="checkbox"
          className="accent-primary w-4 h-4"
          checked={enabled && !isDisabled}
          onChange={(e) => !isDisabled && onToggle(e.target.checked)}
          disabled={isDisabled}
        />
        <span className="font-label-md text-label-md text-on-surface font-medium">{label}</span>
        {isDisabled && (
          <span className="font-body-sm text-body-sm text-on-surface-variant italic ml-auto">
            {disabledReason}
          </span>
        )}
      </label>

      {enabled && !isDisabled && (
        <div className="px-lg py-sm border-t border-outline-variant/30 bg-surface-container-low/50 rounded-b-md">
          {children}
        </div>
      )}
    </div>
  );
}

interface CheckboxListProps<T extends string> {
  items: T[];
  labels: Record<T, string>;
  selected: T[];
  onChange: (val: T[]) => void;
}

function CheckboxList<T extends string>({ items, labels, selected, onChange }: CheckboxListProps<T>) {
  const toggle = (item: T) => {
    onChange(
      selected.includes(item)
        ? selected.filter(x => x !== item)
        : [...selected, item]
    );
  };

  return (
    <div className="flex flex-wrap gap-sm">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-xs cursor-pointer">
          <input
            type="checkbox"
            className="accent-primary w-4 h-4"
            checked={selected.includes(item)}
            onChange={() => toggle(item)}
          />
          <span className="font-body-sm text-body-sm text-on-surface">{labels[item]}</span>
        </label>
      ))}
    </div>
  );
}
