import { useState } from 'react';
import type { DoorTemplateType, TemplateConfig, GlassFinish } from '../../types';
import { TEMPLATE_DEFINITIONS, ALUMINUM_COLORS, GLASS_FINISHES, getTemplateDefinition } from './templateDefinitions';
import { DoorTemplateSvg } from './DoorTemplateSvg';

interface TemplateSelectorProps {
  selectedType: DoorTemplateType;
  onSelectType: (type: DoorTemplateType) => void;
  config?: TemplateConfig;
  onChangeConfig: (config: TemplateConfig) => void;
  showCustomizer?: boolean;
}

export function TemplateSelector({
  selectedType,
  onSelectType,
  config,
  onChangeConfig,
  showCustomizer = true,
}: TemplateSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentDef = getTemplateDefinition(selectedType);

  const currentConfig: TemplateConfig = {
    templateType: selectedType,
    aluminumColor: config?.aluminumColor || 'BLACK',
    glassFinish: config?.glassFinish || 'CLEAR',
    openingDirection: config?.openingDirection || currentDef.supportedOpeningDirections[0] || 'LEFT_TO_RIGHT',
    handleType: config?.handleType || currentDef.supportedHandles[0] || 'BAR_TUBULAR',
    isSlatted: config?.isSlatted ?? (selectedType === 'PIVOTING_DOOR'),
    ...config,
  };

  const handleUpdate = (patch: Partial<TemplateConfig>) => {
    onChangeConfig({
      ...currentConfig,
      ...patch,
    });
  };

  const handleSelectTemplate = (type: DoorTemplateType) => {
    const newDef = getTemplateDefinition(type);
    onSelectType(type);
    onChangeConfig({
      templateType: type,
      aluminumColor: currentConfig.aluminumColor,
      glassFinish: currentConfig.glassFinish,
      openingDirection: newDef.supportedOpeningDirections[0] || 'LEFT_TO_RIGHT',
      handleType: newDef.supportedHandles[0] || 'BAR_TUBULAR',
      isSlatted: type === 'PIVOTING_DOOR',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-md">
      {/* Visual Card / Live Preview */}
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-col sm:flex-row items-center gap-md">
        {/* SVG Preview Box */}
        <div className="w-48 h-48 sm:w-44 sm:h-44 bg-white rounded-md border border-outline-variant/80 p-xs flex items-center justify-center shrink-0 shadow-inner">
          <DoorTemplateSvg
            templateType={selectedType}
            config={currentConfig}
            showDimensions={false}
            className="w-full h-full"
          />
        </div>

        {/* Selected Info & Change Button */}
        <div className="flex-1 flex flex-col gap-xs w-full text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Gabarito / Modelo SVG
            </span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-xs px-sm py-1 bg-primary-container text-on-primary-container rounded text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Trocar Modelo
            </button>
          </div>

          <h4 className="font-title-sm text-title-sm text-on-surface font-bold">
            {currentDef.name}
          </h4>
          <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
            {currentDef.description}
          </p>

          {/* Quick Details Badges */}
          <div className="flex flex-wrap gap-xs mt-xs">
            <span className="px-xs py-0.5 bg-surface-container-highest rounded text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ALUMINUM_COLORS.find(c => c.id === currentConfig.aluminumColor)?.hex || '#1E232A' }} />
              {ALUMINUM_COLORS.find(c => c.id === currentConfig.aluminumColor)?.name}
            </span>
            <span className="px-xs py-0.5 bg-surface-container-highest rounded text-[11px] font-medium text-on-surface-variant">
              Vidro: {GLASS_FINISHES.find(g => g.id === currentConfig.glassFinish)?.name}
            </span>
            <span className="px-xs py-0.5 bg-surface-container-highest rounded text-[11px] font-medium text-on-surface-variant font-mono">
              Padrao: {currentDef.defaultWidth}x{currentDef.defaultHeight} mm
            </span>
          </div>
        </div>
      </div>

      {/* Finishes Customizer (if enabled) */}
      {showCustomizer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md p-sm bg-surface rounded-md border border-outline-variant/60">
          {/* Aluminum Color Choice */}
          <div>
            <label className="font-label-bold text-label-bold text-on-surface text-xs block mb-xs">
              Cor do Alumínio Padrão
            </label>
            <div className="flex flex-wrap gap-xs">
              {ALUMINUM_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleUpdate({ aluminumColor: col.id })}
                  className={`flex items-center gap-xs px-sm py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    currentConfig.aluminumColor === col.id
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                      : 'border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: col.hex }}
                  />
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Glass Finish Choice */}
          <div>
            <label className="font-label-bold text-label-bold text-on-surface text-xs block mb-xs">
              Acabamento do Vidro Padrão
            </label>
            <select
              value={currentConfig.glassFinish}
              onChange={(e) => handleUpdate({ glassFinish: e.target.value as GlassFinish })}
              className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            >
              {GLASS_FINISHES.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-xs sm:p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-lg w-full max-w-4xl flex flex-col shadow-2xl max-h-[85vh]">
            <div className="flex items-center justify-between p-md border-b border-outline-variant">
              <div>
                <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Selecione o Modelo de Esquadria
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Escolha o template vetorial técnico SVG correspondente à esquadria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-xs text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-md overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
              {TEMPLATE_DEFINITIONS.map((def) => {
                const isSelected = def.type === selectedType;
                return (
                  <button
                    key={def.type}
                    type="button"
                    onClick={() => handleSelectTemplate(def.type)}
                    className={`flex flex-col text-left p-sm rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-outline-variant/80 bg-surface-container-lowest hover:border-primary/60 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="h-32 bg-white rounded border border-outline-variant/60 p-xs flex items-center justify-center mb-sm shadow-inner">
                      <DoorTemplateSvg
                        templateType={def.type}
                        config={{ ...currentConfig, templateType: def.type }}
                        showDimensions={false}
                        className="w-full h-full"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wide block">
                      {def.category}
                    </span>
                    <span className="font-title-sm text-sm text-on-surface font-semibold block mt-0.5">
                      {def.name}
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant mt-xs line-clamp-2">
                      {def.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end p-md border-t border-outline-variant bg-surface-container-low rounded-b-lg">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-md py-xs border border-outline text-on-surface rounded-sm font-label-bold text-label-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
