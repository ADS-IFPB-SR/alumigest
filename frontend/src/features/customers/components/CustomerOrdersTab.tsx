import React, { useState } from 'react';
import { FileText, ClipboardList, Printer, Tag } from 'lucide-react';
import type { ClientOrderSummaryDTO, ClientOrderItemDTO } from '../services/customersApi';
import { formatDate, formatCurrency } from '../utils/customerHubUtils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../orders/types/order';
import type { OrderStatus } from '../services/customersApi';

interface CustomerOrdersTabProps {
  orders: ClientOrderSummaryDTO[];
  isLoading?: boolean;
  onOpenTechSheet?: (orderId: string) => void;
  onOpenLabels?: (orderId: string) => void;
}

function getOrderStatusBadge(status: OrderStatus, label?: string) {
  const displayLabel = label || ORDER_STATUS_LABELS[status] || status;
  const colors = ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.CREATED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
      {displayLabel}
    </span>
  );
}

export const CustomerOrdersTab: React.FC<CustomerOrdersTabProps> = ({
  orders,
  isLoading = false,
  onOpenTechSheet,
  onOpenLabels,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (isLoading && orders.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Carregando ordens de serviço...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <ClipboardList className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nenhuma O.S. vinculada a este cliente
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          As ordens de serviço aparecerão aqui após a conversão de um orçamento aprovado.
        </p>
      </div>
    );
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="space-y-4">
      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Código O.S.</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Data</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Situação Fabril</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Valor Total</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Esquadrias</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {orders.map((order) => {
                const isSelected = order.id === selectedOrderId;
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-500/10 dark:bg-blue-500/10 border-l-2 border-l-blue-500'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                        {order.codigo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(order.data)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getOrderStatusBadge(order.status, order.statusDescricao)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 text-sm whitespace-nowrap">
                      {formatCurrency(order.valorTotal)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {order.totalEsquadrias} {order.totalEsquadrias === 1 ? 'peça' : 'peças'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Ficha técnica da O.S. ${order.codigo}`}
                          onClick={(e) => { e.stopPropagation(); onOpenTechSheet?.(order.id); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-500" />
                          <span>Ficha Técnica</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Etiquetas da O.S. ${order.codigo}`}
                          onClick={(e) => { e.stopPropagation(); onOpenLabels?.(order.id); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                        >
                          <Tag className="w-3.5 h-3.5 text-blue-500" />
                          <span>Etiquetas</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Drawer - shown when an order is selected */}
      {selectedOrder && (
        <CustomerOrderItemsDrawer order={selectedOrder} onOpenTechSheet={onOpenTechSheet} onOpenLabels={onOpenLabels} />
      )}
    </div>
  );
};

interface CustomerOrderItemsDrawerProps {
  order: ClientOrderSummaryDTO;
  onOpenTechSheet?: (orderId: string) => void;
  onOpenLabels?: (orderId: string) => void;
}

const CustomerOrderItemsDrawer: React.FC<CustomerOrderItemsDrawerProps> = ({ order, onOpenTechSheet, onOpenLabels }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-blue-50/60 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            Esquadrias da O.S. <span className="font-mono">{order.codigo}</span>
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400">
            ({order.totalEsquadrias} {order.totalEsquadrias === 1 ? 'peça' : 'peças'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Ficha técnica da O.S. ${order.codigo}`}
            onClick={() => onOpenTechSheet?.(order.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Ficha Técnica</span>
          </button>
          <button
            type="button"
            aria-label={`Etiquetas da O.S. ${order.codigo}`}
            onClick={() => onOpenLabels?.(order.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 transition"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Etiquetas</span>
          </button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {order.items.map((item) => (
          <OrderItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const OrderItemCard: React.FC<{ item: ClientOrderItemDTO }> = ({ item }) => {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
          {item.descricao}
        </p>
        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {item.quantidade}x
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-mono font-semibold"
          aria-label={`Medidas: ${item.larguraMm} por ${item.alturaMm} milímetros`}
        >
          📐 {item.larguraMm} x {item.alturaMm} mm
        </span>
      </div>
      <div className="space-y-1">
        {item.corAluminio && (
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-medium">Alumínio:</span> {item.corAluminio}
          </p>
        )}
        {item.tipoVidro && (
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-medium">Vidro:</span> {item.tipoVidro}
          </p>
        )}
      </div>
      <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 text-right">
          {formatCurrency(item.valorTotal)}
        </p>
      </div>
    </div>
  );
};
