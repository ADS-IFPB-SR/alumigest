import { api } from '../../../lib/api';
import { extractFilenameFromContentDisposition } from '../../budgets/services/budgetsApi';
import type {
  Order,
  OrderCancelRequest,
  OrderConvertRequest,
  OrderFilterParams,
  OrderSummary,
} from '../types';

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export type OrderPageResponse = PageResponse<OrderSummary>;

export const ordersApi = {
  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Converte um orçamento aprovado em pedido de venda (US-13.2 / US-13.3).
   * Chama o endpoint backend POST /api/v1/orders/convert/{budgetId}.
   */
  async convertBudget(budgetId: string, data: OrderConvertRequest): Promise<Order> {
    const response = await api.post<Order>(`/orders/convert/${budgetId}`, data);
    return response.data;
  },

  async cancelOrder(id: string, data: OrderCancelRequest): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/cancel`, data);
    return response.data;
  },

  /**
   * Baixa o comprovante oficial do Pedido de Venda em PDF (US-16.1 / #364).
   * Chama GET /api/v1/orders/{id}/pdf/comprovante e inicia o download via Blob.
   */
  async downloadComprovantePdf(id: string, codigo?: string): Promise<void> {
    const response = await api.get(`/orders/${id}/pdf/comprovante`, {
      responseType: 'blob',
    });

    const fallbackFilename = `comprovante-${codigo ?? id}.pdf`;
    const disposition = (
      response.headers?.['content-disposition'] ||
      response.headers?.['Content-Disposition']
    ) as string | undefined;
    const filename = extractFilenameFromContentDisposition(disposition, fallbackFilename);

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Lista pedidos de venda com paginação e filtros dinâmicos (US-13.4).
   */
  async getOrders(params?: OrderFilterParams): Promise<PageResponse<OrderSummary>> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    };

    const search = params?.search;
    if (search && search.trim().length >= 2) {
      queryParams.search = search.trim();
    }

    const channel = params?.channel;
    if (channel) {
      queryParams.channel = channel;
    }

    if (params?.status) {
      queryParams.status = params.status;
    }

    const response = await api.get<any>('/orders', {
      params: queryParams,
    });

    const data = response.data || {};
    const pageNumber = data.page?.number ?? data.number ?? (typeof data.page === 'number' ? data.page : queryParams.page);
    const pageSize = data.page?.size ?? data.size ?? queryParams.size;
    const totalElements = data.page?.totalElements ?? data.totalElements ?? 0;
    const totalPages = data.page?.totalPages ?? data.totalPages ?? 1;

    return {
      content: data.content || [],
      page: {
        size: Number(pageSize),
        number: Number(pageNumber),
        totalElements: Number(totalElements),
        totalPages: Number(totalPages),
      },
      totalElements: Number(totalElements),
      totalPages: Number(totalPages),
      size: Number(pageSize),
      number: Number(pageNumber),
    };
  },
};

export const orderApi = ordersApi;
