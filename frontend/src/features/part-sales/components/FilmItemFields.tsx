import React from 'react';

interface FilmItemFieldsProps {
  widthMm: number | '';
  heightMm: number | '';
  quantity: number | '';
  unitPrice: number | '';
  lossFactor: number;
  disabled?: boolean;
  onWidthChange: (val: number | '') => void;
  onHeightChange: (val: number | '') => void;
  onQuantityChange: (val: number | '') => void;
  onPriceChange: (val: number | '') => void;
  onLossFactorChange: (val: number) => void;
  calculatedArea?: number;
  totalPrice?: number;
}

export function FilmItemFields({
  widthMm,
  heightMm,
  quantity,
  unitPrice,
  lossFactor,
  disabled = false,
  onWidthChange,
  onHeightChange,
  onQuantityChange,
  onPriceChange,
  onLossFactorChange,
  calculatedArea,
  totalPrice,
}: FilmItemFieldsProps) {
  
  // Validação para largura padrão de bobina comercial (1520mm / 1.52m)
  const isOversized = typeof widthMm === 'number' && widthMm > 1520;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/30 pb-2">
        <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Medidas e Bobina</span>
        <span
          data-testid="badge-film-category"
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
        >
          Película (m²)
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Quantidade */}
        <div>
          <label htmlFor="film-qty" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Qtd *
          </label>
          <input
            id="film-qty"
            data-testid="input-film-quantity"
            type="number"
            min="1"
            disabled={disabled}
            value={quantity}
            placeholder="1"
            onChange={(e) => onQuantityChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Altura */}
        <div>
          <label htmlFor="film-height" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Altura (mm) *
          </label>
          <input
            id="film-height"
            data-testid="input-film-height"
            type="number"
            min="1"
            disabled={disabled}
            value={heightMm}
            placeholder="2000"
            onChange={(e) => onHeightChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Largura */}
        <div>
          <label htmlFor="film-width" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Largura (mm) *
          </label>
          <input
            id="film-width"
            data-testid="input-film-width"
            type="number"
            min="1"
            disabled={disabled}
            value={widthMm}
            placeholder="1000"
            onChange={(e) => onWidthChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg outline-none font-mono font-bold focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              isOversized 
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-600 dark:text-rose-400' 
                : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500'
            }`}
          />
        </div>

        {/* Perda Bobina */}
        <div>
          <label htmlFor="film-loss" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Perda (%) *
          </label>
          <input
            id="film-loss"
            data-testid="input-film-loss"
            type="number"
            min="0"
            step="1"
            disabled={disabled}
            value={Math.round(lossFactor * 100)}
            onChange={(e) => onLossFactorChange(e.target.value === '' ? 0 : parseFloat(e.target.value) / 100)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Preço Unitário */}
        <div>
          <label htmlFor="film-price" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Preço m² (R$) *
          </label>
          <input
            id="film-price"
            data-testid="input-film-price"
            type="number"
            min="0"
            step="0.01"
            disabled={disabled}
            value={unitPrice}
            placeholder="0.00"
            onChange={(e) => onPriceChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {isOversized && (
        <p data-testid="warning-film-oversized" className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          Atenção: A largura excedeu 1520mm (1.52m), limite padrão comercial da maioria das bobinas de película.
        </p>
      )}

      {/* Painel Informativo: Cálculo de Perda & Subtotal */}
      <div 
        data-testid="panel-calculated-film-area"
        className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Área líquida com acréscimo de <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round(lossFactor * 100)}%</span> de perda de corte.
        </p>
        
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Área Cobrada</span>
              <span className="text-slate-900 dark:text-slate-100">{calculatedArea !== undefined ? calculatedArea.toFixed(4) : '0.0000'} m²</span>
           </div>
           <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Subtotal</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice || 0)}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}