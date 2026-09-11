import type { DoorTemplateType } from '../../types/templates';
import { DOOR_TEMPLATE_GROUPS, DOOR_TEMPLATE_LABELS } from '../../types/templates';

interface ProductGeneralInfoProps {
  name: string;
  setName: (val: string) => void;
  templateType: DoorTemplateType | null;
}

export function ProductGeneralInfo({
  name,
  setName,
  templateType,
}: ProductGeneralInfoProps) {
  // Localiza o grupo ao qual o template atual pertence
  const currentGroup = templateType
    ? DOOR_TEMPLATE_GROUPS.find((g) => g.types.includes(templateType))
    : null;

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-outline-variant/60">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="font-title-sm text-base font-semibold text-on-surface flex items-center gap-2">
            Identificação da Esquadria
          </h3>
        </div>

        {/* Categoria derivada apresentada como badge moderno */}
        {currentGroup ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/20 text-xs font-medium text-primary self-start sm:self-auto">
            <span className="material-symbols-outlined text-[16px]">{currentGroup.icon}</span>
            <span>{currentGroup.label}</span>
            {templateType && (
              <span className="text-on-surface-variant font-normal">
                • {DOOR_TEMPLATE_LABELS[templateType]}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant/60 italic self-start sm:self-auto">
            Categoria definida ao selecionar o modelo abaixo
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor="product-name"
          className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
        >
          Nome Comercial da Esquadria <span className="text-error">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant/60 pointer-events-none">
            edit_note
          </span>
          <input
            id="product-name"
            type="text"
            maxLength={120}
            className="w-full pl-9 pr-14 py-2.5 bg-surface-container-lowest border border-outline/70 rounded-lg text-sm text-on-surface font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40 hover:border-outline"
            placeholder="Ex: Porta de Correr 2 Folhas Prime, Janela Basculante Premium..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <span className="absolute right-3 text-[11px] font-data-mono text-on-surface-variant/60 pointer-events-none">
            {name.length}/120
          </span>
        </div>
        <p className="text-[11px] text-on-surface-variant/70 mt-1.5">
          Este nome será exibido nos orçamentos, pedidos de venda e relatórios de produção. Máximo de 120 caracteres.
        </p>
      </div>
    </section>
  );
}

