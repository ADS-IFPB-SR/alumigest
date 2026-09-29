import { WindowSvgPreview } from '../../../budgets/components/builder/WindowSvgPreview';
import type { DoorTemplateType, MaterialCategoryType, TemplateConfig } from '../../types/templates';
import {
  DOOR_TEMPLATE_LABELS,
  DOOR_TEMPLATE_GROUPS,
  TEMPLATE_DEFAULT_DRILLING_POSITION,
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORY_ICONS,
  HANDLE_TYPE_LABELS,
  HANDLE_POSITION_LABELS,
  OPENING_DIRECTION_LABELS,
  ALUMINUM_COLORS,
  GLASS_COLORS,
} from '../../types/templates';

const DRILLING_POSITION_LABELS: Record<string, string> = {
  SUPERIOR: 'Superior',
  FRONTAL: 'Frontal',
  LATERAL: 'Lateral',
};

interface ProductCostSummaryProps {
  readonly name: string;
  readonly templateType: DoorTemplateType | null;
  readonly templateConfig: Partial<TemplateConfig>;
  readonly setTemplateConfig: (val: Partial<TemplateConfig>) => void;
  readonly categoryRequirements: readonly MaterialCategoryType[];
  readonly onSave: () => void;
  readonly isPending: boolean;
  readonly isEditing: boolean;
}

function getSaveButtonLabel(isPending: boolean, isEditing: boolean): string {
  if (isPending) return 'Salvando alterações...';
  return isEditing ? 'Atualizar Esquadria' : 'Salvar Nova Esquadria';
}

interface CadMockupCardProps {
  readonly templateType: DoorTemplateType | null;
  readonly templateConfig: Partial<TemplateConfig>;
  readonly profileMm: number;
  readonly aluminumColor: string;
  readonly glassColor: string;
  readonly onColorChange: (field: keyof TemplateConfig, value: string) => void;
}

