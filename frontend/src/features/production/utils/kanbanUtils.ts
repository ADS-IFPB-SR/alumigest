import type { Order, OrderSummary } from '../../orders/types';
import type { ProductionColumnConfig } from '../types';

/**
 * Configurações visuais e estruturais das três colunas do Kanban de Produção (US-18.4).
 */
export const KANBAN_COLUMNS: ProductionColumnConfig[] = [
  {
    id: 'WAITING_PRODUCTION',
    alias: 'AGUARDANDO_PRODUCAO',
    title: 'Aguardando Produção',
    subtitle: 'Fila de corte e usinagem',
    emptyMessage: 'Nenhum pedido aguardando produção',
    color: {
      bg: 'bg-amber-50/40',
      border: 'border-amber-200/80',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-300',
      iconBg: 'bg-amber-100 text-amber-700',
      iconColor: 'text-amber-700',
      dropHighlight: 'ring-2 ring-amber-400 border-amber-400 bg-amber-50/70',
    },
  },
  {
    id: 'IN_PRODUCTION',
    alias: 'EM_PRODUCAO',
    title: 'Em Produção',
    subtitle: 'Em montagem na fábrica',
    emptyMessage: 'Nenhum pedido em processo de fabricação',
    color: {
      bg: 'bg-blue-50/40',
      border: 'border-blue-200/80',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      badgeBorder: 'border-blue-300',
      iconBg: 'bg-blue-100 text-blue-700',
      iconColor: 'text-blue-700',
      dropHighlight: 'ring-2 ring-blue-400 border-blue-400 bg-blue-50/70',
    },
  },
  {
    id: 'COMPLETED',
    alias: 'CONCLUIDO',
    title: 'Concluído',
    subtitle: 'Pronto para expedição',
    emptyMessage: 'Nenhum pedido concluído recentemente',
    color: {
      bg: 'bg-emerald-50/40',
      border: 'border-emerald-200/80',
      text: 'text-emerald-900',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700',
      iconColor: 'text-emerald-700',
      dropHighlight: 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50/70',
    },
  },
];

/**
 * Auxiliar para somar o número total de esquadrias físicas a partir de uma lista mista de pedidos.
 */
export const calculateTotalPieces = (orderList: (Order | OrderSummary)[]): number => {
  return orderList.reduce((acc, order) => {
    if ('quantidadeItens' in order && typeof order.quantidadeItens === 'number') {
      return acc + order.quantidadeItens;
    }
    if ('items' in order && Array.isArray(order.items)) {
      return acc + order.items.reduce((sum, item) => sum + (item.quantidade || 1), 0);
    }
    return acc;
  }, 0);
};
