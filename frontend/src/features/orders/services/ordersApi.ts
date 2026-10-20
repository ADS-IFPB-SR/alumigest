import { api } from '../../../lib/api';
import { extractFilenameFromContentDisposition } from '../../budgets/services/budgetsApi';
import {
  demoOrder,
  demoOrderSummaries,
  generateDemoThermalLabelsPdf,
} from '../mocks/demoOrdersData';
import type {
  Order,
  OrderCancelRequest,
  OrderConvertRequest,
  OrderFilterParams,
  OrderStatus,
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

function isDevBackendOffline(error: any): boolean {
  if (!import.meta.env.DEV) return false;
  if (!error?.response) return true;
  const status = error.response?.status;
  return typeof status === 'number' && status >= 500;
}

async function ensureErrorDataDeserialized(error: any): Promise<void> {
  const data = error?.response?.data;
  if (data instanceof Blob || (data && typeof data.text === 'function')) {
    try {
      const text = await data.text();
      const json = JSON.parse(text);
      error.response.data = json;
      if (json.message && !error.message) {
        error.message = json.message;
      }
    } catch {
      // Fallback: mantém o Blob intacto se não for possível converter em JSON
    }
  }
}

function buildOrderQueryParams(params?: OrderFilterParams): Record<string, string | number> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 0,
    size: params?.size ?? 10,
  };

  const search = params?.search?.trim();
  if (search && search.length >= 2) {
    queryParams.search = search;
  }

  if (params?.channel) {
    queryParams.channel = params.channel;
  }

  if (params?.status) {
    queryParams.status = params.status;
  }

  return queryParams;
}

function parsePageResponse(data: any, queryParams: Record<string, string | number>): PageResponse<OrderSummary> {
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
}

function getDemoOrdersPage(params?: OrderFilterParams): PageResponse<OrderSummary> {
  let filtered = [...demoOrderSummaries];
  if (params?.status) {
    filtered = filtered.filter((o) => o.status === params.status);
  }
  if (params?.channel) {
    filtered = filtered.filter((o) => o.canalAprovacao === params.channel);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.codigo.toLowerCase().includes(s) ||
        o.clienteNome.toLowerCase().includes(s)
    );
  }
  const size = Number(params?.size ?? 10);
  const number = Number(params?.page ?? 0);
  return {
    content: filtered,
    page: {
      size,
      number,
      totalElements: filtered.length,
      totalPages: 1,
    },
    totalElements: filtered.length,
    totalPages: 1,
    size,
    number,
  };
}

export const ordersApi = {
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      if (isDevBackendOffline(error)) {
        console.info('[AlumiGest Dev Demo] Backend offline. Fornecendo dados de demonstração da O.S.');
        return { ...demoOrder, id };
      }
      throw error;
    }
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

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  /**
   * Baixa o comprovante oficial do Pedido de Venda em PDF (US-16.1 / #364).
   * Chama GET /api/v1/orders/{id}/pdf/comprovante e inicia o download via Blob.
   */
  async downloadComprovantePdf(id: string, codigo?: string): Promise<void> {
    try {
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
    } catch (error: any) {
      await ensureErrorDataDeserialized(error);
      throw error;
    }
  },

  /**
   * Baixa as etiquetas térmicas adesivas (100x60mm) da Ordem de Serviço em PDF (US-17.2 / US-17.4 / #451).
   * Chama GET /api/v1/orders/{id}/labels-pdf com suporte a filtro opcional por item e inicia o download via Blob.
   */
  async downloadLabelsPdf(id: string, codigo?: string, itemId?: string): Promise<void> {
    let blob: Blob;
    const fallbackFilename = `etiquetas-${codigo ?? id}.pdf`;
    let filename = fallbackFilename;

    try {
      const response = await api.get(`/orders/${id}/labels-pdf`, {
        params: itemId ? { itemId } : undefined,
        responseType: 'blob',
      });

      const disposition = (
        response.headers?.['content-disposition'] ||
        response.headers?.['Content-Disposition']
      ) as string | undefined;
      filename = extractFilenameFromContentDisposition(disposition, fallbackFilename);
      blob = new Blob([response.data], { type: 'application/pdf' });
    } catch (error: any) {
      await ensureErrorDataDeserialized(error);
      if (isDevBackendOffline(error)) {
        console.info('[AlumiGest Dev Demo] Backend offline. Gerando PDF térmico de demonstração.');
        blob = generateDemoThermalLabelsPdf();
      } else {
        throw error;
      }
    }

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
    const queryParams = buildOrderQueryParams(params);

    try {
      const response = await api.get<any>('/orders', {
        params: queryParams,
      });
      return parsePageResponse(response.data || {}, queryParams);
    } catch (error: any) {
      if (isDevBackendOffline(error)) {
        console.info('[AlumiGest Dev Demo] Backend offline. Exibindo lista de demonstração de O.S.');
        return getDemoOrdersPage(params);
      }
      throw error;
    }
  },
};

export const orderApi = ordersApi;
