import React from 'react';
import { formatBRL } from '../utils/calculations';

// Opções padronizadas de pagamento
const PAYMENT_OPTIONS = [
  { value: 'CASH', label: 'À Vista (PIX / Dinheiro)' },
  { value: 'HALF_HALF', label: '50% Entrada + 50% na Entrega' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito até 12x' },
  { value: 'CUSTOM', label: 'A Combinar' }
] as const;

interface BudgetCommercialConditionsProps {
  readonly laborCost: number;
  readonly onLaborCostChange: (value: number) => void;
  
  // --- DESCONTO ---
  readonly discountType: 'PERCENTAGE' | 'FIXED';
  readonly onDiscountTypeChange: (type: 'PERCENTAGE' | 'FIXED') => void;
  readonly discountInput: number;
  readonly onDiscountChange: (value: number) => void;
  
  // --- PAGAMENTO ---
  readonly paymentCondition: string;
  readonly onPaymentConditionChange: (value: string) => void;
  readonly commercialConditions: string; // Usado para observações textuais de pagamento
  readonly onCommercialConditionsChange: (value: string) => void;
  
  readonly notes: string;
  readonly onNotesChange: (value: string) => void;
  readonly validUntil?: string;
  readonly onValidUntilChange?: (value: string) => void;
  
  /** Subtotal bruto — exibido como referência ao lado do campo de desconto */
  readonly subtotal: number;
  readonly errors?: { readonly discount?: string; readonly validUntil?: string };
}

const DEFAULT_ERRORS: Record<string, string> = {};

export const BudgetCommercialConditions: React.FC<BudgetCommercialConditionsProps> = ({
  laborCost,
  onLaborCostChange,
  discountType,
  onDiscountTypeChange,
  discountInput,
  onDiscountChange,
  paymentCondition,
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
    
    // Validação de limite baseada no tipo
    if (Number.isNaN(val) || val < 0) return;
    if (discountType === 'PERCENTAGE' && val > 100) return;
    
    onDiscountChange(val);
  };

  // Cálculo financeiro real do desconto
  const discountAmount = discountType === 'PERCENTAGE' 
    ? subtotal > 0 ? (subtotal * discountInput) / 100 : 0
    : discountInput;

  const isDiscountExceeding = discountAmount > subtotal;

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
                  onDiscountTypeChange('PERCENTAGE');
                  onDiscountChange(0); // Reseta o valor ao trocar o tipo
                }}
                className={`px-2 py-0.5 text-[11px] font-label transition-colors ${
                  discountType === 'PERCENTAGE' 
                    ? 'bg-primary text-on-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => {
                  onDiscountTypeChange('FIXED');
                  onDiscountChange(0);
                }}
                className={`px-2 py-0.5 text-[11px] font-label transition-colors ${
                  discountType === 'FIXED' 
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
              {discountType === 'FIXED' && (
                <span className="absolute left-sm top-1/2 -translate-y-1/2 text-xs font-data-mono text-on-surface-variant pointer-events-none">
                  R$
                </span>
              )}
              <input
                id="budget-discount"
                type="text"
                inputMode="decimal"
                value={discountInput === 0 ? '' : discountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className={`w-full ${discountType === 'FIXED' ? 'pl-[2rem]' : 'px-sm'} pr-[1.5rem] py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none transition-all ${
                  errors.discount || isDiscountExceeding ? 'border-error' : 'border-outline-variant'
                }`}
                placeholder="0"
                aria-describedby={errors.discount || isDiscountExceeding ? 'discount-error' : undefined}
              />
              {discountType === 'PERCENTAGE' && (
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
          
          {(errors.discount || isDiscountExceeding) && (
            <p id="discount-error" className="text-error text-xs mt-xs font-body">
              {isDiscountExceeding ? 'Desconto maior que o subtotal!' : errors.discount}
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
            onChange={(e) => onPaymentConditionChange(e.target.value)}
            className="w-full px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-sm font-body text-sm text-on-surface focus:border-primary focus:outline-none transition-all appearance-none"
          >
            <option value="" disabled>Selecione uma opção...</option>
            {PAYMENT_OPTIONS.map((opt) => (
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
              {[7, 15, 30].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleValidityPreset(days)}
                  className="px-2 py-0.5 rounded text-[11px] font-label font-medium bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/60 transition-colors"
                >
                  {days}d
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
          Detalhes do Pagamento
        </label>
        <textarea
          id="budget-commercial-conditions"
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