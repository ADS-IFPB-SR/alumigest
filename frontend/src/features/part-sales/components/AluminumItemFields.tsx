import React from 'react';

export interface AluminumItemFieldsProps {
  lengthMm: number | '';
  quantity: number | '';
  unitPrice: number | '';
  lossFactor?: number;
  calculatedMeters?: number | null;
  totalPrice?: number | null;
  onLengthChange: (value: number | '') => void;
  onQuantityChange: (value: number | '') => void;
  onPriceChange?: (value: number | '') => void;
  errors?: {
    length?: string;
    quantity?: string;
    unitPrice?: string;
  };
  disabled?: boolean;
}

export const AluminumItemFields: React.FC<AluminumItemFieldsProps> = ({
  lengthMm,
  quantity,
  unitPrice,
  lossFactor = 0,
  calculatedMeters,
  totalPrice,
  onLengthChange,
  onQuantityChange,
  onPriceChange,
  errors,
  disabled = false,
}) => {
  const isOverLength = typeof lengthMm === 'number' && lengthMm > 6000;
  const isZeroOrNegative = typeof lengthMm === 'number' && lengthMm <= 0;

  const lengthErrorMessage =
    errors?.length ||
    (isOverLength
      ? 'O comprimento não pode exceder 6000 mm (barra industrial)'
      : isZeroOrNegative
      ? 'O comprimento deve ser maior que zero'
      : undefined);

  return (
    <div className="space-y-4" data-testid="aluminum-item-fields">
      {/* 1. Header do Tipo e Badge Âmbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Especificações de Corte (Alumínio)
          </span>
          <span
            data-testid="badge-metro-linear"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Metro Linear (m)
          </span>
        </div>

        {lossFactor > 0 && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Perda de corte: +{(lossFactor * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* 2. Grid de Inputs: Qtd, Comprimento (mm) e Preço/Metro (Largura Oculta) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Quantidade */}
        <div>
          <label
            htmlFor="aluminum-quantity"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1"
          >
            Qtd (Barras/Pedaços) *
          </label>
          <input
            id="aluminum-quantity"
            data-testid="input-aluminum-quantity"
            type="number"
            min="1"
            step="1"
            disabled={disabled}
            value={quantity}
            placeholder="1"
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
              onQuantityChange(val);
            }}
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg outline-none font-bold text-slate-900 dark:text-slate-100 transition ${
              errors?.quantity
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500'
            }`}
          />
          {errors?.quantity && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.quantity}</p>
          )}
        </div>

        {/* Comprimento em milímetros */}
        <div>
          <label
            htmlFor="aluminum-length"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1"
          >
            Comprimento (mm) *
          </label>
          <div className="relative">
            <input
              id="aluminum-length"
              data-testid="input-aluminum-length"
              type="number"
              min="1"
              max="6000"
              step="1"
              disabled={disabled}
              value={lengthMm}
              placeholder="Ex: 2500"
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                onLengthChange(val);
              }}
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg outline-none font-mono font-bold text-slate-900 dark:text-slate-100 pr-10 transition ${
                lengthErrorMessage
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500'
              }`}
            />
            <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 select-none">
              mm
            </span>
          </div>
          {lengthErrorMessage ? (
            <p className="text-[11px] text-rose-600 mt-1 font-medium" data-testid="error-aluminum-length">
              {lengthErrorMessage}
            </p>
          ) : (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Máx. 6000 mm (1 barra padrão)
            </p>
          )}
        </div>

        {/* Preço por Metro Linear */}
        {onPriceChange && (
          <div>
            <label
              htmlFor="aluminum-price"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1"
            >
              Preço/Metro (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400 select-none">
                R$
              </span>
              <input
                id="aluminum-price"
                data-testid="input-aluminum-price"
                type="number"
                min="0.01"
                step="0.01"
                disabled={disabled}
                value={unitPrice}
                placeholder="0.00"
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                  onPriceChange(val);
                }}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg outline-none font-mono font-bold text-slate-900 dark:text-slate-100 transition ${
                  errors?.unitPrice
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500'
                }`}
              />
            </div>
            {errors?.unitPrice && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.unitPrice}</p>
            )}
          </div>
        )}
      </div>

      {/* 3. Painel de Metragem Faturada em Tempo Real */}
      {calculatedMeters != null && calculatedMeters > 0 && (
        <div
          data-testid="panel-calculated-meters"
          className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Metragem Faturável:
            </span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
              {calculatedMeters.toFixed(4)} m
            </span>
            {lossFactor > 0 && (
              <span className="text-[10px] text-slate-500">
                (inclui {lossFactor * 100}% de perda)
              </span>
            )}
          </div>

          {totalPrice != null && totalPrice > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Subtotal:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(totalPrice)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
