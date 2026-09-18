import React from 'react';
import { formatBRL } from '../utils/calculations';
import { PAYMENT_CONDITION_OPTIONS, type DiscountType } from '../types';

interface BudgetCommercialConditionsProps {
  readonly laborCost: number;
  readonly onLaborCostChange: (value: number) => void;
  
  // --- DESCONTO ---
  readonly discountType?: DiscountType | 'PERCENTAGE' | 'FIXED';
  readonly onDiscountTypeChange?: (type: DiscountType) => void;
  readonly discountInput?: number;
  readonly discountPercent?: number;
  readonly onDiscountChange: (value: number) => void;
  
  // --- PAGAMENTO ---
  readonly paymentCondition?: string;
  readonly onPaymentConditionChange?: (value: string) => void;
  readonly commercialConditions: string;
  readonly onCommercialConditionsChange: (value: string) => void;
  
  readonly notes: string;
  readonly onNotesChange: (value: string) => void;
  readonly validUntil?: string;
  readonly onValidUntilChange?: (value: string) => void;
  
  /** Subtotal bruto — exibido como referência ao lado do campo de desconto */
  readonly subtotal: number;
  readonly errors?: {
    readonly discount?: string;
    readonly discountPercent?: string;
    readonly validUntil?: string;
  };
}

const DEFAULT_ERRORS: Record<string, string> = {};

function parseNumericInput(str: string): number | null {
  const cleaned = str.replace(',', '.').replace(/[^0-9.]/g, '');
  if (cleaned === '' || cleaned === '.') {
    return 0;
  }
  const val = Number.parseFloat(cleaned);
  return Number.isNaN(val) || val < 0 ? null : val;
}

function computeDiscountAmount(isPercent: boolean, subtotal: number, discountInput: number): number {
  if (!isPercent) {
    return discountInput;
  }
  return subtotal > 0 ? (subtotal * discountInput) / 100 : 0;
}

