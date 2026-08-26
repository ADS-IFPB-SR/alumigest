import { DoorTemplateSvg } from '../templates/DoorTemplateSvg';
import type { DoorTemplateType, TemplateConfig } from '../../types/templates';
import {
  DOOR_TEMPLATE_LABELS,
  ALUMINUM_COLORS,
  GLASS_COLORS,
} from '../../types/templates';

interface TemplateSelectorProps {
  templateType: DoorTemplateType | null;
  setTemplateType: (val: DoorTemplateType | null) => void;
  templateConfig: Partial<TemplateConfig>;
  setTemplateConfig: (val: Partial<TemplateConfig>) => void;
}

/**
 * Seletor de modelo de esquadria com preview SVG interativo em tempo real.
 */
export function TemplateSelector({
  templateType,
  setTemplateType,
  templateConfig,
  setTemplateConfig,
}: TemplateSelectorProps) {

  const handleTemplateChange = (value: string) => {
    if (value === '') {
      setTemplateType(null);
    } else {
      setTemplateType(value as DoorTemplateType);
    }
  };

  const updateConfig = (field: keyof TemplateConfig, value: unknown) => {
    setTemplateConfig({ ...templateConfig, [field]: value });
  };

  const profileMm = templateConfig.profileMm ?? 20;
  const aluminumColor = templateConfig.aluminumColor ?? '#212121';
  const glassColor = templateConfig.glassColor ?? '#e3f2fd';

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
      <div className="p-md border-b border-outline-variant">
        <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px] text-primary">settings</span>
          Modelo de Esquadria
        </h3>
      </div>

      <div className="p-lg flex flex-col lg:flex-row gap-lg">
        {/* SVG Preview (left) */}
        <div className="flex-1 min-w-0">
          <div
            className="w-full aspect-[4/5] max-h-[400px] rounded-lg border border-outline-variant/40 flex items-center justify-center overflow-hidden transition-all duration-200"
            style={{
              backgroundColor: '#eef2f5',
              backgroundImage: 'radial-gradient(#d5dbdb 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {templateType ? (
              <div className="w-full h-full p-md flex items-center justify-center">
                <DoorTemplateSvg
                  templateType={templateType}
                  widthMm={Number(templateConfig.profileMm ? 400 : 400)}
                  heightMm={600}
                  profileMm={profileMm}
                  aluminumColor={aluminumColor}
                  glassColor={glassColor}
                  handleConfig={templateConfig.handleConfig}
                  drillingConfig={templateConfig.drillingConfig}
                  showDimensions={true}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-sm text-on-surface-variant/50">
                <span className="material-symbols-outlined text-[48px]">window</span>
                <span className="font-body-sm text-body-sm italic text-center">
                  Selecione um modelo para ver o preview
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Config Panel (right) */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-md shrink-0">
          {/* Template Type */}
          <div>
            <label htmlFor="template-type" className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
              Modelo *
            </label>
            <select
              id="template-type"
              className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
              value={templateType || ''}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="">— Sem Template —</option>
              {(Object.keys(DOOR_TEMPLATE_LABELS) as DoorTemplateType[]).map((key) => (
                <option key={key} value={key}>{DOOR_TEMPLATE_LABELS[key]}</option>
              ))}
            </select>
          </div>

          {templateType && (
            <>
              {/* Profile */}
              <div>
                <label htmlFor="template-profile" className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
                  Perfil (mm)
                </label>
                <input
                  id="template-profile"
                  type="number"
                  inputMode="decimal"
                  min={10}
                  max={100}
                  className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
                  value={profileMm}
                  onChange={(e) => updateConfig('profileMm', Number(e.target.value) || 20)}
                />
              </div>

              {/* Aluminum Color */}
              <div>
                <label htmlFor="template-alu-color" className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
                  Cor do Alumínio
                </label>
                <select
                  id="template-alu-color"
                  className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
                  value={aluminumColor}
                  onChange={(e) => updateConfig('aluminumColor', e.target.value)}
                >
                  {ALUMINUM_COLORS.map((c) => (
                    <option key={c.hex} value={c.hex}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-xs mt-xs flex-wrap">
                  {ALUMINUM_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        aluminumColor === c.hex
                          ? 'border-primary scale-110 shadow-sm'
                          : 'border-outline-variant/40 hover:border-outline'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => updateConfig('aluminumColor', c.hex)}
                      aria-label={`Cor: ${c.name}`}
                    />
                  ))}
                </div>
              </div>

              {/* Glass Color */}
              <div>
                <label htmlFor="template-glass-color" className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
                  Tipo de Vidro
                </label>
                <select
                  id="template-glass-color"
                  className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
                  value={glassColor}
                  onChange={(e) => updateConfig('glassColor', e.target.value)}
                >
                  {GLASS_COLORS.map((c) => (
                    <option key={c.hex} value={c.hex}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-xs mt-xs flex-wrap">
                  {GLASS_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        glassColor === c.hex
                          ? 'border-primary scale-110 shadow-sm'
                          : 'border-outline-variant/40 hover:border-outline'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => updateConfig('glassColor', c.hex)}
                      aria-label={`Vidro: ${c.name}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
