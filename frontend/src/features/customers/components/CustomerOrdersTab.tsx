import React, { useState } from 'react';
import { ClipboardList, Printer, Tag, ChevronDown, ChevronRight, Info, Eye, EyeOff } from 'lucide-react';
import type { ClientOrderSummaryDTO, ClientOrderItemDTO, OrderStatus } from '../services/customersApi';
import { formatDate, formatCurrency } from '../utils/customerHubUtils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../orders/types/order';

interface CustomerOrdersTabProps {
  orders: ClientOrderSummaryDTO[];
  isLoading?: boolean;
  onOpenTechSheet?: (orderId: string) => void;
  onOpenLabels?: (orderId: string) => void;
}

function getOrderStatusBadge(status: OrderStatus, label?: string) {
  const displayLabel = label ?? ORDER_STATUS_LABELS[status] ?? status;
  // Nota: Assume-se que ORDER_STATUS_COLORS utilize os tokens M3 em sua declaração atual ou futura
  const colors = ORDER_STATUS_COLORS[status] ?? ORDER_STATUS_COLORS.CREATED;
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
      <div className="p-8 text-center text-sm text-on-surface-variant">
        Carregando ordens de serviço...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs">
        <ClipboardList className="w-10 h-10 mx-auto text-outline opacity-50 mb-3" />
        <p className="text-sm font-semibold text-on-surface">
          Nenhuma O.S. vinculada a este cliente
        </p>
        <p className="text-xs text-on-surface-variant mt-1">
          As ordens de serviço aparecerão aqui após a conversão de um orçamento aprovado.
        </p>
      </div>
    );
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="space-y-3">
      {/* Visual hint for row inspection */}
      <div className="flex items-center justify-between px-1 text-xs text-on-surface-variant">
        <span className="inline-flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          Clique em "Ver Peças" para inspecionar esquadrias, acabamentos e emitir Ficha Técnica / Etiquetas.
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container border-b border-outline-variant uppercase tracking-wider text-[11px] text-on-surface-variant font-bold">
              <tr>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Código O.S.</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Data</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Situação Fabril</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Valor Total</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Esquadrias</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-on-surface">
              {orders.map((order) => {
                const isSelected = order.id === selectedOrderId;
                return (
                  <tr
                    key={order.id}
                    title="Clique para inspecionar as esquadrias e medidas nominais desta O.S."
                    onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary-container/20 border-l-2 border-l-primary'
                        : 'hover:bg-surface-container-high border-l-2 border-transparent'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-on-surface whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isSelected ? (
                          <ChevronDown className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-on-surface-variant opacity-70 shrink-0" />
                        )}
                        <span className="inline-block px-2 py-0.5 rounded bg-surface-container-highest text-on-surface text-xs">
                          {order.codigo}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant font-medium whitespace-nowrap">
                      {formatDate(order.data)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getOrderStatusBadge(order.status, order.statusDescricao)}
                    </td>
                    <td className="py-3 px-3 font-bold text-on-surface text-sm whitespace-nowrap">
                      {formatCurrency(order.valorTotal)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                        {order.totalEsquadrias} {order.totalEsquadrias === 1 ? 'peça' : 'peças'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        aria-label={`Ver peças da O.S. ${order.codigo}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(isSelected ? null : order.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-xs hover:opacity-90'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar Peças</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span>Ver Peças</span>
                          </>
                        )}
                      </button>
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
    <div className="bg-surface-container-lowest border-2 border-primary/30 rounded-xl overflow-hidden shadow-xs transition-all">
      <div className="px-4 py-3 bg-primary-container/20 border-b border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-on-surface">
            Esquadrias da O.S. <span className="font-mono">{order.codigo}</span>
          </span>
          <span className="text-xs text-primary font-medium">
            ({order.totalEsquadrias} {order.totalEsquadrias === 1 ? 'peça' : 'peças'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Ficha técnica da O.S. ${order.codigo}`}
            onClick={() => onOpenTechSheet?.(order.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface shadow-2xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-error" />
            <span>Ficha Técnica</span>
          </button>
          <button
            type="button"
            aria-label={`Etiquetas da O.S. ${order.codigo}`}
            onClick={() => onOpenLabels?.(order.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface shadow-2xs transition"
          >
            <Tag className="w-3.5 h-3.5 text-primary" />
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
    <div className="border border-outline-variant rounded-lg p-3 bg-surface-container space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-on-surface leading-tight">
          {item.descricao}
        </p>
        <span className="shrink-0 text-xs text-on-surface-variant font-medium">
          {item.quantidade}x
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container/50 border border-secondary/30 text-on-secondary-container text-xs font-mono font-semibold"
          aria-label={`Medidas: ${item.larguraMm} por ${item.alturaMm} milímetros`}
        >
          📐 {item.larguraMm} x {item.alturaMm} mm
        </span>
      </div>
      <div className="space-y-1">
        {item.corAluminio && (
          <p className="text-[11px] text-on-surface-variant">
            <span className="font-medium text-on-surface">Alumínio:</span> {item.corAluminio}
          </p>
        )}
        {item.tipoVidro && (
          <p className="text-[11px] text-on-surface-variant">
            <span className="font-medium text-on-surface">Vidro:</span> {item.tipoVidro}
          </p>
        )}
      </div>
      <div className="pt-2 border-t border-outline-variant/50 mt-1">
        <p className="text-xs font-bold text-on-surface text-right">
          {formatCurrency(item.valorTotal)}
        </p>
      </div>
    </div>
  );
};