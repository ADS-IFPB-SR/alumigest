import React, { useMemo } from 'react';
import type { BudgetItem } from '../types';
import { formatBRL } from '../utils/calculations';

interface BudgetFinancialSummaryProps {
  items: BudgetItem[];
  discountPercent: number;
  onDiscountChange: (value: number) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  commercialConditions: string;
  onCommercialConditionsChange: (value: string) => void;
  errors?: { discountPercent?: string };
}

export const BudgetFinancialSummary: React.FC<BudgetFinancialSummaryProps> = ({
  items,
  discountPercent,
  onDiscountChange,
  notes,
  onNotesChange,
  commercialConditions,
  onCommercialConditionsChange,
  errors = {},
}) => {
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.subtotal, 0),
    [items],
  );

  const discountValue = useMemo(
    () => (subtotal * discountPercent) / 100,
    [subtotal, discountPercent],
  );

  const total = useMemo(() => subtotal - discountValue, [subtotal, discountValue]);

  const handleDiscountChange = (str: string) => {
    const cleaned = str.replace(',', '.').replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    if (cleaned === '' || cleaned === '.') {
      onDiscountChange(0);
      return;
    }
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onDiscountChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-md">
      {/* Observações e Condições Comerciais */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
        <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant">
          Observações e Condições
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label htmlFor="budget-notes" className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider">
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
          <div>
            <label htmlFor="budget-conditions" className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider">
              Condições Comerciais
            </label>
            <textarea
              id="budget-conditions"
              value={commercialConditions}
              onChange={(e) => onCommercialConditionsChange(e.target.value)}
              rows={3}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm p-sm font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
              placeholder="Ex: 50% na aprovação, 50% na entrega. Válido por 15 dias."
            />
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="bg-primary text-on-primary px-md py-sm">
          <h3 className="font-title-sm text-title-sm">Resumo Financeiro</h3>
        </div>

        <div className="p-md flex flex-col gap-sm">
          {/* Subtotal */}
          <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
            <span className="text-sm text-on-surface-variant font-body">
              Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})
            </span>
            <span className="font-data-mono text-on-surface font-semibold text-sm">
              {formatBRL(subtotal)}
            </span>
          </div>

          {/* Desconto */}
          <div className="flex items-center justify-between py-xs border-b border-outline-variant border-dashed gap-md">
            <div className="flex items-center gap-sm">
              <span className="text-sm text-on-surface-variant font-body whitespace-nowrap">Desconto (%)</span>
              <div className="relative w-24">
                <input
                  id="discount-percent"
                  type="text"
                  inputMode="decimal"
                  value={discountPercent === 0 ? '' : discountPercent}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  className={`w-full pr-[1.5rem] px-sm py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface text-right focus:border-primary focus:outline-none transition-all ${errors.discountPercent ? 'border-error' : 'border-outline-variant'}`}
                  placeholder="0"
                  min={0}
                  max={100}
                />
                <span className="absolute right-xs top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">%</span>
              </div>
            </div>
            <div className="text-right">
              {discountValue > 0 && (
                <span className="font-data-mono text-error text-sm">
                  − {formatBRL(discountValue)}
                </span>
              )}
            </div>
          </div>
          {errors.discountPercent && (
            <p className="text-error text-xs font-body">{errors.discountPercent}</p>
          )}

          {/* Total líquido */}
          <div className="flex justify-between items-center pt-sm border-t-2 border-outline mt-xs">
            <span className="font-headline font-bold text-on-surface text-base">Valor Total Líquido</span>
            <span className={`font-data-mono font-bold text-xl ${total > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
              {total > 0 ? formatBRL(total) : 'R$ 0,00'}
            </span>
          </div>

          {/* Badges de info */}
          {items.length === 0 && (
            <p className="text-xs text-on-surface-variant italic text-center py-xs font-body">
              Adicione itens ao orçamento para calcular o total.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
