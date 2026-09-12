import React from 'react';
import { formatBRL } from '../utils/calculations';

interface BudgetCommercialConditionsProps {
  readonly laborCost: number;
  readonly onLaborCostChange: (value: number) => void;
  readonly discountPercent: number;
  readonly onDiscountChange: (value: number) => void;
  readonly notes: string;
  readonly onNotesChange: (value: string) => void;
  readonly commercialConditions: string;
  readonly onCommercialConditionsChange: (value: string) => void;
  readonly validUntil?: string;
  readonly onValidUntilChange?: (value: string) => void;
  /** Subtotal bruto — exibido como referência ao lado do campo de desconto */
  readonly subtotal: number;
  readonly errors?: { readonly discountPercent?: string; readonly validUntil?: string };
}

/**
 * Campos editáveis das condições comerciais do orçamento:
 * - Desconto (%)
 * - Observações
 * - Condições Comerciais
 *
 * Responsabilidade semântica separada de BudgetFinancialSummary,
 * que cuida apenas dos valores derivados e da ação final de salvar.
 */
const DEFAULT_ERRORS: Record<string, string> = {};

export const BudgetCommercialConditions: React.FC<BudgetCommercialConditionsProps> = ({
  laborCost,
  onLaborCostChange,
  discountPercent,
  onDiscountChange,
  notes,
  onNotesChange,
  commercialConditions,
  onCommercialConditionsChange,
  validUntil = '',
  onValidUntilChange,
  subtotal,
  errors = DEFAULT_ERRORS,
}) => {
  const handleValidityPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const isoDate = d.toISOString().split('T')[0];
    onValidUntilChange?.(isoDate);
  };
  const handleLaborCostChange = (str: string) => {
    const cleaned = str.replace(',', '.').replace(/[^0-9.]/g, '');
    if (cleaned === '' || cleaned === '.') {
      onLaborCostChange(0);
      return;
    }
    const val = Number.parseFloat(cleaned);
    if (!Number.isNaN(val) && val >= 0) {
      onLaborCostChange(val);
    }
  };

  const handleDiscountChange = (str: string) => {
    const cleaned = str.replace(',', '.').replace(/[^0-9.]/g, '');
    if (cleaned === '' || cleaned === '.') {
      onDiscountChange(0);
      return;
    }
    const val = Number.parseFloat(cleaned);
    if (!Number.isNaN(val) && val >= 0 && val <= 100) {
      onDiscountChange(val);
    }
  };

  const discountValue = subtotal > 0 ? (subtotal * discountPercent) / 100 : 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-md">
      <h3 className="font-label font-semibold text-on-surface text-sm pb-xs border-b border-outline-variant flex items-center gap-xs">
        <span className="material-symbols-outlined text-[16px] text-secondary">notes</span>
        <span>Condições Comerciais</span>
      </h3>

      {/* Grid: Mão de Obra e Desconto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {/* Mão de Obra (Opcional) */}
        <div>
          <label
            htmlFor="budget-labor-cost"
            className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
          >
            Mão de Obra (R$) <span className="text-[11px] font-normal text-secondary lowercase">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-sm top-1/2 -translate-y-1/2 text-xs font-data-mono text-on-surface-variant pointer-events-none">
              R$
            </span>
            <input
              id="budget-labor-cost"
              type="text"
              inputMode="decimal"
              value={laborCost === 0 ? '' : laborCost}
              onChange={(e) => handleLaborCostChange(e.target.value)}
              className="w-full pl-[2rem] pr-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none transition-all"
              placeholder="0,00"
            />
          </div>
          <p className="text-[11px] font-body text-secondary mt-xs">
            Custo geral de montagem/instalação.
          </p>
        </div>

        {/* Desconto (%) */}
        <div>
          <label
            htmlFor="budget-discount"
            className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
          >
            Desconto (%) <span className="text-[11px] font-normal text-secondary lowercase">(opcional)</span>
          </label>
          <div className="flex items-center gap-sm flex-wrap">
            <div className="relative flex-1 min-w-[100px]">
              <input
                id="budget-discount"
                type="text"
                inputMode="decimal"
                value={discountPercent === 0 ? '' : discountPercent}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className={`w-full pr-[1.5rem] px-sm py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none transition-all ${
                  errors.discountPercent ? 'border-error' : 'border-outline-variant'
                }`}
                placeholder="0"
                min={0}
                max={100}
                aria-describedby={errors.discountPercent ? 'discount-error' : undefined}
              />
              <span className="absolute right-xs top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
                %
              </span>
            </div>
            {discountValue > 0 && (
              <span className="text-xs font-data-mono text-error whitespace-nowrap">
                − {formatBRL(discountValue)}
              </span>
            )}
          </div>
          {errors.discountPercent && (
            <p id="discount-error" className="text-error text-xs mt-xs font-body">
              {errors.discountPercent}
            </p>
          )}
        </div>

        {/* Validade da Proposta */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-xs mb-xs">
            <label
              htmlFor="budget-valid-until"
              className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider"
            >
              Validade da Proposta
            </label>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-secondary font-label">Atalhos:</span>
              <button
                type="button"
                onClick={() => handleValidityPreset(7)}
                className="px-2 py-0.5 rounded text-[11px] font-label font-medium bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/60 transition-colors"
              >
                7 dias
              </button>
              <button
                type="button"
                onClick={() => handleValidityPreset(15)}
                className="px-2 py-0.5 rounded text-[11px] font-label font-medium bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/60 transition-colors"
              >
                15 dias
              </button>
              <button
                type="button"
                onClick={() => handleValidityPreset(30)}
                className="px-2 py-0.5 rounded text-[11px] font-label font-medium bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/60 transition-colors"
              >
                30 dias
              </button>
            </div>
          </div>
          <div className="relative max-w-xs">
            <input
              id="budget-valid-until"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={validUntil}
              onChange={(e) => onValidUntilChange?.(e.target.value)}
              className={`w-full px-sm py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none transition-all ${
                errors.validUntil ? 'border-error' : 'border-outline-variant'
              }`}
            />
          </div>
          {errors.validUntil && (
            <p className="text-error text-xs mt-xs font-body">
              {errors.validUntil}
            </p>
          )}
        </div>
      </div>

      {/* Observações */}
      <div>
        <label
          htmlFor="budget-notes"
          className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
        >
          Observações
        </label>
        <textarea
          id="budget-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm p-sm font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
          placeholder="Ex: Entrega em até 15 dias úteis. Montagem inclusa."
        />
      </div>

      {/* Condições Comerciais */}
      <div>
        <label
          htmlFor="budget-commercial-conditions"
          className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
        >
          Condições Comerciais
        </label>
        <textarea
          id="budget-commercial-conditions"
          value={commercialConditions}
          onChange={(e) => onCommercialConditionsChange(e.target.value)}
          rows={3}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm p-sm font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
          placeholder="Ex: 50% na aprovação, 50% na entrega. Válido por 15 dias."
        />
      </div>
    </div>
  );
};
