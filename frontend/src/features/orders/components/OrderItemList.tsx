import React from 'react';
import { Package, Layers } from 'lucide-react';
import type { OrderItem } from '../types';
import { formatBRL } from '../../budgets/utils/calculations';

interface OrderItemListProps {
  items?: OrderItem[];
}

export const OrderItemList: React.FC<OrderItemListProps> = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <div
        className="p-8 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-high/20"
        data-testid="order-items-empty"
      >
        <Package className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-50" />
        <p className="text-sm text-on-surface-variant">Nenhum item registrado para este pedido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="order-items-container">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Itens de Produção ({items.length})
        </h3>
        <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md font-medium">
          Lock de Preços & Especificações
        </span>
      </div>

      <div className="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest shadow-xs">
        <table className="min-w-[860px] w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface-container-high/50 border-b border-outline-variant text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              <th className="py-3 px-2 w-12 text-center">#</th>
              <th className="py-3 px-4 min-w-[240px]">Descrição da Tipologia</th>
              <th className="py-3 px-3 w-36 text-center whitespace-nowrap">Dimensões (L × A)</th>
              <th className="py-3 px-4 min-w-[280px]">Acabamentos & Especificações</th>
              <th className="py-3 px-2 w-14 text-center">Qtd</th>
              <th className="py-3 px-3 w-28 text-right whitespace-nowrap">Unitário</th>
              <th className="py-3 px-4 w-32 text-right whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-surface-container-high/20 transition-colors"
                data-testid={`order-item-row-${item.id}`}
              >
                <td className="py-3.5 px-2 text-center font-data-mono text-xs text-on-surface-variant">
                  {item.ordem || index + 1}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-on-surface text-sm leading-snug">{item.descricao}</div>
                  {item.options && item.options.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1 text-xs">
                      {item.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded text-[11px]"
                        >
                          {opt.materialName} ({opt.quantity} {opt.unitMeasure})
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                  <span className="inline-block px-2.5 py-1 rounded bg-surface-container-high/60 font-data-mono text-xs text-on-surface font-medium">
                    {item.larguraMm} × {item.alturaMm} mm
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1 text-xs">
                    {item.corAluminio && (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-on-surface-variant font-medium shrink-0">Alumínio:</span>
                        <span className="font-semibold text-on-surface">{item.corAluminio}</span>
                      </div>
                    )}
                    {item.tipoVidro && (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-on-surface-variant font-medium shrink-0">Vidro:</span>
                        <span className="font-semibold text-on-surface">{item.tipoVidro}</span>
                      </div>
                    )}
                    {item.orientacaoAbertura && (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-on-surface-variant font-medium shrink-0">Abertura:</span>
                        <span className="font-semibold text-on-surface">{item.orientacaoAbertura}</span>
                      </div>
                    )}
                    {item.ferragens && (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-on-surface-variant font-medium shrink-0">Ferragens:</span>
                        <span className="font-semibold text-on-surface">{item.ferragens}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-2 text-center font-data-mono font-bold text-on-surface text-sm">
                  {item.quantidade}
                </td>
                <td className="py-3.5 px-3 text-right font-data-mono text-xs text-on-surface-variant whitespace-nowrap">
                  {formatBRL(item.valorUnitario)}
                </td>
                <td className="py-3.5 px-4 text-right font-data-mono font-bold text-sm text-on-surface whitespace-nowrap">
                  {formatBRL(item.valorTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