export const BudgetCommercialConditions: React.FC<BudgetCommercialConditionsProps> = ({
  laborCost = 0,
  onLaborCostChange,
  discountType,
  onDiscountTypeChange,
  discountInput,
  discountPercent,
  onDiscountChange,
  paymentCondition = '',
  onPaymentConditionChange,
  notes,
  onNotesChange,
  commercialConditions,
  onCommercialConditionsChange,
  validUntil = '',
  onValidUntilChange,
  subtotal,
  errors = DEFAULT_ERRORS,
}) => {
  const isPercent = discountType
    ? discountType === 'PERCENTUAL' || (discountType as string) === 'PERCENTAGE'
    : true;

  const currentDiscountInput = discountInput ?? (discountPercent ?? 0);

  const handleValidityPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const isoDate = d.toISOString().split('T')[0];
    onValidUntilChange?.(isoDate);
  };

  const handleLaborCostChange = (str: string) => {
    const val = parseNumericInput(str);
    if (val !== null) {
      onLaborCostChange(val);
    }
  };

  const handleDiscountChange = (str: string) => {
    const val = parseNumericInput(str);
    if (val === null) return;
    if (isPercent && val > 100) return;
    
    onDiscountChange(val);
  };

  const discountAmount = computeDiscountAmount(isPercent, subtotal, currentDiscountInput);

  const isDiscountExceeding = discountAmount > subtotal;
  const discountError = errors?.discount ?? errors?.discountPercent;

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

        {/* Desconto Híbrido (% ou R$) */}
        <div>
          <div className="flex items-center justify-between mb-xs">
            <label
              htmlFor="budget-discount"
              className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider"
            >
              Desconto <span className="text-[11px] font-normal text-secondary lowercase">(opcional)</span>
            </label>
            
            {/* Toggle Switch % vs R$ */}
            <div className="flex bg-surface-container border border-outline-variant rounded-sm overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  onDiscountTypeChange?.('PERCENTUAL');
                  onDiscountChange(0);
                }}
                className={`px-2 py-0.5 text-[11px] font-label transition-colors ${
                  isPercent 
                    ? 'bg-primary text-on-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => {
                  onDiscountTypeChange?.('VALOR_FIXO');
                  onDiscountChange(0);
                }}
                className={`px-2 py-0.5 text-[11px] font-label transition-colors ${
                  !isPercent 
                    ? 'bg-primary text-on-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                R$
              </button>
            </div>
          </div>

          <div className="flex items-center gap-sm flex-wrap">
            <div className="relative flex-1 min-w-[100px]">
              {!isPercent && (
                <span className="absolute left-sm top-1/2 -translate-y-1/2 text-xs font-data-mono text-on-surface-variant pointer-events-none">
                  R$
                </span>
              )}
              <input
                id="budget-discount"
                aria-label="Desconto"
                type="text"
                inputMode="decimal"
                value={currentDiscountInput === 0 ? '' : currentDiscountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className={`w-full ${!isPercent ? 'pl-[2rem]' : 'px-sm'} pr-[1.5rem] py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none transition-all ${
                  discountError || isDiscountExceeding ? 'border-error' : 'border-outline-variant'
                }`}
                placeholder="0"
                aria-describedby={discountError || isDiscountExceeding ? 'discount-error' : undefined}
              />
              {isPercent && (
                <span className="absolute right-xs top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
                  %
                </span>
              )}
            </div>
            
            {/* Display do Valor Descontado */}
            {discountAmount > 0 && (
              <span className={`text-xs font-data-mono whitespace-nowrap ${isDiscountExceeding ? 'text-error font-bold' : 'text-error'}`}>
                − {formatBRL(discountAmount)}
              </span>
            )}
          </div>
          
          {(discountError || isDiscountExceeding) && (
            <p id="discount-error" className="text-error text-xs mt-xs font-body">
              {isDiscountExceeding ? 'Desconto maior que o subtotal!' : discountError}
            </p>
          )}
        </div>

        {/* Condição de Pagamento (Select) */}
        <div className="sm:col-span-1">
          <label
            htmlFor="budget-payment-condition"
            className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
          >
            Condição de Pagamento
          </label>
          <select
            id="budget-payment-condition"
            value={paymentCondition}
            onChange={(e) => onPaymentConditionChange?.(e.target.value)}
            className="w-full px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-sm font-body text-sm text-on-surface focus:border-primary focus:outline-none transition-all"
          >
            <option value="">Selecione uma opção...</option>
            {PAYMENT_CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Validade da Proposta */}
        <div className="sm:col-span-1">
          <div className="flex items-center justify-between flex-wrap gap-xs mb-xs">
            <label
              htmlFor="budget-valid-until"
              className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider"
            >
              Validade da Proposta
            </label>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-secondary font-label">Atalhos:</span>
              {[7, 15, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-label={`${days} dias`}
                  onClick={() => handleValidityPreset(days)}
                  className="px-2 py-0.5 rounded text-[11px] font-label font-medium bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/60 transition-colors"
                >
                  +{days} dias
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
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

      <hr className="border-outline-variant border-dashed my-xs" />

      {/* Detalhes Comerciais (Notas de Pagamento) */}
      <div>
        <label
          htmlFor="budget-commercial-conditions"
          className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
        >
          Condições Comerciais
        </label>
        <textarea
          id="budget-commercial-conditions"
          aria-label="Condições Comerciais"
          value={commercialConditions}
          onChange={(e) => onCommercialConditionsChange(e.target.value)}
          rows={2}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm p-sm font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
          placeholder="Ex: 50% na aprovação por transferência, restante em boleto."
        />
      </div>

      {/* Observações Gerais */}
      <div>
        <label
          htmlFor="budget-notes"
          className="block text-xs font-label font-semibold text-on-surface-variant mb-xs uppercase tracking-wider"
        >
          Observações Gerais
        </label>
        <textarea
          id="budget-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm p-sm font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
          placeholder="Ex: Entrega em até 15 dias úteis. Montagem inclusa no local."
        />
      </div>
    </div>
  );
};