function CadMockupCard({
  templateType,
  templateConfig,
  profileMm,
  aluminumColor,
  glassColor,
  onColorChange,
}: CadMockupCardProps) {
  if (!templateType) {
    return (
      <div className="w-full rounded-lg bg-surface-container-low/50 border border-outline-variant/40 flex items-center justify-center p-2 min-h-[220px]">
        <div className="p-6 text-center flex flex-col items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[36px] text-primary/40">draw</span>
          <p className="text-xs font-semibold text-on-surface">Nenhum modelo selecionado</p>
          <p className="text-[11px] text-on-surface-variant/70 max-w-[200px]">
            Selecione uma tipologia no catálogo para carregar a maquete 3D/CAD.
          </p>
        </div>
      </div>
    );
  }

  const drillingPos = templateConfig.drillingConfig?.drillingPosition || TEMPLATE_DEFAULT_DRILLING_POSITION[templateType] || 'SUPERIOR';
  const divisionType = templateConfig.drillingConfig?.drillingMode === 'CUSTOM' ? 'CUSTOM_DISTANCE' : 'EQUAL';

  return (
    <div className="w-full rounded-lg bg-surface-container-low/50 border border-outline-variant/40 flex items-center justify-center p-2 min-h-[220px]">
      <div className="w-full flex flex-col items-center p-2">
        {/* Dimensões / Rótulo Superior */}
        <div className="w-full flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-on-surface truncate">
            {DOOR_TEMPLATE_LABELS[templateType]}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-highest/60 text-on-surface-variant font-medium">
            {profileMm}mm • Paramétrico
          </span>
        </div>

        {/* Contêiner da Maquete CAD com altura flexível e limpa */}
        <div className="w-full h-64 flex items-center justify-center overflow-hidden py-1">
          <WindowSvgPreview
            templateType={templateType}
            widthMm={2000}
            heightMm={2100}
            aluminumColor={aluminumColor}
            glassFinish={glassColor}
            openingDirection={templateConfig.openingDirection || 'LEFT_TO_RIGHT'}
            handleConfig={templateConfig.handleConfig || { handleType: 'NONE' }}
            drillingConfig={{
              holeCount: templateConfig.drillingConfig?.holeCount || 0,
              drillingPosition: drillingPos,
              divisionType,
              customDistancesMm: templateConfig.drillingConfig?.customPositionsMm,
            }}
            templateName={DOOR_TEMPLATE_LABELS[templateType]}
            baseWidth="100%"
            maxHeight={240}
            minimal={true}
          />
        </div>

        {/* Controles Rápidos de Acabamento Integrados */}
        <div className="w-full mt-2 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 px-1">
          {/* Cor do Alumínio */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-on-surface-variant font-medium">Alumínio:</span>
            <div className="flex items-center gap-1">
              {ALUMINUM_COLORS.slice(0, 5).map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => onColorChange('aluminumColor', c.hex)}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                    aluminumColor === c.hex
                      ? 'border-primary scale-125 ring-2 ring-primary/30 shadow-xs'
                      : 'border-slate-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Cor do Vidro */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-on-surface-variant font-medium">Vidro:</span>
            <div className="flex items-center gap-1">
              {GLASS_COLORS.slice(0, 4).map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => onColorChange('glassColor', c.hex)}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                    glassColor === c.hex
                      ? 'border-primary scale-125 ring-2 ring-primary/30 shadow-xs'
                      : 'border-slate-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CadPreviewOptionsProps {
  readonly templateConfig: Partial<TemplateConfig>;
}

function CadPreviewOptions({ templateConfig }: CadPreviewOptionsProps) {
  const handleCfg = templateConfig.handleConfig;
  const hasHandle = handleCfg?.handleType && handleCfg.handleType !== 'NONE';
  const handlePos = handleCfg?.handlePosition || handleCfg?.position;
  const drillCfg = templateConfig.drillingConfig;
  const hasDrilling = drillCfg?.holeCount && drillCfg.holeCount > 0;

  return (
    <div className="pt-2 border-t border-outline-variant/40 flex flex-col gap-1 text-[11px]">
      <span className="font-semibold text-on-surface-variant uppercase tracking-wider block mb-0.5">
        Prévia Ativa no CAD
      </span>
      <div className="flex flex-wrap items-center gap-1.5 text-on-surface">
        {hasHandle ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
            <span className="material-symbols-outlined text-[13px]">door_sensor</span>
            {HANDLE_TYPE_LABELS[handleCfg.handleType] || handleCfg.handleType}
            {handlePos && (
              <span className="text-secondary font-normal">
                ({HANDLE_POSITION_LABELS[handlePos] || handlePos})
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest/60 text-secondary">
            <span className="material-symbols-outlined text-[13px]">block</span>
            <span>Sem Puxador</span>
          </span>
        )}

        {templateConfig.openingDirection && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest/60 text-secondary">
            <span className="material-symbols-outlined text-[13px]">swipe</span>
            <span>{OPENING_DIRECTION_LABELS[templateConfig.openingDirection] || templateConfig.openingDirection}</span>
          </span>
        )}

        {hasDrilling ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
            <span className="material-symbols-outlined text-[13px]">circle</span>
            <span>{drillCfg.holeCount} Furos</span>
            <span className="text-secondary font-normal">
              ({(drillCfg.drillingPosition && DRILLING_POSITION_LABELS[drillCfg.drillingPosition]) || 'Lateral'})
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface CategoryBadgesListProps {
  readonly categoryRequirements: readonly MaterialCategoryType[];
}

function CategoryBadgesList({ categoryRequirements }: CategoryBadgesListProps) {
  return (
    <div className="pt-2 border-t border-outline-variant/40">
      <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
        Insumos Requeridos ({categoryRequirements.length})
      </span>
      {categoryRequirements.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {categoryRequirements.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-highest/70 text-on-surface text-[11px] font-medium"
            >
              <span className="material-symbols-outlined text-[13px] text-primary">
                {MATERIAL_CATEGORY_ICONS[cat]}
              </span>
              {MATERIAL_CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-error font-medium italic">Nenhum insumo selecionado</span>
      )}
    </div>
  );
}

interface ValidationAlertProps {
  readonly name: string;
  readonly templateType: DoorTemplateType | null;
  readonly categoryCount: number;
}

function ValidationAlert({ name, templateType, categoryCount }: ValidationAlertProps) {
  return (
    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs flex flex-col gap-1">
      <span className="font-semibold flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">info</span>
        <span>Pendências para salvar:</span>
      </span>
      <ul className="list-disc list-inside text-[11px] pl-1 space-y-0.5">
        {!name.trim() && <li>Preencha o nome comercial</li>}
        {!templateType && <li>Selecione um modelo de esquadria</li>}
        {categoryCount === 0 && <li>Marque ao menos um insumo</li>}
      </ul>
    </div>
  );
}

export function ProductCostSummary({
  name,
  templateType,
  templateConfig,
  setTemplateConfig,
  categoryRequirements,
  onSave,
  isPending,
  isEditing,
}: ProductCostSummaryProps) {
  const profileMm = templateConfig.profileMm ?? 20;
  const aluminumColor = templateConfig.aluminumColor ?? '#212121';
  const glassColor = templateConfig.glassColor ?? '#e3f2fd';

  const currentGroup = templateType
    ? DOOR_TEMPLATE_GROUPS.find((g) => g.types.includes(templateType))
    : null;

  const updateConfig = (field: keyof TemplateConfig, value: unknown) => {
    setTemplateConfig({ ...templateConfig, [field]: value });
  };

  const isSaveDisabled = !name.trim() || !templateType || categoryRequirements.length === 0 || isPending;

  return (
    <aside className="w-full flex flex-col gap-4">
      {/* Card da Maquete Studio CAD */}
      <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-xl p-3.5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/60">
          <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-primary">view_in_ar</span>
            <span>Maquete Studio CAD</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
            VETORIAL
          </span>
        </div>

        {/* Viewport SVG Integrada */}
        <CadMockupCard
          templateType={templateType}
          templateConfig={templateConfig}
          profileMm={profileMm}
          aluminumColor={aluminumColor}
          glassColor={glassColor}
          onColorChange={(field, val) => updateConfig(field, val)}
        />

        {/* Resumo de Especificações */}
        <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/60 mt-4">
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-0.5">
              Produto
            </span>
            <p className="text-sm font-bold text-on-surface truncate">
              {name.trim() || <span className="text-on-surface-variant/40 italic font-normal">Nome não preenchido</span>}
            </p>
            {currentGroup && (
              <span className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">{currentGroup.icon}</span>
                {currentGroup.label}
              </span>
            )}
          </div>

          <CadPreviewOptions templateConfig={templateConfig} />

          <CategoryBadgesList categoryRequirements={categoryRequirements} />
        </div>

        {/* Mensagens de Validação */}
        {isSaveDisabled && (
          <div className="mt-4">
            <ValidationAlert
              name={name}
              templateType={templateType}
              categoryCount={categoryRequirements.length}
            />
          </div>
        )}

        {/* Ação Primária */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaveDisabled}
          className="mt-4 w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-semibold text-sm shadow-sm hover:shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isPending ? 'sync' : 'save'}
          </span>
          {getSaveButtonLabel(isPending, isEditing)}
        </button>
      </div>
    </aside>
  );
}
