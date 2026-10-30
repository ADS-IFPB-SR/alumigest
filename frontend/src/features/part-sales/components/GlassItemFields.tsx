import { useState, useEffect } from 'react';

interface GlassItemFieldsProps {
  readonly widthMm: number | '';
  readonly heightMm: number | '';
  readonly quantity: number | '';
  readonly unitPrice: number | '';
  readonly disabled?: boolean;
  readonly onWidthChange: (val: number | '') => void;
  readonly onHeightChange: (val: number | '') => void;
  readonly onQuantityChange: (val: number | '') => void;
  readonly onPriceChange: (val: number | '') => void;
  readonly calculatedArea?: number;
  readonly totalPrice?: number;
}

export function GlassItemFields({
  widthMm,
  heightMm,
  quantity,
  unitPrice,
  disabled = false,
  onWidthChange,
  onHeightChange,
  onQuantityChange,
  onPriceChange,
  calculatedArea,
  totalPrice,
}: GlassItemFieldsProps) {
  const [showMinimumAreaWarning, setShowMinimumAreaWarning] = useState(false);

  // Avalia se a regra de área mínima está ativa
  useEffect(() => {
    if (typeof widthMm === 'number' && typeof heightMm === 'number') {
      const rawArea = (widthMm / 1000) * (heightMm / 1000);
      setShowMinimumAreaWarning(rawArea > 0 && rawArea < 0.25);
    } else {
      setShowMinimumAreaWarning(false);
    }
  }, [widthMm, heightMm]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-cyan-100 dark:border-cyan-900/30 pb-2">
        <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Medidas Específicas</span>
        <span
          data-testid="badge-glass-category"
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30"
        >
          Vidro (m²)
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Quantidade */}
        <div>
          <label htmlFor="glass-qty" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Qtd *
          </label>
          <input
            id="glass-qty"
            data-testid="input-glass-quantity"
            type="number"
            min="1"
            disabled={disabled}
            value={quantity}
            placeholder="1"
            onChange={(e) => onQuantityChange(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Altura */}
        <div>
          <label htmlFor="glass-height" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Altura (mm) *
          </label>
          <input
            id="glass-height"
            data-testid="input-glass-height"
            type="number"
            min="1"
            disabled={disabled}
            value={heightMm}
            placeholder="2000"
            onChange={(e) => onHeightChange(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-mono font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Largura */}
        <div>
          <label htmlFor="glass-width" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Largura (mm) *
          </label>
          <input
            id="glass-width"
            data-testid="input-glass-width"
            type="number"
            min="1"
            disabled={disabled}
            value={widthMm}
            placeholder="1000"
            onChange={(e) => onWidthChange(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-mono font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Preço Unitário */}
        <div>
          <label htmlFor="glass-price" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Preço m² (R$) *
          </label>
          <input
            id="glass-price"
            data-testid="input-glass-price"
            type="number"
            min="0"
            step="0.01"
            disabled={disabled}
            value={unitPrice}
            placeholder="0.00"
            onChange={(e) => onPriceChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-mono font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Painel Informativo: Piso Mínimo & Cálculo em Tempo Real */}
      <div 
        data-testid="panel-calculated-glass-area"
        className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          {showMinimumAreaWarning ? (
            <p data-testid="warning-minimum-area" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
               Piso Mínimo Aplicado (0,25 m² por peça)
            </p>
          ) : (
             <p className="text-[11px] text-slate-500 dark:text-slate-400">Dimensões acima do piso mínimo padrão.</p>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Área Faturável</span>
              <span className="text-slate-900 dark:text-slate-100">{calculatedArea !== undefined ? calculatedArea.toFixed(4) : '0.0000'} m²</span>
           </div>
           <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Subtotal</span>
              <span className="text-cyan-700 dark:text-cyan-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice || 0)}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}