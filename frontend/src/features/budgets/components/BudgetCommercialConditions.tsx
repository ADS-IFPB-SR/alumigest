import React from 'react';
import { formatBRL } from '../utils/calculations';

interface BudgetCommercialConditionsProps {
  discountPercent: number;
  onDiscountChange: (value: number) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  commercialConditions: string;
  onCommercialConditionsChange: (value: string) => void;
  /** Subtotal bruto — exibido como referência ao lado do campo de desconto */
  subtotal: number;
  errors?: { discountPercent?: string };
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
export const BudgetCommercialConditions: React.FC<BudgetCommercialConditionsProps> = ({
  discountPercent,
  onDiscountChange,
  notes,
  onNotesChange,
  commercialConditions,
  onCommercialConditionsChange,
  subtotal,
  errors = {},
}) => {
  const handleDiscountChange = (str: string) => {
    const cleaned = str.replace(',', '.').replace(/[^0-9.]/g, '');
    if (cleaned === '' || cleaned === '.') {
      onDiscountChange(0);
      return;
    }
    const val = parseFloat(cleaned);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onDiscountChange(val);
    }
  };

  const discountValue = subtotal > 0 ? (subtotal * discountPercent) / 100 : 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-md">
      <h3 className="font-label font-semibold text-on-surface text-sm pb-xs border-b border-outline-variant flex items-center gap-xs">
        <span className="material-symbols-outlined text-[16px] text-secondary">notes</span>
        Condições Comerciais
      </h3>

      {/* Desconto */}
      <div>
        <label
          htmlFor="budget-discount"
          className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
        >
          Desconto (%)
        </label>
        <div className="flex items-center gap-sm flex-wrap">
          <div className="relative w-32">
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
            <span className="text-xs font-data-mono text-error">
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
