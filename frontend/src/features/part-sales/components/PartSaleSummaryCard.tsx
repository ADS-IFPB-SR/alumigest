import { FileText, Printer, CheckCircle, Save } from 'lucide-react';
import type { PartSaleItemDraft } from '../types';

interface PartSaleSummaryCardProps {
  readonly items: PartSaleItemDraft[];
  readonly discount: number;
  readonly onDiscountChange: (discount: number) => void;
  readonly onSaveDraft: () => void;
  readonly onApproveSale: () => void;
  readonly onExportPdf: () => void;
  readonly onPrintLabels: () => void;
  readonly isSaving?: boolean;
}

export function PartSaleSummaryCard({
  items,
  discount,
  onDiscountChange,
  onSaveDraft,
  onApproveSale,
  onExportPdf,
  onPrintLabels,
  isSaving = false,
}: PartSaleSummaryCardProps) {
  const totalPieces = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalAreaSqm = items.reduce((acc, item) => acc + (item.calculatedAreaSqm || 0), 0);

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  const totalAmount = Math.max(0, subtotal - (discount || 0));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6 sticky top-24">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Resumo da Venda</h3>
        <p className="text-[11px] text-slate-500">Valores calculados em tempo real</p>
      </div>

      {/* Métricas Rápidas */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Total de Peças:</span>
          <span id="summaryTotalPieces" className="font-bold text-slate-800">
            {totalPieces}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Área / Medida Total:</span>
          <span id="summaryTotalMeasure" className="font-bold text-slate-800">
            {totalAreaSqm > 0 ? `${totalAreaSqm.toFixed(2)} m²` : '-'}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Subtotal Bruto:</span>
          <span id="summarySubtotal" className="font-bold text-slate-800">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <label htmlFor="discountInput">Desconto (R$):</label>
          <input
            type="number"
            id="discountInput"
            value={discount || ''}
            min="0"
            max={subtotal}
            step="1.00"
            placeholder="0,00"
            onChange={(e) => {
              const val = Number.parseFloat(e.target.value);
              onDiscountChange(Number.isNaN(val) ? 0 : Math.max(0, val));
            }}
            className="w-24 text-right px-2 py-1 text-xs border border-slate-300 rounded font-semibold bg-white focus:ring-1 focus:ring-navy-900 outline-none"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Destaque do Valor Total */}
      <div className="bg-white border border-slate-300 p-4 rounded-xl text-center space-y-1 shadow-sm">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          VALOR TOTAL DA VENDA
        </span>
        <div id="summaryTotalValue" className="text-3xl font-extrabold text-navy-900 tracking-tight font-mono">
          {formatCurrency(totalAmount)}
        </div>
      </div>

      {/* Ações de Finalização */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onApproveSale}
          disabled={isSaving || items.length === 0}
          className="w-full py-2.5 px-4 bg-navy-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" /> Aprovar Venda
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving || items.length === 0}
          className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-slate-600" /> Salvar Rascunho
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onExportPdf}
            disabled={items.length === 0}
            className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-red-600" /> Exportar PDF
          </button>

          <button
            type="button"
            onClick={onPrintLabels}
            disabled={items.length === 0}
            className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" /> Etiquetas
          </button>
        </div>
      </div>
    </div>
  );
}

