import React from 'react';

export interface Step1DimensionsProps {
  readonly widthMm: number | '';
  readonly heightMm: number | '';
  readonly quantity: number | '';
  readonly errors: Record<string, string>;
  readonly unitAreaM2: string;
  readonly totalQty: number;
  readonly onWidthChange: (val: number | '') => void;
  readonly onHeightChange: (val: number | '') => void;
  readonly onQuantityChange: (val: number | '') => void;
}

export const Step1Dimensions: React.FC<Step1DimensionsProps> = ({
  widthMm,
  heightMm,
  quantity,
  errors,
  unitAreaM2,
  totalQty,
  onWidthChange,
  onHeightChange,
  onQuantityChange,
}) => {
  return (
    <div className="flex flex-col gap-md animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md sm:p-lg shadow-xs flex flex-col gap-md">
        <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
          <h3 className="text-base font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
            <span className="material-symbols-outlined text-[20px] text-primary">aspect_ratio</span>
            1. Medidas e Quantidade
          </h3>
          <span className="text-xs font-label text-secondary font-medium">Dimensões físicas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div>
            <label
              htmlFor="modal-width-input"
              className="text-sm font-label font-semibold text-on-surface flex items-center gap-0.5 mb-1.5 whitespace-nowrap"
            >
              Largura (mm)<span className="text-error font-bold leading-none">*</span>
            </label>
            <input
              id="modal-width-input"
              type="number"
              min={100}
              max={9999}
              value={widthMm}
              onChange={(e) => onWidthChange(Number.parseInt(e.target.value, 10) || '')}
              aria-label="Largura em milímetros"
              className={`w-full py-2.5 px-3 bg-surface border rounded-lg text-base font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors ${
                errors.widthMm ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.widthMm && <span className="text-xs text-error mt-1 block">{errors.widthMm}</span>}
          </div>

          <div>
            <label
              htmlFor="modal-height-input"
              className="text-sm font-label font-semibold text-on-surface flex items-center gap-0.5 mb-1.5 whitespace-nowrap"
            >
              Altura (mm)<span className="text-error font-bold leading-none">*</span>
            </label>
            <input
              id="modal-height-input"
              type="number"
              min={100}
              max={9999}
              value={heightMm}
              onChange={(e) => onHeightChange(Number.parseInt(e.target.value, 10) || '')}
              aria-label="Altura em milímetros"
              className={`w-full py-2.5 px-3 bg-surface border rounded-lg text-base font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors ${
                errors.heightMm ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.heightMm && <span className="text-xs text-error mt-1 block">{errors.heightMm}</span>}
          </div>

          <div>
            <label
              htmlFor="modal-quantity-input"
              className="text-sm font-label font-semibold text-on-surface flex items-center gap-0.5 mb-1.5 whitespace-nowrap"
            >
              Quantidade<span className="text-error font-bold leading-none">*</span>
            </label>
            <input
              id="modal-quantity-input"
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                onQuantityChange(val === '' ? '' : Math.max(1, Number.parseInt(val, 10) || 1));
              }}
              aria-label="Quantidade de Esquadrias"
              className={`w-full py-2.5 px-3 bg-surface border rounded-lg text-base font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors ${
                errors.quantity ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.quantity && <span className="text-xs text-error mt-1 block">{errors.quantity}</span>}
          </div>
        </div>

        {/* Resumo da Área Calculada */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-md flex items-center gap-sm">
          <span className="material-symbols-outlined text-[24px] text-primary">straighten</span>
          <div>
            <div className="text-sm font-body text-on-surface">
              Área unitária do vão:{' '}<strong className="font-data-mono font-bold text-base">{unitAreaM2} m²</strong>
            </div>
            {totalQty > 1 && (
              <div className="text-xs font-data-mono text-secondary">
                Área total acumulada ({totalQty} unidades):{' '}
                <strong className="text-primary font-bold">{((+unitAreaM2) * totalQty).toFixed(2)} m²</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
