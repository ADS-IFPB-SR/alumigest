import React from 'react';
import type { MaterialSelection } from '../../types';
import { formatBRL, calcItemSubtotal } from '../../utils/calculations';

interface ItemPriceSummaryProps {
  selections: MaterialSelection[];
  laborCost: number;
  quantity: number | '';
  widthMm: number | '';
  heightMm: number | '';
}

export const ItemPriceSummary: React.FC<ItemPriceSummaryProps> = ({
  selections,
  laborCost,
  quantity,
  widthMm,
  heightMm,
}) => {
  const hasDimensions = widthMm && heightMm && +widthMm > 0 && +heightMm > 0;
  const qty = typeof quantity === 'number' && quantity >= 1 ? quantity : 1;

  const subtotal = React.useMemo(() => {
    if (!hasDimensions) return 0;
    return calcItemSubtotal(
      selections.map((s) => ({ quantity: s.calculatedQty, unitPrice: s.unitPrice })),
      laborCost,
      qty,
    );
  }, [selections, laborCost, qty, hasDimensions]);

  const materialsTotal = selections.reduce((acc, s) => acc + s.totalPrice, 0);
  const laborTotal = laborCost * qty;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-primary text-on-primary px-md py-sm">
        <h4 className="font-label font-semibold text-sm">Subtotal do Item</h4>
      </div>

      <div className="p-md flex flex-col gap-xs">
        {/* Materiais */}
        {selections.filter((s) => s.materialId).map((s) => (
          <div key={s.requirementId} className="flex justify-between items-center text-xs border-b border-outline-variant border-dashed py-xs">
            <div className="flex flex-col">
              <span className="text-on-surface font-medium">{s.materialName || s.label}</span>
              <span className="text-on-surface-variant font-data-mono">
                {s.calculatedQty} {s.unitMeasure} × {formatBRL(s.unitPrice)}
              </span>
            </div>
            <span className="font-data-mono text-on-surface font-semibold whitespace-nowrap ml-sm">
              {formatBRL(s.totalPrice)}
            </span>
          </div>
        ))}

        {/* Sem materiais */}
        {selections.filter((s) => s.materialId).length === 0 && (
          <p className="text-xs text-on-surface-variant italic text-center py-sm">
            Selecione os materiais acima
          </p>
        )}

        {/* Mão de Obra */}
        {laborCost > 0 && (
          <div className="flex justify-between items-center text-xs py-xs border-b border-outline-variant border-dashed">
            <span className="text-on-surface-variant">Mão de Obra ({qty}× )</span>
            <span className="font-data-mono text-on-surface">{formatBRL(laborTotal)}</span>
          </div>
        )}

        {/* Materiais subtotal */}
        {materialsTotal > 0 && (
          <div className="flex justify-between items-center text-xs py-xs text-on-surface-variant">
            <span>Materiais</span>
            <span className="font-data-mono">{formatBRL(materialsTotal)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-outline mt-xs pt-sm flex justify-between items-center">
          <span className="font-label font-bold text-on-surface text-sm">
            Total do Item {qty > 1 ? `(${qty}×)` : ''}
          </span>
          <span className={`font-data-mono font-bold text-lg ${subtotal > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
            {subtotal > 0 ? formatBRL(subtotal) : '—'}
          </span>
        </div>

        {!hasDimensions && (
          <p className="text-xs text-on-surface-variant italic text-center">
            Informe as dimensões para calcular
          </p>
        )}
      </div>
    </div>
  );
};
